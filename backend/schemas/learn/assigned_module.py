# backend/schemas/learn/assigned_module.py

from pydantic import BaseModel
from uuid import UUID
from typing import Optional
from datetime import datetime, timedelta
from enum import Enum
from .module import ModuleOut

class ModuleStatus(str, Enum):
    assigned = "assigned"
    completed = "completed"
    overdue = "overdue"
    expired = "expired"

class AssignedModuleBase(BaseModel):
    user_id: int
    module_id: UUID
    assigned_by: Optional[int] = None
    due_date: Optional[datetime] = None
    expiry_duration: Optional[timedelta] = None
    expired_at: Optional[datetime] = None
    

class AssignedModuleCreate(AssignedModuleBase):
    pass

class AssignedModuleOut(AssignedModuleBase):
    id: int
    assigned_at: datetime
    completed_at: Optional[datetime] = None
    status: ModuleStatus
    module: Optional[ModuleOut]
    expired_at: Optional[datetime] = None
    reassigned_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AssignedModuleUpdate(AssignedModuleBase):
    status: Optional[ModuleStatus] = None
    completed_at: Optional[datetime] = None
    expiry_duration: Optional[timedelta] = None
