"""SQLAlchemy ORM model for Investigations."""

from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Text, DateTime, Float, Integer, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, utcnow

if TYPE_CHECKING:
    from app.models.incident import Incident


class Investigation(Base):
    """Investigation model storing active investigation state, evidence, and hypothesis."""

    __tablename__ = "investigations"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)  # e.g., INV-2026-001
    incident_id: Mapped[str] = mapped_column(String(50), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False, index=True)
    
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="STARTED", index=True)  # STARTED, INVESTIGATING, HYPOTHESIS_FORMED, COMPLETED, FAILED
    phase: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, default="ANALYZING_EVIDENCE")
    strategy: Mapped[str] = mapped_column(String(50), nullable=False, default="AUTOMATIC")
    agent_type: Mapped[str] = mapped_column(String(50), nullable=False, default="incident-agent")
    
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=utcnow)
    ended_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    reasoning: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    hypothesis: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True, default=0.0)
    evidence_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    evidence_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)  # JSON representation of collected evidence items

    # Relationship
    incident: Mapped["Incident"] = relationship("Incident", back_populates="investigations")

    __table_args__ = (
        Index("idx_investigation_incident_status", "incident_id", "status"),
    )
