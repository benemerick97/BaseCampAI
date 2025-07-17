# backend/schemas/learn/assigned_courses.py

from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum
from uuid import UUID
from schemas.learn.course import CourseOut


class AssignmentStatus(str, Enum):
    assigned = "assigned"
    completed = "completed"
    skipped = "skipped"


class AssignedCourseBase(BaseModel):
    user_id: int
    course_id: UUID
    assigned_by: Optional[int] = None
    due_date: Optional[datetime] = None


class AssignedCourseCreate(AssignedCourseBase):
    pass


class AssignedCourseComplete(BaseModel):
    user_id: int
    course_id: UUID


class AssignedCourseOut(AssignedCourseBase):
    id: int
    status: AssignmentStatus
    assigned_at: datetime
    completed_at: Optional[datetime] = None
    course: CourseOut

    class Config:
        from_attributes = True


class AssignedCourseUpdate(BaseModel):
    user_id: int
    course_id: UUID
    due_date: Optional[datetime] = None
    status: Optional[AssignmentStatus] = None
