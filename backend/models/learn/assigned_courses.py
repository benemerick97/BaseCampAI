# models/assigned_course.py

from sqlalchemy import Column, String, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from uuid import uuid4
import enum

from models.base import Base


class AssignmentStatus(str, enum.Enum):
    assigned = "assigned"
    completed = "completed"
    skipped = "skipped"


class AssignedCourse(Base):
    __tablename__ = "assigned_courses"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(String, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    assigned_by = Column(String, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    assigned_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    status = Column(Enum(AssignmentStatus), default=AssignmentStatus.assigned, nullable=False)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    assigner = relationship("User", foreign_keys=[assigned_by])
    linked_course = relationship("Course", foreign_keys=[course_id])
