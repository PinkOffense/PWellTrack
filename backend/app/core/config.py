import logging

from pydantic_settings import BaseSettings

_logger = logging.getLogger("pwelltrack.config")

_INSECURE_SECRET = "change-me-in-production-use-a-real-secret"


class Settings(BaseSettings):
    APP_NAME: str = "PWellTrack API"
    DATABASE_URL: str = "sqlite+aiosqlite:///./pwelltrack.db"
    SECRET_KEY: str = _INSECURE_SECRET
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    CORS_ORIGINS: str = "https://p-well-track.vercel.app,http://localhost:3000"

    model_config = {"env_file": ".env", "extra": "ignore"}

    @property
    def async_database_url(self) -> str:
        """Convert DATABASE_URL to async-compatible format.
        Supabase/Render give postgres://... but SQLAlchemy needs postgresql+asyncpg://...
        """
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgresql://") and "+asyncpg" not in url:
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url

    @property
    def is_postgres(self) -> bool:
        """Check if using PostgreSQL (Supabase/production) vs SQLite (dev)."""
        return "postgresql" in self.DATABASE_URL or "postgres://" in self.DATABASE_URL

    @property
    def has_insecure_secret(self) -> bool:
        return self.is_postgres and self.SECRET_KEY == _INSECURE_SECRET


settings = Settings()
