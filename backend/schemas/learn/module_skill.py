from pydantic import BaseModel
from uuid import UUID

class ModuleSkillBase(BaseModel):
    module_id: UUID
    skill_id: UUID

class ModuleSkillOut(ModuleSkillBase):
    id: int

    class Config:
        from_attributes = True
