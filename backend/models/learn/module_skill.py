# models/learn/module_skill.py

from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from models.base import Base

class ModuleSkill(Base):
    __tablename__ = "module_skills"

    id = Column(Integer, primary_key=True)
    module_id = Column(UUID(as_uuid=True), ForeignKey("modules.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)

    module = relationship("Module", back_populates="skills")
    skill = relationship("Skill", back_populates="module_links")

