# models/learn/skill.py

from sqlalchemy import Column, String, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from models.base import Base
import uuid
from datetime import datetime


class Skill(Base):
    __tablename__ = "skills"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(Text)
    evidence_required = Column(Boolean, default=False)

    org_id = Column(ForeignKey("organisations.id", ondelete="CASCADE"), nullable=False)
    document_id = Column(ForeignKey("document_objects.id", ondelete="SET NULL"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    organisation = relationship("Organisation", back_populates="skills")
    document = relationship("DocumentObject")
