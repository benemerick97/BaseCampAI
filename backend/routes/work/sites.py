#backend/routes/work/sites.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from databases.database import get_db
from schemas.work.site import SiteCreate, SiteRead
from CRUD.work import site as site_crud

router = APIRouter(prefix="/sites", tags=["Sites"])

@router.post("/", response_model=SiteRead)
def create_site(site: SiteCreate, db: Session = Depends(get_db)):
    return site_crud.create_site(db, site)

@router.get("/", response_model=list[SiteRead])
def list_sites(organisation_id: int | None = None, db: Session = Depends(get_db)):
    return site_crud.get_sites(db, organisation_id=organisation_id)
