"""SQLAlchemy ORM model for Incident Timeline Events."""

from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy import Integer, String, Text, DateTime, Float, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, utcnow

if TYPE_CHECKING:
    from app.models.incident import Incident


class IncidentEvent(Base):
    """Incident timeline event recording tool calls, state changes, evidence discovery."""

    __tablename__ = "incident_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    incident_id: Mapped[str] = mapped_column(String(50), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False, index=True)
    
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utcnow, index=True)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)  # INVESTIGATION_STARTED, TOOL_CALL, TOOL_RESULT, HYPOTHESIS_FORMED, SANDBOX_EXECUTION, APPROVAL_REQUESTED, REMEDIATION_EXECUTED, VERIFICATION_COMPLETED
    description: Mapped[str] = mapped_column(Text, nullable=False)
    phase: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    
    tool: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, index=True)
    tool_call_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    result_summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    sandbox_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    approval_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    data_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON payload string

    # Relationship
    incident: Mapped["Incident"] = relationship("Incident", back_populates="events")

    __table_args__ = (
        Index("idx_events_incident_time", "incident_id", "timestamp"),
    )
