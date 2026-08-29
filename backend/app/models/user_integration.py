"""UserIntegration model for multi-tenant tool credentials and configuration."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, JSON
from app.models.base import Base, utcnow


class UserIntegration(Base):
    """Stores per-user integration configurations and encrypted credentials."""

    __tablename__ = "user_integrations"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(255), nullable=False, index=True)
    tool_name = Column(String(64), nullable=False, index=True)  # e.g., 'github', 'grafana', 'postgres'
    display_name = Column(String(128), nullable=True)
    config = Column(JSON, nullable=False, default=dict)  # Non-secret config (urls, repo, db name, etc.)
    encrypted_credentials = Column(Text, nullable=True)  # AES-256 encrypted JSON string of secrets
    status = Column(String(32), nullable=False, default="UNTESTED")  # CONNECTED, ERROR, UNTESTED
    last_tested_at = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    def to_dict(self, include_secrets: bool = False) -> dict:
        """Convert to dictionary, concealing secrets by default."""
        data = {
            "id": self.id,
            "user_id": self.user_id,
            "tool_name": self.tool_name,
            "display_name": self.display_name or self.tool_name.capitalize(),
            "config": self.config or {},
            "status": self.status,
            "last_tested_at": self.last_tested_at.isoformat() if self.last_tested_at else None,
            "error_message": self.error_message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "has_credentials": bool(self.encrypted_credentials),
        }
        return data
