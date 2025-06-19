#backend/schemas/work/site.py

from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class SiteBase(BaseModel):
    name: str
    location: str

class SiteCreate(SiteBase):
    organisation_id: int  # Required to associate the site to an org

class SiteUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None

class SiteRead(SiteBase):
    id: int
    created_date: datetime
    organisation_id: int

    class Config:
        from_attributes = True
