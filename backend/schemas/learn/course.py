# backend/schemas/course.py

from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID
from datetime import datetime


class Slide(BaseModel):
    title: str
    bullets: List[str]


class CourseBase(BaseModel):
    name: str
    description: Optional[str] = None
    document_id: UUID


class CourseCreate(CourseBase):
    pass


class CourseOut(CourseBase):
    id: UUID
    org_id: int
    slides: List[Slide]
    created_at: datetime

    class Config:
        from_attributes = True


class CourseUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    document_id: Optional[UUID] = None

