# backend/models/organisation.py

from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from models.base import Base


class Organisation(Base):
    __tablename__ = "organisations"  # ✅ REQUIRED for table mapping

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    short_name = Column(String, unique=True, nullable=True)

    users = relationship("User", back_populates="organisation")
    agents = relationship("Agent", back_populates="organisation", cascade="all, delete")
    sites = relationship("Site", back_populates="organisation", cascade="all, delete-orphan")
    assets = relationship("Asset", back_populates="organisation", cascade="all, delete")

    
    documents = relationship("DocumentObject", back_populates="organisation", cascade="all, delete")

    courses = relationship("Course", back_populates="organisation", cascade="all, delete-orphan")
    skills = relationship("Skill", back_populates="organisation", cascade="all, delete-orphan")
    modules = relationship("Module", back_populates="organisation", cascade="all, delete-orphan")
