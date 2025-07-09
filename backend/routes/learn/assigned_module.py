# backend/routes/learn/assigned_module.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from databases.database import get_db
import CRUD.learn.assigned_module as assign_crud
from schemas.learn.assigned_module import AssignedModuleCreate, AssignedModuleOut
from models.learn.assigned_module import AssignedModule

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


@router.get("/{assigned_module_id}", response_model=AssignedModuleOut)
def get_assigned_module(assigned_module_id: int, db: Session = Depends(get_db)):
    assignment = (
        db.query(AssignedModule)
        .options(joinedload(AssignedModule.module))  # ensure module is loaded
        .filter(AssignedModule.id == assigned_module_id)
        .first()
    )

    if not assignment:
        raise HTTPException(status_code=404, detail="Assigned module not found")

    return assignment
