from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from CRUD.work import custom_field as crud
from schemas.work.custom_field import CustomFieldCreate, CustomFieldOut, CustomFieldUpdate
from auth.dependencies import get_db, get_current_user
from models.user import User

router = APIRouter(prefix="/custom-fields", tags=["Custom Fields"])

@router.get("/", response_model=list[CustomFieldOut])
def list_custom_fields(entity_type: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return crud.get_custom_fields(db, organisation_id=user.organisation_id, entity_type=entity_type)

@router.get("/{field_id}", response_model=CustomFieldOut)
def get_custom_field(field_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    field = crud.get_custom_field(db, field_id=field_id, organisation_id=user.organisation_id)
    if not field:
        raise HTTPException(status_code=404, detail="Custom field not found")
    return field

@router.post("/", response_model=CustomFieldOut)
def create_custom_field(field_data: CustomFieldCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if field_data.organisation_id != user.organisation_id:
        raise HTTPException(status_code=403, detail="Cannot create field for a different organisation")
    return crud.create_custom_field(db, field_data)

@router.put("/{field_id}", response_model=CustomFieldOut)
def update_custom_field(field_id: int, field_data: CustomFieldUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    field = crud.update_custom_field(db, field_id, field_data, organisation_id=user.organisation_id)
    if not field:
        raise HTTPException(status_code=404, detail="Custom field not found")
    return field

@router.delete("/{field_id}")
def delete_custom_field(field_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    field = crud.delete_custom_field(db, field_id, organisation_id=user.organisation_id)
    if not field:
        raise HTTPException(status_code=404, detail="Custom field not found")
    return {"detail": "Custom field deleted"}
