from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from models.base import Base

class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organisations.id"), nullable=False)
    agent_key = Column(String, nullable=False, unique=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    prompt = Column(Text, nullable=False)
    filter = Column(JSONB, nullable=False)
    type = Column(String, nullable=False)  # e.g. "prompt", "retrieval", "system"

    # Relationships
    organisation = relationship("Organisation", back_populates="agents")

    # New: M2M with documents via join table
    documents = relationship(
        "DocumentObject",
        secondary="agent_documents",
        back_populates="agents",
        cascade="all, delete"
    )
