from sqlalchemy.orm import Session
from models.work.custom_field import CustomField
from schemas.work.custom_field import CustomFieldCreate, CustomFieldUpdate

def get_custom_fields(db: Session, organisation_id: int, entity_type: str):
    return db.query(CustomField).filter_by(
        organisation_id=organisation_id,
        entity_type=entity_type
    ).all()

def get_custom_field(db: Session, field_id: int, organisation_id: int):
    return db.query(CustomField).filter_by(id=field_id, organisation_id=organisation_id).first()

def create_custom_field(db: Session, field: CustomFieldCreate):
    db_field = CustomField(**field.dict())
    db.add(db_field)
    db.commit()
    db.refresh(db_field)
    return db_field

def update_custom_field(db: Session, field_id: int, field_update: CustomFieldUpdate, organisation_id: int):
    db_field = get_custom_field(db, field_id, organisation_id)
    if not db_field:
        return None
    for key, value in field_update.dict(exclude_unset=True).items():
        setattr(db_field, key, value)
    db.commit()
    db.refresh(db_field)
    return db_field

def delete_custom_field(db: Session, field_id: int, organisation_id: int):
    db_field = get_custom_field(db, field_id, organisation_id)
    if db_field:
        db.delete(db_field)
        db.commit()
    return db_field
