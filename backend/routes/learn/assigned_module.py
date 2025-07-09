from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from databases.database import get_db
import CRUD.learn.assigned_module as assign_crud
from schemas.learn.assigned_module import AssignedModuleCreate, AssignedModuleOut

router = APIRouter(prefix="/learn/assigned-modules", tags=["Assigned Modules"])

@router.post("/", response_model=AssignedModuleOut)
def assign_module(data: AssignedModuleCreate, db: Session = Depends(get_db)):
    return assign_crud.assign_module(db, data)

@router.get("/by-user/{user_id}", response_model=list[AssignedModuleOut])
def get_user_modules(user_id: int, db: Session = Depends(get_db)):
    return assign_crud.get_user_modules(db, user_id)

@router.post("/{assigned_module_id}/complete", response_model=AssignedModuleOut)
def complete_module(assigned_module_id: int, db: Session = Depends(get_db)):
    return assign_crud.complete_module(db, assigned_module_id)
