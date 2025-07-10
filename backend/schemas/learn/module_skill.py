from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from uuid import UUID

class ModuleSkillBase(BaseModel):
    module_id: UUID
    skill_id: UUID

class ModuleSkillOut(ModuleSkillBase):
    id: int
    assigned_by: Optional[int]
    assigned_at: Optional[datetime]

    class Config:
        from_attributes = True
