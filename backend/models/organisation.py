# backend/models/organisation.py

from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from models.base import Base
from models.work.site import Site


class Organisation(Base):
    __tablename__ = "organisations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    short_name = Column(String, unique=True, nullable=True)

    users = relationship("User", back_populates="organisation")
    agents = relationship("Agent", back_populates="organisation", cascade="all, delete")
    sites = relationship("Site", back_populates="organisation", cascade="all, delete-orphan")

    assets = relationship("Asset", back_populates="organisation", cascade="all, delete")