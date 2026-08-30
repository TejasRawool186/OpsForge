"""Workspace and onboarding models for multi-tenant OpsForge architecture."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Enum as SAEnum
from sqlalchemy.orm import relationship
from app.models.base import Base, utcnow
import enum


class OnboardingStatus(str, enum.Enum):
    NOT_STARTED = "NOT_STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    GITHUB_CONNECTED = "GITHUB_CONNECTED"
    GRAFANA_CONNECTED = "GRAFANA_CONNECTED"
    DATABASE_CONNECTED = "DATABASE_CONNECTED"
    SAFETY_CONFIGURED = "SAFETY_CONFIGURED"
    READY = "READY"
    COMPLETED = "COMPLETED"


class Workspace(Base):
    """Represents one operational environment (e.g., Acme Production)."""

    __tablename__ = "workspaces"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    environment = Column(String(50), nullable=False, default="production")
    region = Column(String(50), nullable=True, default="us-east-1")
    owner_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    onboarding_status = Column(
        String(32),
        nullable=False,
        default=OnboardingStatus.NOT_STARTED.value,
    )
    onboarding_step = Column(String(32), nullable=True, default="welcome")
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    # Relationships
    members = relationship("WorkspaceMember", back_populates="workspace", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "environment": self.environment,
            "region": self.region,
            "owner_id": self.owner_id,
            "onboarding_status": self.onboarding_status,
            "onboarding_step": self.onboarding_step,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class WorkspaceMember(Base):
    """Maps users to workspaces with roles."""

    __tablename__ = "workspace_members"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    role = Column(String(50), nullable=False, default="SRE_OPERATOR")
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)

    # Relationships
    workspace = relationship("Workspace", back_populates="members")

    def to_dict(self):
        return {
            "id": self.id,
            "workspace_id": self.workspace_id,
            "user_id": self.user_id,
            "role": self.role,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
