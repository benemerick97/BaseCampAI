from pydantic import BaseModel
from typing import Optional

class CustomFieldBase(BaseModel):
    entity_type: str
    name: str
    field_type: str
    is_required: Optional[bool] = False
    organisation_id: int

class CustomFieldCreate(CustomFieldBase):
    pass

class CustomFieldUpdate(BaseModel):
    name: Optional[str]
    field_type: Optional[str]
    is_required: Optional[bool]

class CustomFieldOut(CustomFieldBase):
    id: int

    class Config:
        orm_mode = True
