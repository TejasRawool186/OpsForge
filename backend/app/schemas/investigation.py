"""Pydantic schemas for Investigation endpoints."""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class InvestigationStartRequest(BaseModel):
    """Request schema for starting an investigation."""
    strategy: str = Field(default="AUTOMATIC", description="AUTOMATIC or MANUAL")
    focus_areas: Optional[List[str]] = Field(default=None, description="Areas to focus on")
    hypothesis: Optional[str] = Field(default=None, description="Optional manual hypothesis")


class InvestigationProgress(BaseModel):
    """Nested progress information."""
    evidence_collected: int = 0
    evidence_total: int = 0
    hypothesis_confidence: float = 0.0


class InvestigationResponse(BaseModel):
    """Response schema for investigation status."""
    incident_id: str
    investigation_id: str
    status: str
    phase: Optional[str] = None
    strategy: str = "AUTOMATIC"
    agent_type: str = "incident-agent"
    started_at: datetime
    ended_at: Optional[datetime] = None
    progress: Optional[InvestigationProgress] = None
    agent_reasoning: Optional[str] = None
    hypothesis: Optional[str] = None
    confidence: Optional[float] = None
    last_update: Optional[datetime] = None
