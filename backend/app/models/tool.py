"""SQLAlchemy ORM model for Tool Registry and Health Status."""

from datetime import datetime
from typing import Optional
from sqlalchemy import Integer, String, Text, DateTime, Float, Index
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base, utcnow


class ToolRegistry(Base):
    """Tool registry model for monitoring MCP tool capabilities, health, latency, and quotas."""

    __tablename__ = "tool_registry"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)  # github, grafana, postgres
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="ACTIVE", index=True)  # ACTIVE, DEGRADED, INACTIVE
    
    capabilities_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON list of capability strings
    last_check: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utcnow)
    latency_ms: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    error_rate: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    available_quota: Mapped[int] = mapped_column(Integer, nullable=False, default=5000)

    __table_args__ = (
        Index("idx_tool_name_status", "name", "status"),
    )
