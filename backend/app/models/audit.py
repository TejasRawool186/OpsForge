"""SQLAlchemy ORM model for Audit Logging."""

from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy import Integer, String, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, utcnow

if TYPE_CHECKING:
    from app.models.incident import Incident
    from app.models.approval import Approval


class AuditLog(Base):
    """Audit log model for security tracking of approval decisions and high-risk system actions."""

    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    incident_id: Mapped[str] = mapped_column(String(50), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False, index=True)
    approval_id: Mapped[Optional[str]] = mapped_column(String(50), ForeignKey("approvals.id", ondelete="SET NULL"), nullable=True, index=True)
    
    action_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # APPROVAL_DECISION, RISK_ASSESSMENT, REMEDIATION_TRIGGER
    actor: Mapped[str] = mapped_column(String(100), nullable=False, default="system")
    decision: Mapped[str] = mapped_column(String(50), nullable=False)  # APPROVED, REJECTED, AUTO_EXECUTED
    reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utcnow, index=True)
    metadata_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    incident: Mapped["Incident"] = relationship("Incident", back_populates="audit_logs")
    approval: Mapped[Optional["Approval"]] = relationship("Approval", back_populates="audit_logs")

    __table_args__ = (
        Index("idx_audit_incident_time", "incident_id", "timestamp"),
    )
