#backend/routes/superadmin.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from models.organisation import Organisation
from models.user import User
from databases.database import get_db
from auth.dependencies import get_current_user
from schemas.organisation import OrganisationOut, CreateOrgRequest
from schemas.user import SuperAdminUserCreate, UserOut
from pydantic import BaseModel
from utils.security import hash_password

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

@router.post("/superadmin/create-org", response_model=OrganisationOut)
def create_organisation(
    request: CreateOrgRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Access denied. Super admin only.")

    # Optional: check if short_name is unique
    existing = db.query(Organisation).filter(Organisation.short_name == request.short_name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Short name already in use")

    org = Organisation(name=request.name, short_name=request.short_name)
    db.add(org)
    db.commit()
    db.refresh(org)
    return org


@router.post("/superadmin/create-user", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user_as_superadmin(
    new_user: SuperAdminUserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "super_admin":
        raise HTTPException(status_code=403, detail="Access denied. Super admin only.")

    existing = db.query(User).filter(User.email == new_user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with that email already exists")

    if not new_user.password:
        raise HTTPException(status_code=400, detail="Password is required")

    hashed_pw = hash_password(new_user.password)

    user = User(
        email=new_user.email,
        first_name=new_user.first_name,
        last_name=new_user.last_name,
        role=new_user.role,
        organisation_id=new_user.organisation_id,  # ✅ Override for super admin only
        hashed_password=hashed_pw,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user
