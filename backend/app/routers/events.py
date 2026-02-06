from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.event import Event
from app.routers.pets import _get_pet_for_user
from app.schemas.event import EventCreate, EventOut

router = APIRouter(tags=["events"])


@router.get("/pets/{pet_id}/events", response_model=list[EventOut])
async def list_events(
    pet_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _get_pet_for_user(pet_id, current_user, db)
    result = await db.execute(
        select(Event).where(Event.pet_id == pet_id).order_by(Event.datetime_start.desc())
    )
    return [EventOut.model_validate(e) for e in result.scalars().all()]


@router.post("/pets/{pet_id}/events", response_model=EventOut, status_code=status.HTTP_201_CREATED)
async def create_event(
    pet_id: int,
    data: EventCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await _get_pet_for_user(pet_id, current_user, db)
    event = Event(**data.model_dump(), pet_id=pet_id)
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return EventOut.model_validate(event)
