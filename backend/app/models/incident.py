"""SQLAlchemy ORM model for Incident management."""

from datetime import datetime, timezone
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Text, DateTime, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, utcnow

if TYPE_CHECKING:
    from app.models.event import IncidentEvent
    from app.models.investigation import Investigation
    from app.models.approval import Approval
    from app.models.audit import AuditLog
    from app.models.remediation import RemediationLog


class Incident(Base):
    """Incident database table representing an operational incident."""

    __tablename__ = "incidents"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)  # e.g., INC-2026-001
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    service: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    severity: Mapped[str] = mapped_column(String(20), nullable=False, default="MEDIUM", index=True)  # LOW, MEDIUM, HIGH, CRITICAL
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="CREATED", index=True)  # CREATED, INVESTIGATING, ROOT_CAUSE_FOUND, PROPOSING_ACTION, APPROVAL_REQUIRED, EXECUTING, VERIFYING, RESOLVED, CLOSED
    
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    alert_source: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    alert_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utcnow, onupdate=utcnow)
    created_by: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, default="system")
    
    estimated_impact: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    affected_users: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    current_phase: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, default="Initial Detection")
    agent_status: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, default="Idle")

    # Relationships
    events: Mapped[List["IncidentEvent"]] = relationship("IncidentEvent", back_populates="incident", cascade="all, delete-orphan", lazy="selectin")
    investigations: Mapped[List["Investigation"]] = relationship("Investigation", back_populates="incident", cascade="all, delete-orphan", lazy="selectin")
    approvals: Mapped[List["Approval"]] = relationship("Approval", back_populates="incident", cascade="all, delete-orphan", lazy="selectin")
    audit_logs: Mapped[List["AuditLog"]] = relationship("AuditLog", back_populates="incident", cascade="all, delete-orphan", lazy="selectin")
    remediations: Mapped[List["RemediationLog"]] = relationship("RemediationLog", back_populates="incident", cascade="all, delete-orphan", lazy="selectin")

    __table_args__ = (
        Index("idx_incident_status_service", "status", "service"),
        Index("idx_incident_created_severity", "created_at", "severity"),
    )
