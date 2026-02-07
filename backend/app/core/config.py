from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "PWellTrack API"
    DATABASE_URL: str = "sqlite+aiosqlite:///./pwelltrack.db"
    SECRET_KEY: str = "change-me-in-production-use-a-real-secret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    model_config = {"env_file": ".env", "extra": "ignore"}

    @property
    def async_database_url(self) -> str:
        """Convert DATABASE_URL to async-compatible format.
        Render gives postgres://... but SQLAlchemy needs postgresql+asyncpg://...
        """
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url


settings = Settings()
