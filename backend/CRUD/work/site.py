#backend/CRUD/work/site.py

from sqlalchemy.orm import Session
from models.work.site import Site
from schemas.work.site import SiteCreate, SiteUpdate

def create_site(db: Session, site_data: SiteCreate) -> Site:
    site = Site(**site_data.dict())
    db.add(site)
    db.commit()
    db.refresh(site)
    return site

def get_sites(db: Session, organisation_id: int | None = None, skip: int = 0, limit: int = 100) -> list[Site]:
    query = db.query(Site)
    if organisation_id:
        query = query.filter(Site.organisation_id == organisation_id)
    return query.offset(skip).limit(limit).all()

def get_site_by_id(db: Session, site_id: int, organisation_id: int):
    return db.query(Site).filter(
        Site.id == site_id,
        Site.organisation_id == organisation_id
    ).first()

def update_site(db: Session, site_id: int, organisation_id: int, updated_data: SiteUpdate) -> Site | None:
    site = db.query(Site).filter(
        Site.id == site_id,
        Site.organisation_id == organisation_id
    ).first()
    if not site:
        return None
    for field, value in updated_data.dict(exclude_unset=True).items():
        setattr(site, field, value)
    db.commit()
    db.refresh(site)
    return site

def delete_site(db: Session, site_id: int, organisation_id: int) -> bool:
    site = db.query(Site).filter(
        Site.id == site_id,
        Site.organisation_id == organisation_id
    ).first()
    if not site:
        return False
    db.delete(site)
    db.commit()
    return True
