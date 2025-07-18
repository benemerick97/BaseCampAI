#backend/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from scheduler.tasks import register_scheduled_tasks

from routes.chat import router as chat_router
from routes.upload import router as upload_router
from routes.auth import router as auth_router
from routes.files import router as files_router
from routes.agents import router as agents_router 
from routes.lms import router as lms_router
from routes.users import router as users_router
from routes.superadmin import router as superadmin_router
from routes.work.sites import router as sites_router
from routes.work.custom_fields import router as custom_fields_router
from routes.work.custom_field_values import router as custom_field_values_router
from routes.work.assets import router as asset_router
from routes.document import router as document_router
from routes.learn.course import router as course_router
from routes.learn.assigned_courses import router as assigned_courses_router
from routes.learn.skill import router as skills_router
from routes.learn.assigned_skills import router as assigned_skills_router
from routes.organisation import router as organisation_router
from routes.learn.assigned_module import router as assigned_module_router
from routes.learn.assigned_module_progress import router as assigned_module_progress_router
from routes.learn.module import router as module_router
from routes.work.workflow import router as worflow_router



# 🧠 Ensure both models are imported BEFORE creating metadata
import models.user
import models.organisation
import models.agent

from models.base import Base
from databases.database import engine as db_engine

Base.metadata.create_all(bind=db_engine)

app = FastAPI(redirect_slashes=True)

register_scheduled_tasks(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://effective-meme-77g9vjx575ghrxgr-5173.app.github.dev",
        "https://app.hellobasecamp.com.au",
        "https://base-camp-ai-benemerick97s-projects.vercel.app/",
        "https://base-camp-ai-git-main-benemerick97s-projects.vercel.app/",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(upload_router)
app.include_router(auth_router)
app.include_router(files_router)
app.include_router(agents_router) 
app.include_router(lms_router)
app.include_router(users_router)
app.include_router(superadmin_router)
app.include_router(sites_router)
app.include_router(custom_fields_router)
app.include_router(custom_field_values_router)
app.include_router(asset_router)
app.include_router(document_router)
app.include_router(course_router)
app.include_router(assigned_courses_router)
app.include_router(skills_router)
app.include_router(assigned_skills_router)
app.include_router(organisation_router)
app.include_router(module_router)
app.include_router(assigned_module_progress_router)
app.include_router(assigned_module_router)
app.include_router(worflow_router)

@app.get("/")
async def root():
    return {"message": "🚀 BaseCamp AI backend is running."}
