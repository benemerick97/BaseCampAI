#backend/routes/chat.py

from fastapi import APIRouter, Request, Header, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import asyncio

from services.supervisor import handle_supervised_stream

router = APIRouter()

# 📥 Request model
class ChatRequest(BaseModel):
    message: str

# 🎯 POST /chat
@router.post("/chat")
async def chat_endpoint(
    req: ChatRequest,
    request: Request,
    x_org_id: str = Header(...)  # ✅ Required org_id header
):
    user_input = req.message.strip()

    # ✅ Use provided org_id directly
    org_id = x_org_id
    session_id = request.client.host or "session_default"

    # 🧠 Static user profile (could later come from auth/session)
    user_profile = {
        "user_department": "Operations",
        "user_role": "Business Improvement Manager",
        "user_location": "Brisbane",
        "user_seniority": "Mid-level"
    }

    async def token_streamer():
        try:
            # Start stream immediately
            yield " "  # prevents buffering in some clients

            stream = handle_supervised_stream(
                user_input=user_input,
                session_id=session_id,
                org_id=org_id,
                user_profile=user_profile,
            )

            async for chunk in stream:
                await asyncio.sleep(0.01)  # optional: simulates natural stream
                yield chunk if isinstance(chunk, str) else str(chunk)

        except Exception as e:
            yield f"[Server error] {str(e)}"

    return StreamingResponse(token_streamer(), media_type="text/plain")
