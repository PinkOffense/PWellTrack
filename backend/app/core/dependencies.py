"""Shared FastAPI dependencies for pet ownership verification."""

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.pet import Pet
from app.models.user import User


async def get_pet_for_user(pet_id: int, user: User, db: AsyncSession) -> Pet:
    """Verify a pet belongs to the given user and return it, or raise 404."""
    pet = await db.get(Pet, pet_id)
    if not pet or pet.user_id != user.id:
        raise HTTPException(status_code=404, detail="Pet not found")
    return pet
