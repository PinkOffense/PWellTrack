from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "PWellTrack API"
    DATABASE_URL: str = "sqlite+aiosqlite:///./pwelltrack.db"
    SECRET_KEY: str = "change-me-in-production-use-a-real-secret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    SUPABASE_URL: str = "https://bbrlzpxctxwqclwudnuj.supabase.co"
    SUPABASE_ANON_KEY: str = ""
    CORS_ORIGINS: str = "*"

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


settings = Settings()
