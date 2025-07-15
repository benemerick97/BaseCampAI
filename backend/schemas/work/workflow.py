# schemas/work/workflow.py

from pydantic import BaseModel
from typing import List, Optional
from enum import Enum


# ----------- Status Enum -----------

class WorkflowStatus(str, Enum):
    draft = "draft"
    published = "published"
    archived = "archived"


# ----------- Input Fields -----------

class InputFieldCreate(BaseModel):
    label: str
    input_type: str  # e.g., "text", "number", "dropdown"
    options: Optional[dict] = None
    required: bool = False


class InputFieldOut(InputFieldCreate):
    id: int

    class Config:
        from_attributes = True


# ----------- Step Groups -----------

class StepGroupCreate(BaseModel):
    name: str
    order: int


class StepGroupOut(StepGroupCreate):
    id: int

    class Config:
        from_attributes = True


# ----------- Steps -----------

class StepCreate(BaseModel):
    title: str
    instructions: Optional[str] = None
    order: int
    group_index: Optional[int] = None
    inputs: List[InputFieldCreate] = []


class StepOut(StepCreate):
    id: int
    group_id: int
    inputs: List[InputFieldOut]

    class Config:
        from_attributes = True


# ----------- Workflows -----------

class WorkflowBase(BaseModel):
    name: str
    description: Optional[str]
    is_template: bool = False


class WorkflowCreate(WorkflowBase):
    groups: List[StepGroupCreate] = []
    steps: List[StepCreate]


class WorkflowUpdate(WorkflowBase):
    status: Optional[WorkflowStatus] = None
    groups: Optional[List[StepGroupCreate]] = None
    steps: Optional[List[StepCreate]] = None


class WorkflowOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    is_template: bool
    status: WorkflowStatus
    groups: List[StepGroupOut]
    steps: List[StepOut]

    class Config:
        from_attributes = True
