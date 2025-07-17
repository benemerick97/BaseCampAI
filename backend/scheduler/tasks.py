from fastapi_utils.tasks import repeat_every
from fastapi import FastAPI
from sqlalchemy.orm import Session
from databases.database import get_db_session

from CRUD.learn.assigned_courses import expire_courses, mark_overdue_courses
from CRUD.learn.assigned_skill import expire_skills, mark_overdue_skills

def register_scheduled_tasks(app: FastAPI):
    @app.on_event("startup")
    @repeat_every(seconds=60 * 60 * 24)  # every 24 hours
    def run_expiry_tasks() -> None:
        db: Session = get_db_session()
        try:
            expire_courses(db)
            mark_overdue_courses(db)
            expire_skills(db)
            mark_overdue_skills(db)
            print("✅ Expiry + overdue task completed")
        except Exception as e:
            print("🔥 Scheduled task failed:", e)
        finally:
            db.close()
