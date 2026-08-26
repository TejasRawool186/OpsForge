"""Core application configuration settings for OpsForge Backend Infrastructure."""

import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings using Pydantic Settings."""

    PROJECT_NAME: str = "OpsForge"
    API_V1_STR: str = "/api/v1"

    # Database Settings
    # Default to sqlite async for local development & fast testing, configurable via env
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "sqlite+aiosqlite:///./opsforge.db"
    )

    # Database Pool Settings
    DB_POOL_SIZE: int = int(os.getenv("DB_POOL_SIZE", "10"))
    DB_MAX_OVERFLOW: int = int(os.getenv("DB_MAX_OVERFLOW", "20"))
    DB_POOL_RECYCLE: int = int(os.getenv("DB_POOL_RECYCLE", "3600"))
    DB_POOL_PRE_PING: bool = True

    class Config:
        case_sensitive = True


settings = Settings()
