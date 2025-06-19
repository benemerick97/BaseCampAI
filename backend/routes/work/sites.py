#backend/routes/work/sites.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from databases.database import get_db
from schemas.work.site import SiteCreate, SiteRead, SiteUpdate
from CRUD.work import site as site_crud

router = APIRouter(prefix="/sites", tags=["Sites"])

@router.post("/", response_model=SiteRead)
def create_site(site: SiteCreate, db: Session = Depends(get_db)):
    return site_crud.create_site(db, site)

@router.get("/", response_model=list[SiteRead])
def list_sites(organisation_id: int | None = None, db: Session = Depends(get_db)):
    return site_crud.get_sites(db, organisation_id=organisation_id)

@router.get("/{site_id}", response_model=SiteRead)
def get_site(site_id: int, organisation_id: int, db: Session = Depends(get_db)):
    site = site_crud.get_site_by_id(db, site_id=site_id, organisation_id=organisation_id)
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    return site

@router.put("/{site_id}", response_model=SiteRead)
def update_site(site_id: int, updated_data: SiteUpdate, db: Session = Depends(get_db)):
    site = site_crud.update_site(db, site_id, updated_data)
    if not site:
        raise HTTPException(status_code=404, detail="Site not found")
    return site

@router.delete("/{site_id}")
def delete_site(site_id: int, db: Session = Depends(get_db)):
    success = site_crud.delete_site(db, site_id)
    if not success:
        raise HTTPException(status_code=404, detail="Site not found")
    return {"message": "Site deleted successfully"}