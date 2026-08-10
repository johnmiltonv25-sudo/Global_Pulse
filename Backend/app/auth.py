from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
from dotenv import load_dotenv
import os

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

import bcrypt

password_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# ------------------------------------
# Password Hashing
# ------------------------------------

def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


# ------------------------------------
# Password Verification
# ------------------------------------

def verify_password(password: str, hashed_password: str) -> bool:
    if not password or not hashed_password:
        return False
    try:
        pwd_bytes = password.encode("utf-8")[:72]
        return bcrypt.checkpw(pwd_bytes, hashed_password.encode("utf-8"))
    except Exception:
        try:
            return password_context.verify(password, hashed_password)
        except Exception:
            return False


# ------------------------------------
# JWT Token
# ------------------------------------

def create_access_token(
    data: dict,
    expires_minutes: int = 60
):
    payload = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=expires_minutes
    )

    payload.update(
        {
            "exp": expire
        }
    )

    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token


# ------------------------------------
# Firebase Security Dependency
# ------------------------------------

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.firebase_config import verify_firebase_token





# Security dependency for extracting and verifying Firebase Bearer Token from HTTP Authorization Header
security = HTTPBearer(auto_error=False)

def get_current_firebase_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    FastAPI Security Dependency that extracts and verifies Firebase Bearer Token from HTTP Authorization Header.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization token required.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        decoded_token = verify_firebase_token(credentials.credentials)
        return decoded_token
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(err),
            headers={"WWW-Authenticate": "Bearer"},
        )
