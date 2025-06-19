from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AssetBase(BaseModel):
    name: str
    asset_type: Optional[str] = None
    serial_number: Optional[str] = None

class AssetCreate(AssetBase):
    site_id: int
    organisation_id: int  # Required to associate the asset to an org

class AssetUpdate(BaseModel):
    name: Optional[str] = None
    asset_type: Optional[str] = None
    serial_number: Optional[str] = None

class AssetRead(AssetBase):
    id: int
    created_date: datetime
    site_id: int
    organisation_id: int

    class Config:
        from_attributes = True
