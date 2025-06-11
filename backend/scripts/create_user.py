import sys
import os

# Add backend directory to sys.path so imports work
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.orm import Session
from models.base import Base
from models.user import User
from databases.database import engine, SessionLocal
from utils.security import hash_password

# Ensure the users table exists
Base.metadata.create_all(bind=engine)

def create_user():
    db: Session = SessionLocal()

    email = "benemerick97@gmail.com"
    password = "pass"
    role = "super_admin"

    user = db.query(User).filter(User.email == email).first()
    if user:
        print(f"⚠️ User with email '{email}' already exists.")
        return

    new_user = User(
        email=email,
        hashed_password=hash_password(password),
        role=role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    print(f"✅ Created user '{new_user.email}' with role '{new_user.role}'")

if __name__ == "__main__":
    create_user()
