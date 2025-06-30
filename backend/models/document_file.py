# backend/models/document_file.py

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from models.base import Base
from datetime import datetime
import uuid

class DocumentFile(Base):
    __tablename__ = "document_files"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("document_objects.id", ondelete="CASCADE"), nullable=False)
    file_path = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    version = Column(Integer, nullable=False)

    document = relationship(
        "DocumentObject",
        back_populates="versions",
        foreign_keys=[document_id],
        passive_deletes=True  # ✅ Ensures clean cascade deletes
    )
