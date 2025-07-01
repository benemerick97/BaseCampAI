# backend/routes/lms.py

from fastapi import APIRouter, Request, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from uuid import UUID
from sqlalchemy.orm import Session

from services.context_retriever import get_vector_retriever
from langchain_openai import ChatOpenAI
from databases.database import get_db
from CRUD.document import get_document_object, get_document_file
from utils.logger import logger

router = APIRouter()

# ---------------------------
# Request & Response Schemas
# ---------------------------
class LmsRequest(BaseModel):
    document_id: UUID

class Question(BaseModel):
    question: str
    options: List[str]
    correct: str
    explanation: str

class LmsResponse(BaseModel):
    questions: List[Question]

# ---------------------------
# LMS Quiz Generation Endpoint
# ---------------------------
@router.post("/lms/questions", response_model=LmsResponse)
async def generate_lms_questions(
    request: Request,
    body: LmsRequest,
    db: Session = Depends(get_db),
):
    org_id = request.headers.get("x-org-id")
    if not org_id:
        raise HTTPException(status_code=400, detail="Missing organisation ID.")

    try:
        org_id_int = int(org_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid organisation ID format.")

    # Fetch document and file info
    doc = get_document_object(db, body.document_id)
    if not doc or doc.org_id != org_id_int:
        raise HTTPException(status_code=404, detail="Document not found or not authorised")

    file_record = get_document_file(db, doc.current_file_id)
    if not file_record:
        raise HTTPException(status_code=404, detail="File record not found")

    # Build retriever with proper filter
    filter_metadata = {
        "source": str(doc.id),
        "org_id": org_id_int,
    }

    retriever = get_vector_retriever(
        org_id=org_id_int,
        extra_filter=filter_metadata,
        top_k=10
    )

    # Retrieve relevant content using a generic prompt
    chunks = await retriever.ainvoke("training material")

    content = "\n\n".join([doc.page_content for doc in chunks if doc.page_content.strip()])
    if not content:
        raise HTTPException(status_code=404, detail="No content found for this document.")

    # Prompt LLM to generate quiz questions
    prompt = f"""
You are an assistant creating quiz content from training documents.
Using the following content, generate between 3 and 10 quiz questions that test user understanding.
Each question must include:
- The question
- 3 to 4 answer options
- The correct answer
- A short explanation of the correct answer

Respond in JSON format:
[
  {{
    "question": "...",
    "options": ["A", "B", "C"],
    "correct": "B",
    "explanation": "..."
  }},
  ...
]

Content:
\"\"\"
{content}
\"\"\"
"""

    llm = ChatOpenAI(model="gpt-4", temperature=0.4)
    try:
        response = await llm.ainvoke(prompt)
        questions = eval(response.content.strip())  # Replace with json.loads() for safety if desired
        return {"questions": questions}
    except Exception as e:
        logger.error(f"[LMS] Failed to generate questions: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate questions.")
