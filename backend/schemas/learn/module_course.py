from pydantic import BaseModel
from uuid import UUID

class ModuleCourseBase(BaseModel):
    module_id: UUID
    course_id: UUID

class ModuleCourseOut(ModuleCourseBase):
    id: int

    class Config:
        from_attributes = True
