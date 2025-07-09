# backend/crud/organisation.py

from sqlalchemy.orm import Session
from models.organisation import Organisation
from schemas.organisation import CreateOrgRequest, UpdateOrgRequest

def get_organisation(db: Session, org_id: int):
    return db.query(Organisation).filter(Organisation.id == org_id).first()

def get_all_organisations(db: Session):
    return db.query(Organisation).order_by(Organisation.name).all()

def create_organisation(db: Session, org: CreateOrgRequest):
    new_org = Organisation(name=org.name, short_name=org.short_name)
    db.add(new_org)
    db.commit()
    db.refresh(new_org)
    return new_org

def update_organisation(db: Session, org_id: int, update: UpdateOrgRequest):
    org = get_organisation(db, org_id)
    if not org:
        return None
    org.name = update.name
    org.short_name = update.short_name
    db.commit()
    db.refresh(org)
    return org

def delete_organisation(db: Session, org_id: int):
    org = get_organisation(db, org_id)
    if org:
        db.delete(org)
        db.commit()
    return org
