# routes/learn/assigned_skills.py

from uuid import UUID
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    UploadFile,
    File,
    Form,
)
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from schemas.learn.assigned_skill import (
    AssignedSkillCreate,
    AssignedSkillComplete,
    AssignedSkillOut,
    AssignedSkillUpdate,
)
from CRUD.learn import assigned_skill as crud
from databases.database import get_db
from utils.r2_client import upload_to_r2  # Adjust if needed
import os

router = APIRouter(prefix="/learn", tags=["Skill Assignments"])


@router.post("/assign-skill", response_model=AssignedSkillOut)
def assign_skill(payload: AssignedSkillCreate, db: Session = Depends(get_db)):
    try:
        assignment = crud.assign_skill(db, payload)
        return assignment
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/complete-skill", response_model=AssignedSkillOut)
def complete_skill(payload: AssignedSkillComplete, db: Session = Depends(get_db)):
    try:
        assignment = crud.complete_skill(
            db,
            user_id=payload.user_id,
            skill_id=payload.skill_id,
            evidence_file_url=payload.evidence_file_url,
        )
        return assignment
    except ValueError:
        raise HTTPException(status_code=404, detail="Assignment not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/assigned-skills", response_model=list[AssignedSkillOut])
def get_assigned_skills(user_id: int = Query(...), db: Session = Depends(get_db)):
    try:
        return crud.get_user_assigned_skills(db, user_id=user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/assigned_skills/upload", response_model=AssignedSkillOut)
async def upload_and_complete_skill_evidence(
    file: UploadFile = File(...),
    user_id: int = Form(...),
    skill_id: str = Form(...),
    db: Session = Depends(get_db),
):
    key = f"evidence/user_{user_id}/skill_{skill_id}/{file.filename}"

    try:
        # Upload to R2
        upload_to_r2(file.file, key, file.content_type)

        # Build public file URL
        file_url = f"{os.getenv('R2_ENDPOINT')}/{os.getenv('R2_BUCKET')}/{key}"

        # Mark skill as completed
        assignment = crud.complete_skill(
            db=db,
            user_id=user_id,
            skill_id=skill_id,
            evidence_file_url=file_url,
        )

        return assignment

    except ValueError:
        raise HTTPException(status_code=404, detail="Assignment not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/assigned-skills/by-skill/{skill_id}")
def get_assigned_users_by_skill(skill_id: str, db: Session = Depends(get_db)):
    try:
        records = crud.get_users_assigned_to_skill(db, skill_id)
        return [
            {
                "id": a.id,
                "user_id": u_id,
                "skill_id": a.skill_id,
                "assigned_by": a.assigned_by,
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
        print("🔥 ERROR in get_assigned_users_by_skill:", e)
        raise HTTPException(status_code=500, detail=str(e))
    

@router.patch("/assigned-skills", response_model=AssignedSkillOut)
def update_assigned_skill(payload: AssignedSkillUpdate, db: Session = Depends(get_db)):
    try:
        updates = payload.dict(exclude_unset=True)
        assignment = crud.update_assigned_skill(db, payload.user_id, payload.skill_id, updates)
        if not assignment:
            raise HTTPException(status_code=404, detail="Assignment not found")
        return assignment
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/assigned-skills/{user_id}/{skill_id}", status_code=204)
def remove_assigned_skill(user_id: int, skill_id: UUID, db: Session = Depends(get_db)):
    assignment = db.query(crud.AssignedSkill).filter_by(user_id=user_id, skill_id=skill_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assigned skill not found")

    db.delete(assignment)
    db.commit()
    return


@router.post("/assigned-skills/expire", summary="Manually expire skills based on expiry_duration")
def expire_assigned_skills(db: Session = Depends(get_db)):
    try:
        crud.expire_skills(db)
        return {"status": "success", "message": "Expired skills updated."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.post("/assigned-skills/mark-overdue", summary="Manually mark overdue skills based on due_date")
def mark_overdue_assigned_skills(db: Session = Depends(get_db)):
    try:
        crud.mark_overdue_skills(db)
        return {"status": "success", "message": "Overdue skills updated."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
