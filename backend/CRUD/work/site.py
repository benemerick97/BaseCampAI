#backend/CRUD/work/site.py

from sqlalchemy.orm import Session
from models.work.site import Site
from schemas.work.site import SiteCreate

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
