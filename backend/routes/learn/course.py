# backend/routes/learn/course.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from schemas.learn.course import CourseCreate, CourseOut
from models.document_object import DocumentObject
from CRUD.learn.course import create_course, get_course, list_courses_by_org
from models.document_object import DocumentObject as DocumentModel
from databases.database import get_db
import openai
import os
import json

router = APIRouter(prefix="/courses", tags=["Courses"])

openai.api_key = os.getenv("OPENAI_API_KEY")


def generate_slides_from_text(text: str) -> list[dict]:
    prompt = f"""
You are an instructional designer. Summarise the following training document into 6–10 slides.
Each slide should contain:
- A short title
- 2–4 bullet points explaining the key idea

Return your response in raw JSON like:
[
  {{ "title": "Slide 1 Title", "bullets": ["...", "..."] }},
  ...
]

Document:
{text[:6000]}  # Limit input to avoid token overflow
"""

    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
        )
        return json.loads(response.choices[0].message.content.strip())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"GPT failed: {str(e)}")


@router.post("/", response_model=CourseOut)
def create_course_route(course_data: CourseCreate, db: Session = Depends(get_db)):
    # Step 1: Get document content
    doc: DocumentModel | None = db.query(DocumentModel).filter(DocumentModel.id == course_data.document_id).first()
    if not doc or not doc.current_file:
        raise HTTPException(status_code=404, detail="Document or current file not found")

    # Step 2: Extract document text from current file
    content = doc.current_file.text_content
    if not content:
        raise HTTPException(status_code=400, detail="Document file has no text content")

    # Step 3: Generate slides using GPT
    slides = generate_slides_from_text(content)

    # Step 4: Store course in DB
    return create_course(db, course_data, slides)


@router.get("/", response_model=list[CourseOut])
def list_courses(org_id: int, db: Session = Depends(get_db)):
    return list_courses_by_org(db, org_id)


@router.get("/{course_id}", response_model=CourseOut)
def get_course_route(course_id: str, db: Session = Depends(get_db)):
    course = get_course(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    course.slides = json.loads(course.slides)
    return course
