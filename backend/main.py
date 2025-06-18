#backend/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.chat import router as chat_router
from routes.upload import router as upload_router
from routes.auth import router as auth_router
from routes.files import router as files_router
from routes.agents import router as agents_router 
from routes.lms import router as lms_router
from routes.users import router as users_router
from routes.superadmin import router as superadmin_router


# 🧠 Ensure both models are imported BEFORE creating metadata
import models.user
import models.organisation
import models.agent

from models.base import Base
from databases.database import engine as db_engine

Base.metadata.create_all(bind=db_engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://effective-meme-77g9vjx575ghrxgr-5173.app.github.dev"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router)
app.include_router(upload_router)
app.include_router(auth_router)
app.include_router(files_router)
app.include_router(agents_router)  # ✅ added here
app.include_router(lms_router)
app.include_router(users_router)
app.include_router(superadmin_router)

@app.get("/")
async def root():
    return {"message": "🚀 BaseCamp AI backend is running."}
