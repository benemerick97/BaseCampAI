#backend/schemas/organisation.py

from pydantic import BaseModel

class OrganisationOut(BaseModel):

    id: int
    name: str
    short_name: str

    class Config:
        from_attributes = True
