#backend/routes/auth.py

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from datetime import timedelta

from models.user import User
from databases.database import SessionLocal
from utils.security import verify_password
from auth.jwt import create_access_token  # Or wherever you defined it

router = APIRouter()

# === Request Schema ===
class LoginRequest(BaseModel):
    email: str
    password: str

# === DB Dependency ===
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# === Login Route ===
@router.post("/login")
async def login(data: LoginRequest, db: Session = Depends(get_db)):
    print(f"🔐 Attempting login with: {data.email}")

    user = db.query(User).options(joinedload(User.organisation)).filter(User.email == data.email).first()

    if not user:
        print("❌ User not found")
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(data.password, user.hashed_password):
        print("❌ Password mismatch")
        raise HTTPException(status_code=401, detail="Invalid email or password")

    print("✅ Login successful")

    # ✅ FIX: Store user ID in 'sub' claim
    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=60)
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "organisation": {
                "id": user.organisation.id,
                "name": user.organisation.name
            } if user.organisation else None
        }
    }
