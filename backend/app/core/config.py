"""Core application configuration settings for OpsForge Backend Infrastructure."""

import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings using Pydantic Settings."""

    PROJECT_NAME: str = "OpsForge"
    API_V1_STR: str = "/api/v1"

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "opsforge-dev-secret-key-change-in-production")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

    # Database Settings
    # Supports Supabase PostgreSQL and SQLite fallback
    DATABASE_URL_RAW: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./opsforge_dev.db")

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

    # GitHub App Configuration
    GITHUB_APP_ID: str = os.getenv("GITHUB_APP_ID", "")
    GITHUB_APP_PRIVATE_KEY: str = os.getenv("GITHUB_APP_PRIVATE_KEY", "")
    GITHUB_APP_CLIENT_ID: str = os.getenv("GITHUB_APP_CLIENT_ID", "")
    GITHUB_APP_CLIENT_SECRET: str = os.getenv("GITHUB_APP_CLIENT_SECRET", "")
    GITHUB_APP_NAME: str = os.getenv("GITHUB_APP_NAME", "OpsForge")
    GITHUB_APP_SLUG: str = os.getenv("GITHUB_APP_SLUG", "opsforge")

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"



settings = Settings()

