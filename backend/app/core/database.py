from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

connect_args = {}
if settings.is_postgres:
    # Supabase requires SSL — asyncpg accepts "require" as string
    connect_args = {"ssl": "require"}

engine = create_async_engine(
    settings.async_database_url,
    echo=False,
    connect_args=connect_args,
)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:  # type: ignore[misc]
    async with async_session() as session:
        yield session
