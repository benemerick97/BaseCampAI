#backend/routes/auth.py

from fastapi import APIRouter, HTTPException, Depends, Request, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload
from datetime import timedelta
from fastapi.responses import JSONResponse, Response

from models.user import User
from databases.database import SessionLocal
from utils.security import verify_password
from auth.jwt import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token
)

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

# === LOGIN ROUTE ===
@router.post("/login")
async def login(data: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).options(joinedload(User.organisation)).filter(User.email == data.email).first()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(minutes=60)
    )
    refresh_token = create_refresh_token(data={"sub": str(user.id)})

    # Set the refresh token as a secure HttpOnly cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,  # ⬅️ Set to False for localhost if needed
        samesite="Lax",
        max_age=7 * 24 * 60 * 60  # 7 days
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

# === REFRESH ROUTE ===
@router.post("/auth/refresh")
def refresh_token(request: Request):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Missing refresh token")

    payload = decode_refresh_token(refresh_token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    new_access_token = create_access_token(
        data={"sub": payload["sub"]},
        expires_delta=timedelta(minutes=60)
    )

    return {"access_token": new_access_token}

# === OPTIONS Support for CORS Preflight ===
@router.options("/login")
async def options_login():
    return Response(status_code=200)


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key="refresh_token",
        httponly=True,
        secure=True,       # 🔁 Match your login cookie settings
        samesite="Lax",
    )
    return {"detail": "Logged out"}
