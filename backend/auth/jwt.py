# backend/auth/jwt.py

from datetime import datetime, timedelta
from jose import jwt

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"

def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    
    # ✅ Already good, but make sure it doesn't overwrite an existing "sub"
    if "sub" not in to_encode and "id" in data:
        to_encode["sub"] = str(data["id"])

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
