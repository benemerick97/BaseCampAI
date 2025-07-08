# backend/CRUD/learn/assigned_courses.py

from sqlalchemy.orm import Session
from models.learn.assigned_courses import AssignedCourse, AssignmentStatus
from schemas.learn.assigned_courses import AssignedCourseCreate
from uuid import uuid4
from datetime import datetime
from sqlalchemy.orm import joinedload
import json


def assign_course(db: Session, payload: AssignedCourseCreate) -> AssignedCourse:
    existing = db.query(AssignedCourse).filter_by(
        user_id=payload.user_id, course_id=payload.course_id
    ).first()
    if existing:
        return existing

    assignment = AssignedCourse(
        user_id=payload.user_id,
        course_id=payload.course_id,
        assigned_by=payload.assigned_by,
        due_date=payload.due_date,
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
    assignments = (
        db.query(AssignedCourse)
        .join(AssignedCourse.course)  # ⬅ INNER JOIN
        .filter(AssignedCourse.user_id == user_id)
        .options(joinedload(AssignedCourse.course))  # ⬅ eager load to avoid N+1
        .all()
    )

    for assignment in assignments:
        course = assignment.course  # ⬅ updated
        if isinstance(course.slides, str):
            try:
                course.slides = json.loads(course.slides)
            except json.JSONDecodeError:
                course.slides = []

    return assignments
