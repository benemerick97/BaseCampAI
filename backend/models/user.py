# backend/models/user.py

from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from models.base import Base
from models.learn.assigned_skill import AssignedSkill
from models.learn.assigned_courses import AssignedCourse
from models.learn.assigned_module import AssignedModule


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user", nullable=False)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)

    organisation_id = Column(Integer, ForeignKey("organisations.id"), nullable=False)
    organisation = relationship("Organisation", back_populates="users")

    assigned_skills = relationship(
        "AssignedSkill",
        back_populates="user",
        foreign_keys=[AssignedSkill.user_id]
    )
    assigned_courses = relationship(
        "AssignedCourse",
        back_populates="user",
        foreign_keys=[AssignedCourse.user_id]
    )
    assigned_modules = relationship(
        "AssignedModule",
        back_populates="user",
        foreign_keys=[AssignedModule.user_id]
    )



