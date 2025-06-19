from pydantic import BaseModel
from typing import Optional

class CustomFieldValueBase(BaseModel):
    custom_field_id: int
    entity_id: int
    value_text: str

class CustomFieldValueCreate(CustomFieldValueBase):
    pass

class CustomFieldValueUpdate(BaseModel):
    value_text: str

class CustomFieldValueOut(CustomFieldValueBase):
    id: int

    class Config:
        from_attributes = True
