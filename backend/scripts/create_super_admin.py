# scripts/create_super_admin.py

from databases.database import SessionLocal
from models.organisation import Organisation
from models.user import User
import bcrypt

# 1. Create DB session
db = SessionLocal()

# 2. Create Organisation
org = Organisation(name="Real Time Instruments")
db.add(org)
db.commit()
db.refresh(org)

# 3. Hash password
plain_password = "your_super_secure_password"
hashed_password = bcrypt.hashpw(plain_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

# 4. Create Super Admin User
user = User(
    email="benemerick97@gmail.com",
    hashed_password=hashed_password,
    role="super_admin",
    organisation_id=org.id
)

db.add(user)
db.commit()

print(f"✅ Created organisation '{org.name}' and super admin '{user.email}'")
