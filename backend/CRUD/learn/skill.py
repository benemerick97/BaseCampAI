# crud/learn/skill.py

from sqlalchemy.orm import Session
from models.learn.skill import Skill
from schemas.learn.skill import SkillCreate, SkillUpdate
import uuid
from datetime import datetime


def create_skill(db: Session, org_id: int, data: SkillCreate) -> Skill:
    skill = Skill(
        id=uuid.uuid4(),
        name=data.name,
        description=data.description,
        evidence_required=data.evidence_required,
        document_id=data.document_id,
        org_id=org_id,
        created_at=datetime.utcnow()
    )
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill


def get_skill(db: Session, skill_id: uuid.UUID) -> Skill | None:
    return db.query(Skill).filter(Skill.id == skill_id).first()


def list_skills_by_org(db: Session, org_id: int) -> list[Skill]:
    return db.query(Skill).filter(Skill.org_id == org_id).all()


def update_skill(db: Session, skill_id: uuid.UUID, data: SkillUpdate) -> Skill | None:
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        return None

    if data.name is not None:
        skill.name = data.name
    if data.description is not None:
        skill.description = data.description
    if data.evidence_required is not None:
        skill.evidence_required = data.evidence_required
    if data.document_id is not None:
        skill.document_id = data.document_id

    db.commit()
    db.refresh(skill)
    return skill


def delete_skill(db: Session, skill_id: uuid.UUID) -> bool:
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        return False
    db.delete(skill)
    db.commit()
    return True
