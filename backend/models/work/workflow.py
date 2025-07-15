# models/work/workflow.py

from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, JSON, DateTime, Enum
from sqlalchemy.orm import relationship
from models.base import Base
from datetime import datetime
import enum


class WorkflowStatus(enum.Enum):
    draft = "draft"
    published = "published"
    archived = "archived"


class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    is_template = Column(Boolean, default=False)

    status = Column(Enum(WorkflowStatus), default=WorkflowStatus.draft, nullable=False)
    last_saved_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    autosaved_at = Column(DateTime, nullable=True)

    # Ownership
    organisation_id = Column(Integer, ForeignKey("organisations.id"), nullable=False)
    organisation = relationship("Organisation", back_populates="workflows")

    # Relationships
    groups = relationship("StepGroup", back_populates="workflow", cascade="all, delete-orphan")
    steps = relationship("Step", back_populates="workflow", cascade="all, delete-orphan")


class StepGroup(Base):
    __tablename__ = "step_groups"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    order = Column(Integer, nullable=False)
    workflow_id = Column(Integer, ForeignKey("workflows.id"))

    workflow = relationship("Workflow", back_populates="groups")
    steps = relationship("Step", back_populates="group", cascade="all, delete-orphan")


class Step(Base):
    __tablename__ = "workflow_steps"

    id = Column(Integer, primary_key=True)
    workflow_id = Column(Integer, ForeignKey("workflows.id"))
    group_id = Column(Integer, ForeignKey("step_groups.id"), nullable=True)
    title = Column(String, nullable=False)
    instructions = Column(String, nullable=True)
    order = Column(Integer, nullable=False)

    workflow = relationship("Workflow", back_populates="steps")
    group = relationship("StepGroup", back_populates="steps")
    inputs = relationship("InputField", back_populates="step", cascade="all, delete-orphan")


class InputField(Base):
    __tablename__ = "input_fields"

    id = Column(Integer, primary_key=True)
    step_id = Column(Integer, ForeignKey("workflow_steps.id"))
    label = Column(String, nullable=False)
    input_type = Column(String, nullable=False)  # e.g. text, number, dropdown
    options = Column(JSON, nullable=True)
    required = Column(Boolean, default=False)

    step = relationship("Step", back_populates="inputs")
