# models/learn/module_course.py

from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from models.base import Base

class ModuleCourse(Base):
    __tablename__ = "module_courses"

    id = Column(Integer, primary_key=True)
    module_id = Column(UUID(as_uuid=True), ForeignKey("modules.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)

    module = relationship("Module", back_populates="courses")
    course = relationship("Course", back_populates="module_links")

