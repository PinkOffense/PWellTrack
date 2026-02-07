from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

connect_args = {}
if settings.is_postgres:
    # Supabase pooler requires SSL and no prepared statement cache
    connect_args = {"ssl": "require", "statement_cache_size": 0}

engine = create_async_engine(
    settings.async_database_url,
    echo=False,
    connect_args=connect_args,
    pool_pre_ping=True,
)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:  # type: ignore[misc]
    async with async_session() as session:
        yield session
