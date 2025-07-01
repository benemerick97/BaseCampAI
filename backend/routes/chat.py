#backend/routes/chat.py

from fastapi import APIRouter, Request, Header, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import asyncio

from services.supervisor import handle_supervised_stream

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
async def chat_endpoint(
    req: ChatRequest,
    request: Request,
    x_org_id: str = Header(...)
):
    user_input = req.message.strip()
    org_id = x_org_id
    session_id = request.client.host or "session_default"

    user_profile = {
        "user_department": "Operations",
        "user_role": "Business Improvement Manager",
        "user_location": "Brisbane",
        "user_seniority": "Mid-level"
    }

    # ✅ Catch setup errors before entering stream
    try:
        stream = handle_supervised_stream(
            user_input=user_input,
            session_id=session_id,
            org_id=org_id,
            user_profile=user_profile,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stream setup failed: {str(e)}")

    async def token_streamer():
        yield " "  # force-flush stream start
        try:
            async for chunk in stream:
                await asyncio.sleep(0.01)
                yield chunk if isinstance(chunk, str) else str(chunk)
        except Exception as e:
            yield f"\n[Server error] {str(e)}"

    return StreamingResponse(token_streamer(), media_type="text/plain")
