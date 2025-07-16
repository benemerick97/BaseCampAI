from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from databases.database import get_db
import CRUD.learn.module as module_crud
from schemas.learn.module import ModuleCreate, ModuleUpdate, ModuleOut
from schemas.learn.skill import SkillOut
from CRUD.learn.module import get_module_skills
from schemas.learn.course import CourseOut
from CRUD.learn.module import get_module_courses

router = APIRouter(prefix="/learn/modules/", tags=["Modules"])


@router.post("/", response_model=ModuleOut)
def create_module(
    module_data: ModuleCreate,
    org_id: int = Query(...),
    db: Session = Depends(get_db),
):
    return module_crud.create_module(db, module_data, org_id)


@router.get("/", response_model=list[ModuleOut])
def list_modules(
    org_id: int = Query(...),
    db: Session = Depends(get_db),
):
    return module_crud.get_all_modules(db, org_id)


@router.get("/{module_id}", response_model=ModuleOut)
def get_module(
    module_id: str,
    db: Session = Depends(get_db),
):
    module = module_crud.get_module(db, module_id)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    return module


@router.put("/{module_id}", response_model=ModuleOut)
def update_module(
    module_id: str,
    updates: ModuleUpdate,
    org_id: int = Query(...),
    db: Session = Depends(get_db),
):
    updated = module_crud.update_module(db, module_id, updates, org_id)
    if not updated:
        raise HTTPException(status_code=404, detail="Module not found")
    return updated


@router.delete("/{module_id}")
def delete_module(
    module_id: str,
        db: Session = Depends(get_db),
):
    module_crud.delete_module(db, module_id)
    return {"detail": "Module deleted"}


@router.get("/{module_id}/skills", response_model=List[SkillOut])
def list_module_skills(
    module_id: UUID,
    db: Session = Depends(get_db),
):
    return get_module_skills(db, module_id)


@router.get("/{module_id}/courses", response_model=List[CourseOut])
def list_module_courses(
    module_id: UUID,
    db: Session = Depends(get_db),
):
    return get_module_courses(db, module_id)
