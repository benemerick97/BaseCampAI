# backend/auth/dependencies.py

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session, joinedload  # ✅ import joinedload

from models.user import User
from databases.database import get_db  
from auth.jwt import ACCESS_SECRET_KEY as SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = int(payload.get("sub"))
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # ✅ This now loads the organisation relationship with short_name
    user = (
        db.query(User)
        .options(joinedload(User.organisation))
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return user

