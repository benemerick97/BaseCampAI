# backend/models/agent_document.py

from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from models.base import Base

class AgentDocument(Base):
    """
    Association table for many-to-many relationship between Agents and DocumentObjects.
    Each row links one Agent to one DocumentObject.
    """
    __tablename__ = "agent_documents"

    agent_id = Column(String, ForeignKey("agents.agent_key", ondelete="CASCADE"), primary_key=True)
    document_id = Column(UUID(as_uuid=True), ForeignKey("document_objects.id", ondelete="CASCADE"), primary_key=True)
