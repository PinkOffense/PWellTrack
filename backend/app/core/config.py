from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "PWellTrack API"
    DATABASE_URL: str = "sqlite+aiosqlite:///./pwelltrack.db"
    SECRET_KEY: str = "change-me-in-production-use-a-real-secret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
