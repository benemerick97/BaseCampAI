# crud/learn/assigned_skill.py

from sqlalchemy.orm import Session, joinedload
from models.learn.assigned_skill import AssignedSkill, SkillAssignmentStatus
from schemas.learn.assigned_skill import AssignedSkillCreate
from datetime import datetime
import json
from models.user import User


def assign_skill(db: Session, payload: AssignedSkillCreate) -> AssignedSkill:
    existing = db.query(AssignedSkill).filter_by(
        user_id=payload.user_id, skill_id=payload.skill_id
    ).first()
    if existing:
        return existing

    assignment = AssignedSkill(
        user_id=payload.user_id,
        skill_id=payload.skill_id,
        assigned_by=payload.assigned_by,
        status=SkillAssignmentStatus.assigned,
        assigned_at=datetime.utcnow(),
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment


def complete_skill(db: Session, user_id: int, skill_id: str, evidence_file_url: str | None = None) -> AssignedSkill:
    assignment = db.query(AssignedSkill).filter_by(user_id=user_id, skill_id=skill_id).first()
    if not assignment:
        raise ValueError("Assignment not found")

    assignment.status = SkillAssignmentStatus.completed
    assignment.completed_at = datetime.utcnow()
    if evidence_file_url:
        assignment.evidence_file_url = evidence_file_url

    db.commit()
    db.refresh(assignment)

    # ✅ Check for module completion if this skill is part of one
    check_and_complete_modules(db, user_id=user_id, item_id=skill_id, is_course=False)

    return assignment


def get_user_assigned_skills(db: Session, user_id: int) -> list[AssignedSkill]:
    return (
        db.query(AssignedSkill)
        .join(AssignedSkill.skill)
        .filter(AssignedSkill.user_id == user_id)
        .options(joinedload(AssignedSkill.skill))
        .all()
    )


def get_users_assigned_to_skill(db: Session, skill_id: str):
    return (
        db.query(AssignedSkill)
        .filter(AssignedSkill.skill_id == skill_id)
        .join(User, User.id == AssignedSkill.user_id)
        .add_columns(User.id, User.first_name, User.last_name, User.email)
        .all()
    )


# 🔁 Shared helper to auto-complete modules
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
