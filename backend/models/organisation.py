# backend/models/organisation.py

from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from models.base import Base

class Organisation(Base):
    __tablename__ = "organisations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    users = relationship("User", back_populates="organisation")
