# backend/CRUD/learn/assigned_courses.py

from sqlalchemy.orm import Session
from models.learn.assigned_courses import AssignedCourse, AssignmentStatus
from schemas.learn.assigned_courses import AssignedCourseCreate
from uuid import uuid4
from datetime import datetime


def assign_course(db: Session, payload: AssignedCourseCreate) -> AssignedCourse:
    existing = db.query(AssignedCourse).filter_by(
        user_id=payload.user_id, course_id=payload.course_id
    ).first()
    if existing:
        return existing

    assignment = AssignedCourse(
        id=str(uuid4()),
        user_id=payload.user_id,
        course_id=payload.course_id,
        assigned_by=payload.assigned_by,
        status=AssignmentStatus.assigned,
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment


def complete_course(db: Session, user_id: str, course_id: str) -> AssignedCourse:
    assignment = db.query(AssignedCourse).filter_by(
        user_id=user_id, course_id=course_id
    ).first()
    if not assignment:
        raise ValueError("Assignment not found")

    assignment.status = AssignmentStatus.completed
    assignment.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(assignment)
    return assignment


def get_user_assignments(db: Session, user_id: str) -> list[AssignedCourse]:
    return db.query(AssignedCourse).filter_by(user_id=user_id).all()
