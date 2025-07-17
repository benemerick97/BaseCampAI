# backend/CRUD/learn/assigned_courses.py

from sqlalchemy.orm import Session, joinedload
from models.learn.assigned_courses import AssignedCourse, AssignmentStatus
from schemas.learn.assigned_courses import AssignedCourseCreate
from uuid import uuid4
from datetime import datetime
import json
from models.user import User
from uuid import UUID


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

    # ✅ Check for module completion if this course is part of one
    check_and_complete_modules(db, user_id=user_id, item_id=course_id, is_course=True)

    return assignment


def get_user_assignments(db: Session, user_id: str) -> list[AssignedCourse]:
    assignments = (
        db.query(AssignedCourse)
        .join(AssignedCourse.course)
        .filter(AssignedCourse.user_id == user_id)
        .options(joinedload(AssignedCourse.course))
        .all()
    )

    for assignment in assignments:
        course = assignment.course
        if isinstance(course.slides, str):
            try:
                course.slides = json.loads(course.slides)
            except json.JSONDecodeError:
                course.slides = []

    return assignments


# 🔁 Helper function to check and complete any related modules
def check_and_complete_modules(db: Session, user_id: int, item_id: str, is_course: bool):
    from models.learn.assigned_module import AssignedModule
    from models.learn.module_course import ModuleCourse
    from models.learn.module_skill import ModuleSkill
    from models.learn.assigned_courses import AssignedCourse
    from models.learn.assigned_skill import AssignedSkill

    module_ids = (
        db.query(ModuleCourse.module_id)
        .filter(ModuleCourse.course_id == item_id)
        .all() if is_course else
        db.query(ModuleSkill.module_id)
        .filter(ModuleSkill.skill_id == item_id)
        .all()
    )
    module_ids = [m[0] for m in module_ids]

    for module_id in module_ids:
        assigned_module = (
            db.query(AssignedModule)
            .filter_by(user_id=user_id, module_id=module_id, status="assigned")
            .first()
        )
        if not assigned_module:
            continue

        # Check if all module courses are completed
        all_courses = db.query(ModuleCourse).filter_by(module_id=module_id).all()
        all_course_ids = [c.course_id for c in all_courses]
        completed_courses = db.query(AssignedCourse).filter(
            AssignedCourse.user_id == user_id,
            AssignedCourse.course_id.in_(all_course_ids),
            AssignedCourse.status == "completed"
        ).count()

        # Check if all module skills are completed
        all_skills = db.query(ModuleSkill).filter_by(module_id=module_id).all()
        all_skill_ids = [s.skill_id for s in all_skills]
        completed_skills = db.query(AssignedSkill).filter(
            AssignedSkill.user_id == user_id,
            AssignedSkill.skill_id.in_(all_skill_ids),
            AssignedSkill.status == "completed"
        ).count()

        if completed_courses == len(all_course_ids) and completed_skills == len(all_skill_ids):
            assigned_module.status = "completed"
            assigned_module.completed_at = datetime.utcnow()
            db.commit()


def get_users_assigned_to_course(db: Session, course_id: str):
    return (
        db.query(AssignedCourse)
        .filter(AssignedCourse.course_id == course_id)
        .join(User, User.id == AssignedCourse.user_id)
        .add_columns(User.id, User.first_name, User.last_name, User.email)
        .all()
    )

def delete_assigned_course(db: Session, user_id: int, course_id: UUID) -> bool:
    assignment = db.query(AssignedCourse).filter_by(
        user_id=user_id, course_id=course_id
    ).first()
    if not assignment:
        return False
    db.delete(assignment)
    db.commit()
    return True


def update_assigned_course(db: Session, user_id: int, course_id: UUID, updates: dict) -> AssignedCourse | None:
    assignment = db.query(AssignedCourse).filter_by(user_id=user_id, course_id=course_id).first()
    if not assignment:
        return None

    for key, value in updates.items():
        if hasattr(assignment, key) and value is not None:
            setattr(assignment, key, value)

    db.commit()
    db.refresh(assignment)
    return assignment
