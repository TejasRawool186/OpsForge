"""SQLAlchemy ORM model for Action Approval Requests."""

from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Text, DateTime, Float, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, utcnow

if TYPE_CHECKING:
    from app.models.incident import Incident
    from app.models.audit import AuditLog


class Approval(Base):
    """Approval request model managing human safety gates for high-risk actions."""

    __tablename__ = "approvals"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)  # e.g., apr-001
    incident_id: Mapped[str] = mapped_column(String(50), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False, index=True)
    
    action: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    risk_level: Mapped[str] = mapped_column(String(20), nullable=False, default="HIGH", index=True)  # SAFE, LOW, MEDIUM, HIGH, DESTRUCTIVE
    confidence: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    evidence_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    reversibility: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, default="FULLY_REVERSIBLE")
    estimated_downtime: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    verification_plan: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    alternatives_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    requested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utcnow, index=True)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="PENDING", index=True)  # PENDING, APPROVED, REJECTED, EXPIRED
    
    approved_by: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    approval_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    rejected_by: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    rejected_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    incident: Mapped["Incident"] = relationship("Incident", back_populates="approvals")
    audit_logs: Mapped[List["AuditLog"]] = relationship("AuditLog", back_populates="approval", lazy="selectin")

    __table_args__ = (
        Index("idx_approval_status_risk", "status", "risk_level"),
        Index("idx_approval_incident_status", "incident_id", "status"),
    )
