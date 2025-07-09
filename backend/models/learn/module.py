# models/learn/module.py

from sqlalchemy import Column, String, Text, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from models.base import Base
import uuid
from datetime import datetime

class Module(Base):
    __tablename__ = "modules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(Text)

    org_id = Column(ForeignKey("organisations.id", ondelete="CASCADE"), nullable=False)
    document_id = Column(ForeignKey("document_objects.id", ondelete="SET NULL"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    organisation = relationship("Organisation", back_populates="modules")
    document = relationship("DocumentObject")

    courses = relationship("ModuleCourse", back_populates="module", cascade="all, delete-orphan")
    skills = relationship("ModuleSkill", back_populates="module", cascade="all, delete-orphan")
