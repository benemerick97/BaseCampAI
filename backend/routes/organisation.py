# backend/routes/organisation.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from databases.database import get_db
import CRUD.organisation as org_crud
from schemas.organisation import OrganisationOut, CreateOrgRequest, UpdateOrgRequest

router = APIRouter(prefix="/organisations", tags=["Organisations"])

@router.get("/", response_model=list[OrganisationOut])
def list_organisations(db: Session = Depends(get_db)):
    return org_crud.get_all_organisations(db)

@router.get("/{org_id}", response_model=OrganisationOut)
def get_organisation(org_id: int, db: Session = Depends(get_db)):
    org = org_crud.get_organisation(db, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organisation not found")
    return org

@router.post("/", response_model=OrganisationOut)
def create_organisation(org: CreateOrgRequest, db: Session = Depends(get_db)):
    return org_crud.create_organisation(db, org)

@router.put("/{org_id}", response_model=OrganisationOut)
def update_organisation(org_id: int, update: UpdateOrgRequest, db: Session = Depends(get_db)):
    org = org_crud.update_organisation(db, org_id, update)
    if not org:
        raise HTTPException(status_code=404, detail="Organisation not found")
    return org

@router.delete("/{org_id}", response_model=OrganisationOut)
def delete_organisation(org_id: int, db: Session = Depends(get_db)):
    org = org_crud.delete_organisation(db, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organisation not found")
    return org
