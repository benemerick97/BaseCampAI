#backend/schemas/user.py

from pydantic import BaseModel
from typing import Optional
from schemas.organisation import OrganisationOut


# ✏️ Used for PATCH /users/{id}
class UserUpdate(BaseModel):
    first_name: Optional[str]
    last_name: Optional[str]

    class Config:
        orm_mode = True


# ✅ Used for returning basic user details (optional if you want a full schema)
class UserOut(BaseModel):
    id: int
    email: str
    role: str
    first_name: Optional[str]
    last_name: Optional[str]
    organisation: Optional[OrganisationOut]
    
    class Config:
        orm_mode = True
