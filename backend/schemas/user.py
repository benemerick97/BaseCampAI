#backend/schemas/user.py


from pydantic import BaseModel, EmailStr
from typing import Optional
from .organisation import OrganisationOut  # adjust import path if needed


class UserCreate(BaseModel):
    email: EmailStr
    role: str
    password: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    first_name: Optional[str]
    last_name: Optional[str]

    class Config:
        from_attributes = True


class UserOut(BaseModel):
    id: int
    email: str
    role: str
    first_name: Optional[str]
    last_name: Optional[str]
    organisation: Optional[OrganisationOut]

    class Config:
        from_attributes = True
