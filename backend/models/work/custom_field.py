#backend/models/work/custom_field.py

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from models.base import Base  # Your declarative base

class CustomField(Base):
    __tablename__ = "custom_fields"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String, nullable=False)  # e.g., "asset", "site"
    name = Column(String, nullable=False)
    field_type = Column(String, nullable=False)  # e.g., "text", "number", "date", "boolean"
    is_required = Column(Boolean, default=False)
    organisation_id = Column(Integer, ForeignKey("organisations.id", ondelete="CASCADE"))

    values = relationship("CustomFieldValue", back_populates="field", cascade="all, delete")
