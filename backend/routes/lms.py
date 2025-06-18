# backend/routes/lms.py

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import List
from services.context_retriever import get_vector_retriever
from langchain_openai import ChatOpenAI
from utils.logger import logger

router = APIRouter()

class LmsRequest(BaseModel):
    filename: str

class Question(BaseModel):
    question: str
    options: List[str]
    correct: str
    explanation: str

class LmsResponse(BaseModel):
    questions: List[Question]

@router.post("/lms/questions", response_model=LmsResponse)
async def generate_lms_questions(request: Request, body: LmsRequest):
    org_id = request.headers.get("x-org-id")
    if not org_id:
        raise HTTPException(status_code=400, detail="Missing organisation ID.")

    retriever = get_vector_retriever(
        org_id=org_id,
        extra_filter={"source": body.filename},
        top_k=10
    )

    chunks = await retriever.ainvoke(body.filename)
    content = "\n\n".join([doc.page_content for doc in chunks if doc.page_content.strip()])
    if not content:
        raise HTTPException(status_code=404, detail="No content found for this file.")

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
        questions = eval(response.content.strip())
        return { "questions": questions }
    except Exception as e:
        logger.error(f"[LMS] Failed to generate questions: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate questions.")
