# backend/CRUD/work/asset.py

from sqlalchemy.orm import Session
from models.work.asset import Asset
from schemas.work.asset import AssetCreate, AssetUpdate

def create_asset(db: Session, asset_data: AssetCreate) -> Asset:
    asset = Asset(**asset_data.dict())
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset

def get_assets(db: Session, organisation_id: int | None = None, site_id: int | None = None, skip: int = 0, limit: int = 100) -> list[Asset]:
    query = db.query(Asset)
    if organisation_id:
        query = query.filter(Asset.organisation_id == organisation_id)
    if site_id:
        query = query.filter(Asset.site_id == site_id)
    return query.offset(skip).limit(limit).all()

def get_asset_by_id(db: Session, asset_id: int, organisation_id: int) -> Asset | None:
    return db.query(Asset).filter(
        Asset.id == asset_id,
        Asset.organisation_id == organisation_id
    ).first()

def update_asset(db: Session, asset_id: int, organisation_id: int, updated_data: AssetUpdate) -> Asset | None:
    asset = db.query(Asset).filter(
        Asset.id == asset_id,
        Asset.organisation_id == organisation_id
    ).first()
    if not asset:
        return None
    for field, value in updated_data.dict(exclude_unset=True).items():
        setattr(asset, field, value)
    db.commit()
    db.refresh(asset)
    return asset

def delete_asset(db: Session, asset_id: int, organisation_id: int) -> bool:
    asset = db.query(Asset).filter(
        Asset.id == asset_id,
        Asset.organisation_id == organisation_id
    ).first()
    if not asset:
        return False
    db.delete(asset)
    db.commit()
    return True
