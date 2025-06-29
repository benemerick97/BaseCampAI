from sqlalchemy import Column, String, Date, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from models.base import Base
from datetime import datetime
import uuid
from models.document_file import DocumentFile  # Optional but improves IDE support

class DocumentObject(Base):
    __tablename__ = "document_objects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    org_id = Column(Integer, ForeignKey("organisations.id", ondelete="CASCADE"), nullable=False)
    review_date = Column(Date, nullable=True)

    # Fix circular dependency by deferring FK creation
    current_file_id = Column(
        UUID(as_uuid=True),
        ForeignKey("document_files.id", use_alter=True, name="fk_current_file_id"),
        nullable=True
    )

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    current_file = relationship("DocumentFile", foreign_keys=[current_file_id])
    versions = relationship(
        "DocumentFile",
        back_populates="document",
        cascade="all, delete",
        foreign_keys=[DocumentFile.document_id]  # Disambiguates join path
    )
    organisation = relationship("Organisation", back_populates="documents")

    # New: M2M with agents via join table
    agents = relationship(
        "Agent",
        secondary="agent_documents",
        back_populates="documents"
    )
