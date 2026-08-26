"""SQLAlchemy ORM model for Remediation and Post-Fix Verification Logs."""

from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy import Integer, String, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, utcnow

if TYPE_CHECKING:
    from app.models.incident import Incident


class RemediationLog(Base):
    """Remediation log model tracking execution of corrective actions and post-fix metrics."""

    __tablename__ = "remediation_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    incident_id: Mapped[str] = mapped_column(String(50), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False, index=True)
    
    action_type: Mapped[str] = mapped_column(String(50), nullable=False)  # ROLLBACK, SCALE_UP, DB_INDEX_ADD, SERVICE_RESTART
    executed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utcnow)
    execution_time_seconds: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    
    post_metrics_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON payload of pre/during/post metric metrics
    verification_status: Mapped[str] = mapped_column(String(30), nullable=False, default="PENDING", index=True)  # PENDING, RECOVERED, FAILED
    verified_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    recovery_time_minutes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    report_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationship
    incident: Mapped["Incident"] = relationship("Incident", back_populates="remediations")

    __table_args__ = (
        Index("idx_remediation_incident_status", "incident_id", "verification_status"),
    )
