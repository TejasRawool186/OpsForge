"""Core application configuration settings for OpsForge Backend Infrastructure."""

import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings using Pydantic Settings."""

    PROJECT_NAME: str = "OpsForge"
    API_V1_STR: str = "/api/v1"

    # Database Settings
    # Supports Supabase PostgreSQL and SQLite fallback
    DATABASE_URL_RAW: str = os.getenv(
        "DATABASE_URL",
        "postgresql+asyncpg://postgres:givemesunshine21lpa@db.lmglaazccinekrndvvqy.supabase.co:5432/postgres"
    )

    @property
    def DATABASE_URL(self) -> str:
        url = self.DATABASE_URL_RAW
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+asyncpg://", 1)
        if url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql+asyncpg://", 1)
        return url

    # Database Pool Settings
    DB_POOL_SIZE: int = int(os.getenv("DB_POOL_SIZE", "10"))
    DB_MAX_OVERFLOW: int = int(os.getenv("DB_MAX_OVERFLOW", "20"))
    DB_POOL_RECYCLE: int = int(os.getenv("DB_POOL_RECYCLE", "3600"))
    DB_POOL_PRE_PING: bool = True

    class Config:
        case_sensitive = True


settings = Settings()
