# backend/schemas/learn/assigned_courses.py

from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class AssignmentStatus(str, Enum):
    assigned = "assigned"
    completed = "completed"
    skipped = "skipped"


class AssignedCourseBase(BaseModel):
    user_id: str
    course_id: str
    assigned_by: Optional[str] = None


class AssignedCourseCreate(AssignedCourseBase):
    pass


class AssignedCourseComplete(BaseModel):
    user_id: str
    course_id: str


class AssignedCourseOut(AssignedCourseBase):
    id: str
    status: AssignmentStatus
    assigned_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        orm_mode = True
