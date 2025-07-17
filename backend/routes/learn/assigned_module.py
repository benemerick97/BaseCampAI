from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from databases.database import get_db
import CRUD.learn.assigned_module as crud
from schemas.learn.assigned_module import AssignedModuleCreate, AssignedModuleOut, AssignedModuleUpdate
from models.learn.assigned_module import AssignedModule

router = APIRouter(prefix="/learn/assigned-modules", tags=["Assigned Modules"])


@router.post("/", response_model=AssignedModuleOut)
def assign_module(data: AssignedModuleCreate, db: Session = Depends(get_db)):
    try:
        return crud.assign_module(db, data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/by-user/{user_id}", response_model=list[AssignedModuleOut])
def get_user_modules(user_id: int, db: Session = Depends(get_db)):
    try:
        return crud.get_user_modules(db, user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{assigned_module_id}/complete", response_model=AssignedModuleOut)
def complete_module(assigned_module_id: int, db: Session = Depends(get_db)):
    try:
        result = crud.complete_module(db, assigned_module_id)
        if not result:
            raise HTTPException(status_code=404, detail="Assigned module not found")
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{assigned_module_id}", response_model=AssignedModuleOut)
def get_assigned_module(assigned_module_id: int, db: Session = Depends(get_db)):
    try:
        assignment = (
            db.query(AssignedModule)
            .options(joinedload(AssignedModule.module))
            .filter(AssignedModule.id == assigned_module_id)
            .first()
        )

        if not assignment:
            raise HTTPException(status_code=404, detail="Assigned module not found")

        return assignment
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/by-module/{module_id}")
def get_assigned_users_by_module(module_id: str, db: Session = Depends(get_db)):
    try:
        records = crud.get_users_assigned_to_module(db, module_id)
        return [
            {
                "id": a.id,
                "user_id": u_id,
                "module_id": a.module_id,
                "assigned_at": a.assigned_at,
                "completed_at": a.completed_at,
                "status": a.status,
                "user": {
                    "id": u_id,
                    "name": f"{first} {last}".strip(),
                    "email": email,
                },
            }
            for a, u_id, first, last, email in records
        ]
    except Exception as e:
        print("🔥 ERROR in get_assigned_users_by_module:", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/", response_model=AssignedModuleOut)
def update_assigned_module(payload: AssignedModuleUpdate, db: Session = Depends(get_db)):
    try:
        updates = payload.dict(exclude_unset=True)
        assignment = crud.update_assigned_module(db, payload.user_id, payload.module_id, updates)
        if not assignment:
            raise HTTPException(status_code=404, detail="Assignment not found")
        return assignment
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{user_id}/{module_id}", status_code=204)
def delete_assigned_module(user_id: int, module_id: UUID, db: Session = Depends(get_db)):
    success = crud.delete_assigned_module(db, user_id, module_id)
    if not success:
        raise HTTPException(status_code=404, detail="Assigned module not found")
    return
