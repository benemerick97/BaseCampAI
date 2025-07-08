# routes/learn/skill.py

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from schemas.learn.skill import SkillCreate, SkillUpdate, SkillOut
from CRUD.learn.skill import (
    create_skill,
    get_skill,
    list_skills_by_org,
    update_skill,
    delete_skill,
)
from databases.database import get_db

router = APIRouter(prefix="/skills", tags=["Skills"])


@router.post("/", response_model=SkillOut)
def create_skill_route(
    request: Request,
    data: SkillCreate,
    db: Session = Depends(get_db),
):
    org_id = request.headers.get("x-org-id")
    if not org_id:
        raise HTTPException(status_code=400, detail="Missing organisation ID")
    try:
        org_id_int = int(org_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid organisation ID")
    return create_skill(db, org_id=org_id_int, data=data)


@router.get("/", response_model=list[SkillOut])
def list_skills(org_id: int, db: Session = Depends(get_db)):
    return list_skills_by_org(db, org_id)


@router.get("/{skill_id}", response_model=SkillOut)
def get_skill_route(skill_id: str, db: Session = Depends(get_db)):
    skill = get_skill(db, skill_id)
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    return skill


@router.put("/{skill_id}", response_model=SkillOut)
def update_skill_route(skill_id: str, data: SkillUpdate, db: Session = Depends(get_db)):
    updated = update_skill(db, skill_id, data)
    if not updated:
        raise HTTPException(status_code=404, detail="Skill not found")
    return updated


@router.delete("/{skill_id}", status_code=204)
def delete_skill_route(skill_id: str, db: Session = Depends(get_db)):
    success = delete_skill(db, skill_id)
    if not success:
        raise HTTPException(status_code=404, detail="Skill not found")
    return None
