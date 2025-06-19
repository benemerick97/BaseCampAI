#backend/routes/work/custom_field_values.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from CRUD.work import custom_field_value as crud
from schemas.work.custom_field_value import CustomFieldValueCreate, CustomFieldValueOut, CustomFieldValueUpdate
from auth.dependencies import get_db, get_current_user
from models.user import User

router = APIRouter(prefix="/custom-field-values", tags=["Custom Field Values"])

@router.get("/entity/{entity_id}", response_model=list[CustomFieldValueOut])
def get_values_for_entity(entity_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return crud.get_custom_field_values(db, entity_id=entity_id, organisation_id=user.organisation_id)

@router.get("/{value_id}", response_model=CustomFieldValueOut)
def get_value(value_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    value = crud.get_custom_field_value(db, value_id=value_id, organisation_id=user.organisation_id)
    if not value:
        raise HTTPException(status_code=404, detail="Custom field value not found")
    return value

@router.post("/", response_model=CustomFieldValueOut)
def create_value(value_data: CustomFieldValueCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    value = crud.create_custom_field_value(db, value_data, organisation_id=user.organisation_id)
    if not value:
        raise HTTPException(status_code=400, detail="Invalid or unauthorised custom field reference")
    return value

@router.put("/{value_id}", response_model=CustomFieldValueOut)
def update_value(value_id: int, value_data: CustomFieldValueUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    value = crud.update_custom_field_value(db, value_id, value_data, organisation_id=user.organisation_id)
    if not value:
        raise HTTPException(status_code=404, detail="Custom field value not found")
    return value

@router.delete("/{value_id}")
def delete_value(value_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    deleted = crud.delete_custom_field_value(db, value_id, organisation_id=user.organisation_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Custom field value not found")
    return {"detail": "Custom field value deleted"}
