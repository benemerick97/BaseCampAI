# schemas/work/workflow.py

from pydantic import BaseModel
from typing import List, Optional


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
    inputs: List[InputFieldOut]

    class Config:
        from_attributes = True


# ----------- Workflows -----------

class WorkflowCreate(BaseModel):
    name: str
    description: Optional[str]
    is_template: bool = False
    groups: List[StepGroupCreate] = []
    steps: List[StepCreate]


class WorkflowOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    is_template: bool
    groups: List[StepGroupOut]
    steps: List[StepOut]

    class Config:
        from_attributes = True
