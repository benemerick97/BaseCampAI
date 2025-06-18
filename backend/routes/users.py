#backend/routes/users.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from databases.database import get_db  # update path as needed
from models.user import User
from schemas.user import UserUpdate, UserOut
from auth.dependencies import get_current_user  # auth dependency

router = APIRouter()

@router.patch("/users/{user_id}", response_model=UserUpdate)
def update_user(
    user_id: int,
    updates: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),  # ✅ Enforce auth
):
    if current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if updates.first_name is not None:
        user.first_name = updates.first_name
    if updates.last_name is not None:
        user.last_name = updates.last_name

    db.commit()
    db.refresh(user)
    return {
        "first_name": user.first_name,
        "last_name": user.last_name
    }

@router.get("/me", response_model=UserOut)
def get_me(
    current_user: User = Depends(get_current_user)
):
    return current_user