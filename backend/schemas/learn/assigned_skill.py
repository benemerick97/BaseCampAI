# schemas/learn/assigned_skill.py

from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime, timedelta, date
from enum import Enum
from schemas.learn.skill import SkillOut


class SkillAssignmentStatus(str, Enum):
    assigned = "assigned"
    completed = "completed"
    overdue = "overdue"
    expired = "expired"


class AssignedSkillBase(BaseModel):
    user_id: int
    skill_id: UUID
    assigned_by: Optional[int] = None
    due_date: Optional[date] = None
    expiry_duration: Optional[timedelta] = None
    expired_at: Optional[datetime] = None


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
    expired_at: Optional[datetime] = None
    reassigned_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AssignedSkillUpdate(BaseModel):
    user_id: int
    skill_id: UUID
    status: Optional[SkillAssignmentStatus] = None
    evidence_file_url: Optional[str] = None
    completed_at: Optional[datetime] = None  # Optional manual override
    expiry_duration: Optional[timedelta] = None
    due_date: Optional[date] = None
