# schemas/learn/skill.py

from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class SkillBase(BaseModel):
    name: str
    description: Optional[str] = None
    evidence_required: bool = False
    document_id: Optional[UUID] = None


class SkillCreate(SkillBase):
    pass


class SkillUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    evidence_required: Optional[bool] = None
    document_id: Optional[UUID] = None


class SkillOut(SkillBase):
    id: UUID
    org_id: int
    created_at: datetime

    class Config:
        from_attributes = True
