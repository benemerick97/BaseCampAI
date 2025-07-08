# models/learn/assigned_skill.py

from sqlalchemy import Column, Integer, DateTime, Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from models.base import Base


class SkillAssignmentStatus(str, enum.Enum):
    assigned = "assigned"
    completed = "completed"


class AssignedSkill(Base):
    __tablename__ = "assigned_skills"

    id = Column(Integer, primary_key=True, autoincrement=True)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    assigned_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    assigned_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    status = Column(Enum(SkillAssignmentStatus), default=SkillAssignmentStatus.assigned, nullable=False)

    evidence_file_url = Column(String, nullable=True)

    user = relationship("User", foreign_keys=[user_id])
    assigner = relationship("User", foreign_keys=[assigned_by])
    skill = relationship("Skill", foreign_keys=[skill_id])
