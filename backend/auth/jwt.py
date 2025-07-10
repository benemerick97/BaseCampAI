# backend/auth/jwt.py

from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError

# Separate secrets for access and refresh tokens
ACCESS_SECRET_KEY = "your-access-secret-key"
REFRESH_SECRET_KEY = "your-refresh-secret-key"
ALGORITHM = "HS256"

# Access token creator (short-lived)
def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=60)) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})

    # Ensure a 'sub' field exists
    if "sub" not in to_encode and "id" in data:
        to_encode["sub"] = str(data["id"])

    return jwt.encode(to_encode, ACCESS_SECRET_KEY, algorithm=ALGORITHM)

# Refresh token creator (long-lived)
def create_refresh_token(data: dict, expires_delta: timedelta = timedelta(days=7)) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})

    if "sub" not in to_encode and "id" in data:
        to_encode["sub"] = str(data["id"])

    return jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM)

# Decode and validate refresh token
def decode_refresh_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
