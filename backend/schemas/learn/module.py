from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class ModuleBase(BaseModel):
    name: str
    description: Optional[str] = None
    document_id: Optional[UUID] = None  # Still optional, even if unused for now

class ModuleCreate(ModuleBase):
    course_ids: List[UUID] = []
    skill_ids: List[UUID] = []

class ModuleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    course_ids: Optional[List[UUID]] = None
    skill_ids: Optional[List[UUID]] = None
    document_id: Optional[UUID] = None

class ModuleOut(ModuleBase):
    id: UUID
    org_id: int  # ✅ changed from UUID to int
    created_at: datetime

    class Config:
        from_attributes = True

