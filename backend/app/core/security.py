from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import secrets

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# ── Password hashing (PBKDF2-SHA256, pure Python) ──

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    h = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100_000)
    return f"{salt}${h.hex()}"


def verify_password(plain: str, hashed: str) -> bool:
    try:
        salt, hash_hex = hashed.split("$", 1)
        h = hashlib.pbkdf2_hmac("sha256", plain.encode(), salt.encode(), 100_000)
        return hmac.compare_digest(h.hex(), hash_hex)
    except (ValueError, AttributeError, UnicodeDecodeError):
        return False


# ── JWT via PyJWT ──

def create_access_token(subject: int) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(subject),
        "type": "access",
        "iat": now,
        "exp": now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(subject: int) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(subject),
        "type": "refresh",
        "iat": now,
        "exp": now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def _decode_jwt(token: str, expected_type: str | None = None) -> dict:
    """Decode and verify a JWT token. Optionally check the token type claim."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise ValueError("Token expired")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid token")

    if expected_type and payload.get("type") != expected_type:
        raise ValueError(f"Expected {expected_type} token")
    return payload


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = _decode_jwt(token, expected_type="access")
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        uid = int(user_id)
    except (ValueError, KeyError, TypeError):
        raise credentials_exception

    user = await db.get(User, uid)
    if user is None:
        raise credentials_exception
    return user
