# models/learn/assigned_module_progress.py

from sqlalchemy import Column, ForeignKey, DateTime, Enum, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from models.base import Base
import uuid
from datetime import datetime
import enum

class ModuleItemType(enum.Enum):
    course = "course"
    skill = "skill"

class ModuleItemStatus(enum.Enum):
    assigned = "assigned"
    completed = "completed"

class AssignedModuleProgress(Base):
    __tablename__ = "assigned_module_progress"

    id = Column(Integer, primary_key=True)
    assigned_module_id = Column(Integer, ForeignKey("assigned_modules.id", ondelete="CASCADE"), nullable=False)
    item_type = Column(Enum(ModuleItemType), nullable=False)
    item_id = Column(UUID(as_uuid=True), nullable=False)  # could point to course or skill

    status = Column(Enum(ModuleItemStatus), default=ModuleItemStatus.assigned)
    completed_at = Column(DateTime, nullable=True)

    assigned_module = relationship("AssignedModule", back_populates="progress_items")
