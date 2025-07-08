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

