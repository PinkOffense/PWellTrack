from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base
from app.routers import auth, pets, feeding, water, vaccines, medications, events, symptoms


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup (for local dev with SQLite)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(pets.router)
app.include_router(feeding.router)
app.include_router(water.router)
app.include_router(vaccines.router)
app.include_router(medications.router)
app.include_router(events.router)
app.include_router(symptoms.router)


@app.get("/")
async def root():
    return {"message": "PWellTrack API is running", "docs": "/docs"}
