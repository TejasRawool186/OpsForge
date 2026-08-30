"""GitHub App connection model for OpsForge workspace-scoped GitHub integrations."""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text
from app.models.base import Base, utcnow


class GitHubConnection(Base):
    """Stores GitHub App installation details for a workspace."""

    __tablename__ = "github_connections"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String(36), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    github_user_id = Column(String(64), nullable=True)
    github_username = Column(String(255), nullable=True)
    installation_id = Column(String(64), nullable=True, index=True)
    auth_method = Column(String(32), nullable=False, default="github_app")  # 'github_app' or 'pat_legacy'
    status = Column(String(32), nullable=False, default="PENDING")  # PENDING, CONNECTED, ERROR, DISCONNECTED
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "workspace_id": self.workspace_id,
            "user_id": self.user_id,
            "github_username": self.github_username,
            "installation_id": self.installation_id,
            "auth_method": self.auth_method,
            "status": self.status,
            "error_message": self.error_message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class GitHubRepository(Base):
    """Stores selected repositories for a GitHub App installation."""

    __tablename__ = "github_repositories"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    github_connection_id = Column(
        String(36), ForeignKey("github_connections.id", ondelete="CASCADE"), nullable=False, index=True
    )
    github_repo_id = Column(String(64), nullable=True)
    owner = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    full_name = Column(String(512), nullable=False)
    default_branch = Column(String(255), nullable=True, default="main")
    is_selected = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "github_connection_id": self.github_connection_id,
            "github_repo_id": self.github_repo_id,
            "owner": self.owner,
            "name": self.name,
            "full_name": self.full_name,
            "default_branch": self.default_branch,
            "is_selected": self.is_selected,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
