from sqlalchemy.orm import Session
from models.work.custom_field import CustomField
from models.work.custom_field_value import CustomFieldValue
from schemas.work.custom_field_value import CustomFieldValueCreate, CustomFieldValueUpdate

def get_custom_field_values(db: Session, entity_id: int, organisation_id: int):
    return (
        db.query(CustomFieldValue)
        .join(CustomField)
        .filter(CustomFieldValue.entity_id == entity_id)
        .filter(CustomField.organisation_id == organisation_id)
        .all()
    )

def get_custom_field_value(db: Session, value_id: int, organisation_id: int):
    return (
        db.query(CustomFieldValue)
        .join(CustomField)
        .filter(CustomFieldValue.id == value_id)
        .filter(CustomField.organisation_id == organisation_id)
        .first()
    )

def create_custom_field_value(db: Session, value: CustomFieldValueCreate, organisation_id: int):
    # Ensure the custom_field_id belongs to this organisation
    field = db.query(CustomField).filter_by(id=value.custom_field_id, organisation_id=organisation_id).first()
    if not field:
        return None
    db_value = CustomFieldValue(**value.dict())
    db.add(db_value)
    db.commit()
    db.refresh(db_value)
    return db_value

def update_custom_field_value(db: Session, value_id: int, value_update: CustomFieldValueUpdate, organisation_id: int):
    db_value = get_custom_field_value(db, value_id, organisation_id)
    if not db_value:
        return None
    for key, value in value_update.dict(exclude_unset=True).items():
        setattr(db_value, key, value)
    db.commit()
    db.refresh(db_value)
    return db_value

def delete_custom_field_value(db: Session, value_id: int, organisation_id: int):
    db_value = get_custom_field_value(db, value_id, organisation_id)
    if db_value:
        db.delete(db_value)
        db.commit()
    return db_value
