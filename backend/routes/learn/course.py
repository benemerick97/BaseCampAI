# backend/routes/learn/course.py

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from schemas.learn.course import CourseCreate, CourseOut, CourseUpdate
from models.document_object import DocumentObject as DocumentModel
from CRUD.learn.course import (
    create_course,
    get_course,
    list_courses_by_org,
    delete_course,
    update_course,
)
from databases.database import get_db
from services.context_retriever import get_vector_retriever
from openai import OpenAI
import os
import json

router = APIRouter(prefix="/courses", tags=["Courses"])
client = OpenAI()


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
{text[:6000]}
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
        )
        return json.loads(response.choices[0].message.content.strip())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"GPT failed: {str(e)}")


@router.post("/", response_model=CourseOut)
async def create_course_route(
    request: Request,
    course_data: CourseCreate,
    db: Session = Depends(get_db),
):
    try:
        org_id = request.headers.get("x-org-id")
        if not org_id:
            raise HTTPException(status_code=400, detail="Missing organisation ID.")
        try:
            org_id_int = int(org_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid organisation ID format.")

        doc = db.query(DocumentModel).filter(DocumentModel.id == course_data.document_id).first()
        if not doc or not doc.current_file_id or doc.org_id != org_id_int:
            raise HTTPException(status_code=404, detail="Document not found or not authorised")

        filter_metadata = {
            "source": str(doc.id),
            "org_id": org_id_int,
        }

        retriever = get_vector_retriever(org_id=org_id_int, extra_filter=filter_metadata, top_k=10)
        chunks = await retriever.ainvoke("training material")
        content = "\n\n".join([c.page_content for c in chunks if c.page_content.strip()])

        if not content:
            raise HTTPException(status_code=404, detail="No content found for this document.")

        slides = generate_slides_from_text(content)
        course = create_course(db, course_data, slides, org_id_int)
        return course

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Course creation failed: {str(e)}")


@router.get("/", response_model=list[CourseOut])
def list_courses(org_id: int, db: Session = Depends(get_db)):
    return list_courses_by_org(db, org_id)


@router.get("/{course_id}", response_model=CourseOut)
def get_course_route(course_id: str, db: Session = Depends(get_db)):
    course = get_course(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course


@router.delete("/{course_id}", status_code=204)
def delete_course_route(course_id: str, db: Session = Depends(get_db)):
    success = delete_course(db, course_id)
    if not success:
        raise HTTPException(status_code=404, detail="Course not found or could not be deleted")
    return None


@router.put("/{course_id}", response_model=CourseOut)
def update_course_route(
    course_id: str,
    updated_data: CourseUpdate,
    db: Session = Depends(get_db),
):
    updated_course = update_course(db, course_id, updated_data)
    if not updated_course:
        raise HTTPException(status_code=404, detail="Course not found")
    return updated_course
