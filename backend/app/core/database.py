from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

from app.core.config import settings

connect_args = {}
engine_kwargs = {}
if settings.is_postgres:
    # Supabase pooler (pgbouncer) requires:
    # - SSL for external connections
    # - No prepared statement cache (pgbouncer doesn't support them)
    # - NullPool so pgbouncer handles all connection pooling
    connect_args = {"ssl": "require", "statement_cache_size": 0}
    engine_kwargs = {"poolclass": NullPool}

engine = create_async_engine(
    settings.async_database_url,
    echo=False,
    connect_args=connect_args,
    **engine_kwargs,
)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:  # type: ignore[misc]
    async with async_session() as session:
        yield session
