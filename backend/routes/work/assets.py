#backend/routes/work/assets.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from databases.database import get_db
from schemas.work.asset import AssetCreate, AssetRead, AssetUpdate
from CRUD.work import asset as asset_crud

router = APIRouter(prefix="/assets", tags=["Assets"])

@router.post("/", response_model=AssetRead)
def create_asset(asset: AssetCreate, db: Session = Depends(get_db)):
    return asset_crud.create_asset(db, asset)

@router.get("/", response_model=list[AssetRead])
def list_assets(
    organisation_id: int | None = None,
    site_id: int | None = None,
    db: Session = Depends(get_db)
):
    return asset_crud.get_assets(db, organisation_id=organisation_id, site_id=site_id)

@router.get("/{asset_id}", response_model=AssetRead)
def get_asset(asset_id: int, organisation_id: int, db: Session = Depends(get_db)):
    asset = asset_crud.get_asset_by_id(db, asset_id=asset_id, organisation_id=organisation_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset

@router.put("/{asset_id}", response_model=AssetRead)
def update_asset(asset_id: int, updated_data: AssetUpdate, db: Session = Depends(get_db)):
    asset = asset_crud.update_asset(db, asset_id, organisation_id=updated_data.organisation_id, updated_data=updated_data)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset

@router.delete("/{asset_id}")
def delete_asset(asset_id: int, organisation_id: int, db: Session = Depends(get_db)):
    success = asset_crud.delete_asset(db, asset_id=asset_id, organisation_id=organisation_id)
    if not success:
        raise HTTPException(status_code=404, detail="Asset not found")
    return {"message": "Asset deleted successfully"}
