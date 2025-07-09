from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from databases.database import get_db
import CRUD.learn.assigned_module_progress as progress_crud
from schemas.learn.assigned_module_progress import (
    AssignedModuleProgressCreate,
    AssignedModuleProgressOut
)
from schemas.learn.assigned_module import AssignedModuleOut
from pydantic import BaseModel
from fastapi.responses import JSONResponse


router = APIRouter(prefix="/learn/assigned-module-progress", tags=["Module Progress"])

# Response schema for hybrid return
class ProgressCompletionResponse(BaseModel):
    progress_item: AssignedModuleProgressOut
    module_status: AssignedModuleOut

    class Config:
        from_attributes = True

@router.post("/", response_model=AssignedModuleProgressOut)
def create_progress_item(data: AssignedModuleProgressCreate, db: Session = Depends(get_db)):
    return progress_crud.create_progress_item(db, data)

@router.post("/{item_id}/complete", response_model=ProgressCompletionResponse)
def complete_progress_item(item_id: int, db: Session = Depends(get_db)):
    item, module = progress_crud.complete_progress_item_with_module_status(db, item_id)
    if not item or not module:
        raise HTTPException(status_code=404, detail="Progress item or module not found")
    return {
        "progress_item": item,
        "module_status": module
    }

@router.get("/by-assignment/{assigned_module_id}", response_model=list[AssignedModuleProgressOut])
def get_module_progress(assigned_module_id: int, db: Session = Depends(get_db)):
    return progress_crud.get_progress_for_module(db, assigned_module_id)


@router.get("/by-user/{user_id}", response_model=list[AssignedModuleProgressOut])
def get_progress_for_user(user_id: int, db: Session = Depends(get_db)):
    return progress_crud.get_progress_for_user(db, user_id)


@router.get("/progress-percentage/{assigned_module_id}")
def get_module_progress_percentage(assigned_module_id: int, db: Session = Depends(get_db)):
    percentage = progress_crud.get_module_progress_percentage(db, assigned_module_id)
    return JSONResponse(content={"progress_percentage": percentage})
