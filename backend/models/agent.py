# backend/models/agent.py

from sqlalchemy import Column, Integer, String, Text, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from models.base import Base

class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organisations.id"), nullable=False)
    agent_key = Column(String, nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    prompt = Column(Text, nullable=False)
    filter = Column(Text, nullable=False)  # JSON string
    type = Column(String, nullable=False)  # NEW: "prompt", "retrieval", or "system"

    organisation = relationship("Organisation", back_populates="agents")

    __table_args__ = (
        UniqueConstraint("org_id", "agent_key", name="uix_org_agent_key"),
    )
