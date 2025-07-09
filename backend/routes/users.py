# backend/routes/users.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from databases.database import get_db
from models.user import User
from schemas.user import UserUpdate, UserOut, UserCreate
from auth.dependencies import get_current_user
from utils.security import hash_password

router = APIRouter()


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/users", response_model=list[UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(User).filter(User.organisation_id == current_user.organisation_id).all()


from utils.security import hash_password  # ⬅️ Add this

@router.post("/users/invite", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def invite_user(
    new_user: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = db.query(User).filter(User.email == new_user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with that email already exists")

    if not new_user.password:
        raise HTTPException(status_code=400, detail="Password is required")

    hashed_pw = hash_password(new_user.password)

    user = User(
        email=new_user.email,
        first_name=new_user.first_name,
        last_name=new_user.last_name,
        role=new_user.role,
        organisation_id=current_user.organisation_id,
        hashed_password=hashed_pw,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.patch("/users/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    updates: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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
    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.organisation_id != current_user.organisation_id:
        raise HTTPException(status_code=403, detail="Access denied")

    db.delete(user)
    db.commit()

@router.get("/users/{user_id}", response_model=UserOut)
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Ensure the user belongs to the same org
    if user.organisation_id != current_user.organisation_id:
        raise HTTPException(status_code=403, detail="Access denied")

    return user
