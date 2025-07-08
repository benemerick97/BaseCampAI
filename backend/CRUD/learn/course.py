#backend/CRUD/learn/course.py

from sqlalchemy.orm import Session
from models.learn.course import Course
from schemas.learn.course import CourseCreate, CourseUpdate 
import uuid
import json
from datetime import datetime


def create_course(db: Session, course_data: CourseCreate, slides: list[dict], org_id: int) -> Course:
    course = Course(
        id=uuid.uuid4(),
        name=course_data.name,
        description=course_data.description,
        org_id=org_id,  # ✅ org_id now passed explicitly
        document_id=course_data.document_id,
        slides=json.dumps(slides),  # Store as JSON string
        created_at=datetime.utcnow()
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


def get_course(db: Session, course_id: uuid.UUID) -> Course | None:
    return db.query(Course).filter(Course.id == course_id).first()


def list_courses_by_org(db: Session, org_id: int) -> list[Course]:
    return db.query(Course).filter(Course.org_id == org_id).all()


def delete_course(db: Session, course_id: uuid.UUID) -> bool:
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        return False
    db.delete(course)
    db.commit()
    return True


def update_course(db: Session, course_id: uuid.UUID, data: CourseUpdate) -> Course | None:
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        return None

    if data.name is not None:
        course.name = data.name
    if data.description is not None:
        course.description = data.description
    if data.document_id is not None:
        course.document_id = data.document_id

    db.commit()
    db.refresh(course)
    return course
