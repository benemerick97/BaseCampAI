# backend/routes/learn/assigned_courses.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from schemas.learn.assigned_courses import (
    AssignedCourseCreate,
    AssignedCourseComplete,
    AssignedCourseOut,
)
from CRUD.learn import assigned_courses as crud
from databases.database import get_db

router = APIRouter(prefix="/learn", tags=["Course Assignments"])


@router.post("/assign-course", response_model=AssignedCourseOut)
def assign_course(payload: AssignedCourseCreate, db: Session = Depends(get_db)):
    try:
        assignment = crud.assign_course(db, payload)
        return assignment
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/complete-course", response_model=AssignedCourseOut)
def complete_course(payload: AssignedCourseComplete, db: Session = Depends(get_db)):
    try:
        assignment = crud.complete_course(
            db, user_id=payload.user_id, course_id=payload.course_id
        )
        return assignment
    except ValueError:
        raise HTTPException(status_code=404, detail="Assignment not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/assigned-courses", response_model=list[AssignedCourseOut])
def get_assigned_courses(user_id: str = Query(...), db: Session = Depends(get_db)):
    try:
        return crud.get_user_assignments(db, user_id=user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/assigned-courses/by-course/{course_id}")
def get_assigned_users_by_course(
    course_id: str,
    db: Session = Depends(get_db)
):
    try:
        # This assumes you have a similar custom join function in CRUD
        records = crud.get_users_assigned_to_course(db, course_id)

        return [
            {
                "id": a.id,
                "user_id": u_id,
                "course_id": a.course_id,
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
        print("🔥 ERROR in get_assigned_users_by_course:", e)
        raise HTTPException(status_code=500, detail=str(e))

