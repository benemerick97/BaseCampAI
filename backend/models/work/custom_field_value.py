from sqlalchemy import Column, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship
from models.base import Base

class CustomFieldValue(Base):
    __tablename__ = "custom_field_values"

    id = Column(Integer, primary_key=True, index=True)
    custom_field_id = Column(Integer, ForeignKey("custom_fields.id", ondelete="CASCADE"))
    entity_id = Column(Integer, nullable=False)  # ID of the asset/site/workflow
    value_text = Column(Text)

    field = relationship("CustomField", back_populates="values")
