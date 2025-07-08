# schemas/learn/assigned_skill.py

from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime
from enum import Enum
from schemas.learn.skill import SkillOut


class SkillAssignmentStatus(str, Enum):
    assigned = "assigned"
    completed = "completed"


class AssignedSkillBase(BaseModel):
    user_id: int
    skill_id: UUID
    assigned_by: Optional[int] = None


class AssignedSkillCreate(AssignedSkillBase):
    pass


class AssignedSkillComplete(BaseModel):
    user_id: int
    skill_id: UUID
    evidence_file_url: Optional[str] = None


class AssignedSkillOut(AssignedSkillBase):
    id: int
    status: SkillAssignmentStatus
    assigned_at: datetime
    completed_at: Optional[datetime] = None
    evidence_file_url: Optional[str] = None
    skill: SkillOut

    class Config:
        from_attributes = True
