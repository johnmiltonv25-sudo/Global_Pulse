from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
import app.models
from app.routes import router

from sqlalchemy import text

# Create all database tables & auto-migrate new columns
Base.metadata.create_all(bind=engine)

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN firebase_uid VARCHAR(128);"))
        conn.commit()
    except Exception:
        pass
    try:
        conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_firebase_uid ON users (firebase_uid);"))
        conn.commit()
    except Exception:
        pass


app = FastAPI(
    title="Global Pulse API",
    version="1.0.0"
)

# Allow React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
    ],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routes
app.include_router(router)


@app.get("/")
def root():
    return {
        "message": "Global Pulse Backend Running Successfully 🚀"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }