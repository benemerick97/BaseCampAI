import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from models.base import Base
from models import user, organisation, agent

# SQLite engine
sqlite_engine = create_engine("sqlite:///./app.db")
sqlite_session = Session(bind=sqlite_engine)

# PostgreSQL engine (read from .env)
import os
from dotenv import load_dotenv
load_dotenv()
postgres_engine = create_engine(os.getenv("DATABASE_URL"))
postgres_session = Session(bind=postgres_engine)

# Migrate organisations
orgs = sqlite_session.query(organisation.Organisation).all()
for org in orgs:
    postgres_session.merge(org)

# Migrate users
users = sqlite_session.query(user.User).all()
for u in users:
    postgres_session.merge(u)

# Migrate agents
agents = sqlite_session.query(agent.Agent).all()
for a in agents:
    postgres_session.merge(a)

# Commit to PostgreSQL
postgres_session.commit()

print("✅ Data migrated successfully.")
