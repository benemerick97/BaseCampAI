#backend/routes/superadmin.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from models.organisation import Organisation
from models.user import User
from databases.database import get_db
from auth.dependencies import get_current_user
from schemas.organisation import OrganisationOut
from pydantic import BaseModel

router = APIRouter()

# 📥 Request body schema for switching orgs
class SwitchOrgRequest(BaseModel):
    org_id: int


# 🔍 GET all organisations (Super Admin only)
@router.get("/superadmin/organisations", response_model=List[OrganisationOut])
def get_all_organisations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Access denied. Super admin only.")

    orgs = db.query(Organisation).all()
    return orgs


# 🔁 POST switch current organisation (Super Admin only)
@router.post("/superadmin/switch-org", response_model=OrganisationOut)
def switch_organisation(
    request: SwitchOrgRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Access denied. Super admin only.")

    org = db.query(Organisation).filter(Organisation.id == request.org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organisation not found")

    current_user.organisation_id = org.id
    db.commit()

    return org
