#backend/schemas/work/site.py

from pydantic import BaseModel
from datetime import datetime

class SiteBase(BaseModel):
    name: str
    location: str

class SiteCreate(SiteBase):
    organisation_id: int  # Required to associate the site to an org

class SiteRead(SiteBase):
    id: int
    created_date: datetime
    organisation_id: int

    class Config:
        orm_mode = True
