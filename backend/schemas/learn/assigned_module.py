from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from datetime import datetime
from enum import Enum

class ModuleStatus(str, Enum):
    assigned = "assigned"
    completed = "completed"

class AssignedModuleBase(BaseModel):
    user_id: int
    module_id: UUID

class AssignedModuleCreate(AssignedModuleBase):
    pass

class AssignedModuleOut(AssignedModuleBase):
    id: int
    assigned_at: datetime
    completed_at: Optional[datetime] = None
    status: ModuleStatus

    class Config:
        from_attributes = True
