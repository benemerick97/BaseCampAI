# backend/init_db.py
from databases.database import engine
from models.base import Base
import models.user
import models.organisation

# Create all tables
Base.metadata.create_all(bind=engine)
