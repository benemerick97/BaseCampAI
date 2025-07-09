from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from datetime import datetime
from enum import Enum

class ModuleItemType(str, Enum):
    course = "course"
    skill = "skill"

class ModuleItemStatus(str, Enum):
    assigned = "assigned"
    completed = "completed"

class AssignedModuleProgressBase(BaseModel):
    assigned_module_id: int
    item_type: ModuleItemType
    item_id: UUID

class AssignedModuleProgressCreate(AssignedModuleProgressBase):
    pass

class AssignedModuleProgressOut(AssignedModuleProgressBase):
    id: int
    status: ModuleItemStatus
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
