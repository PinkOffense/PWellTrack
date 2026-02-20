from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_pet_for_user
from app.core.security import get_current_user
from app.models.user import User
from app.models.event import Event
from app.schemas.event import EventCreate, EventUpdate, EventOut

router = APIRouter(tags=["events"])

_ALLOWED_FIELDS = {"type", "title", "datetime_start", "duration_minutes", "location", "notes", "reminder_minutes_before"}


@router.get("/pets/{pet_id}/events", response_model=list[EventOut])
async def list_events(
    pet_id: int,
    date_from: datetime | None = Query(None),
    date_to: datetime | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await get_pet_for_user(pet_id, current_user, db)
    q = select(Event).where(Event.pet_id == pet_id)
    if date_from:
        q = q.where(Event.datetime_start >= date_from)
    if date_to:
        q = q.where(Event.datetime_start <= date_to)
    q = q.order_by(Event.datetime_start.desc()).limit(limit).offset(offset)
    result = await db.execute(q)
    return [EventOut.model_validate(e) for e in result.scalars().all()]


@router.post("/pets/{pet_id}/events", response_model=EventOut, status_code=status.HTTP_201_CREATED)
async def create_event(
    pet_id: int,
    data: EventCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await get_pet_for_user(pet_id, current_user, db)
    event = Event(**data.model_dump(), pet_id=pet_id)
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return EventOut.model_validate(event)


@router.put("/events/{event_id}", response_model=EventOut)
async def update_event(
    event_id: int,
    data: EventUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    await get_pet_for_user(event.pet_id, current_user, db)
    for key, value in data.model_dump(exclude_unset=True).items():
        if key in _ALLOWED_FIELDS:
            setattr(event, key, value)
    await db.commit()
    await db.refresh(event)
    return EventOut.model_validate(event)


@router.delete("/events/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    event = await db.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    await get_pet_for_user(event.pet_id, current_user, db)
    await db.delete(event)
    await db.commit()
