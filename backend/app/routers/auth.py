import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, get_current_user
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserOut, TokenResponse, GoogleAuthRequest, PasswordChange

from pydantic import BaseModel as _BaseModel


class _PhotoData(_BaseModel):
    photo_data: str

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(request: Request, data: UserCreate, db: AsyncSession = Depends(get_db)):
    email = data.email.lower()
    existing = await db.execute(select(User).where(User.email == email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=data.name,
        email=email,
        password_hash=hash_password(data.password),
    )
    db.add(user)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Email already registered")
    await db.refresh(user)

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
async def login(request: Request, data: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email.lower()))
    user = result.scalar_one_or_none()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.post("/google", response_model=TokenResponse)
@limiter.limit("10/minute")
async def google_auth(request: Request, data: GoogleAuthRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate via Google OAuth (Supabase). Creates user if not exists."""
    # Verify the Supabase token
    if not settings.SUPABASE_URL or not settings.SUPABASE_ANON_KEY:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{settings.SUPABASE_URL}/auth/v1/user",
                headers={
                    "Authorization": f"Bearer {data.supabase_token}",
                    "apikey": settings.SUPABASE_ANON_KEY,
                },
            )
    except (httpx.ConnectError, httpx.TimeoutException):
        raise HTTPException(status_code=502, detail="Could not verify Google token")
    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    supabase_user = resp.json()
    verified_email = supabase_user.get("email", "")
    if verified_email.lower() != data.email.lower():
        raise HTTPException(status_code=401, detail="Email mismatch")

    # Find or create user
    email = data.email.lower()
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user:
        user = User(
            name=data.name,
            email=email,
            password_hash="!google-oauth",
        )
        db.add(user)
        try:
            await db.commit()
        except IntegrityError:
            await db.rollback()
            result = await db.execute(select(User).where(User.email == email))
            user = result.scalar_one_or_none()
            if not user:
                raise HTTPException(status_code=500, detail="Account creation failed")
        else:
            await db.refresh(user)

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
async def me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(current_user: User = Depends(get_current_user)):
    """Issue a fresh token for an authenticated user."""
    token = create_access_token(current_user.id)
    return TokenResponse(access_token=token, user=UserOut.model_validate(current_user))


# ── Profile photo ────────────────────────────────────────────────────────

@router.put("/photo", response_model=UserOut)
async def update_photo_json(
    data: _PhotoData,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Accept photo as base64 data URI in a JSON body (avoids multipart issues)."""
    if not data.photo_data.startswith("data:image/"):
        raise HTTPException(status_code=400, detail="Invalid photo data")
    if len(data.photo_data) > 7_000_000:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 5 MB")
    current_user.photo_url = data.photo_data
    await db.commit()
    await db.refresh(current_user)
    return UserOut.model_validate(current_user)


@router.delete("/photo", response_model=UserOut)
async def delete_profile_photo(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    current_user.photo_url = None
    await db.commit()
    await db.refresh(current_user)
    return UserOut.model_validate(current_user)


# ── Change password ──────────────────────────────────────────────────────

@router.put("/password", response_model=UserOut)
async def change_password(
    data: PasswordChange,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.password_hash == "!google-oauth":
        raise HTTPException(status_code=400, detail="Google accounts cannot change password")

    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    current_user.password_hash = hash_password(data.new_password)
    await db.commit()
    await db.refresh(current_user)
    return UserOut.model_validate(current_user)


# ── Delete account ───────────────────────────────────────────────────────

@router.delete("/account", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete the user account and all associated data (pets, logs, etc.)."""
    await db.delete(current_user)
    await db.commit()
