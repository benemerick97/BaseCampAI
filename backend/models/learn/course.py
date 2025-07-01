# backend/models/course.py

from sqlalchemy import Column, String, Text, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from models.base import Base
import uuid
from datetime import datetime


class Course(Base):
    __tablename__ = "courses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(Text)
    
    org_id = Column(ForeignKey("organisations.id", ondelete="CASCADE"), nullable=False)
    document_id = Column(ForeignKey("document_objects.id", ondelete="CASCADE"), nullable=False)

    slides = Column(Text)  # JSON-encoded string: [{"title": ..., "bullets": [...]}, ...]

    created_at = Column(DateTime, default=datetime.utcnow)

    organisation = relationship("Organisation", back_populates="courses")
    document = relationship("DocumentObject")
