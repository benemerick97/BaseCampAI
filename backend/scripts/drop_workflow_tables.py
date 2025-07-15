# scripts/drop_workflow_tables.py

from sqlalchemy import create_engine, text

# 🔐 Use your real Railway PostgreSQL connection URL
DATABASE_URL = "postgresql+psycopg2://postgres:TvgOsaSGzhcUrIZiOtPcBgRGQdhFKJuO@switchback.proxy.rlwy.net:38889/railway"

engine = create_engine(DATABASE_URL)

with engine.begin() as conn:
    print("🔨 Dropping workflow-related tables...")
    conn.execute(text("DROP TABLE IF EXISTS input_fields CASCADE"))
    conn.execute(text("DROP TABLE IF EXISTS workflow_steps CASCADE"))
    conn.execute(text("DROP TABLE IF EXISTS step_groups CASCADE"))
    conn.execute(text("DROP TABLE IF EXISTS workflows CASCADE"))
    print("✅ Tables dropped.")
