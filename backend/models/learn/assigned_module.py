# models/learn/assigned_module.py

from sqlalchemy import Column, ForeignKey, DateTime, Enum, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from models.base import Base
import uuid
from datetime import datetime
import enum

class ModuleStatus(enum.Enum):
    assigned = "assigned"
    completed = "completed"

class AssignedModule(Base):
    __tablename__ = "assigned_modules"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    module_id = Column(UUID(as_uuid=True), ForeignKey("modules.id", ondelete="CASCADE"), nullable=False)

    assigned_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    status = Column(Enum(ModuleStatus), default=ModuleStatus.assigned)

    module = relationship("Module")
    user = relationship("User", back_populates="assigned_modules")

    progress_items = relationship("AssignedModuleProgress", back_populates="assigned_module", cascade="all, delete-orphan")
