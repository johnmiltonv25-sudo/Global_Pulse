import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Fallback string if no environment variable provided
if not DATABASE_URL:
    DATABASE_URL = "postgresql+psycopg2://postgres:P%40ssword%40123@localhost:5432/global_pulse"

try:
    if DATABASE_URL.startswith("sqlite"):
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    else:
        # Test PostgreSQL connection
        engine = create_engine(DATABASE_URL)
        conn = engine.connect()
        conn.close()
        print(f"[DATABASE] Connected to PostgreSQL: {DATABASE_URL.split('@')[-1]}")
except Exception as e:
    print(f"[DATABASE NOTICE] Could not connect to PostgreSQL ({e}). Auto-creating local SQLite database for seamless testing...")
    DATABASE_URL = "sqlite:///./global_pulse.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    print("[DATABASE] Successfully initialized local SQLite database (global_pulse.db)")

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()