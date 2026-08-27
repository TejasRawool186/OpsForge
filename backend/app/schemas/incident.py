"""Pydantic schemas for Incident endpoints."""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class IncidentCreate(BaseModel):
    """Request schema for creating a new incident."""
    title: str = Field(..., min_length=1, max_length=255, description="Incident title")
    service: str = Field(..., min_length=1, max_length=100, description="Affected service name")
    severity: str = Field(default="MEDIUM", description="Severity: LOW, MEDIUM, HIGH, CRITICAL")
    description: Optional[str] = Field(None, description="Detailed incident description")
    alert_source: Optional[str] = Field(None, max_length=50, description="Alert source (e.g., grafana)")
    alert_id: Optional[str] = Field(None, max_length=100, description="External alert identifier")
    estimated_impact: Optional[str] = Field(None, description="Estimated impact description")
    affected_users: Optional[str] = Field(None, max_length=100, description="Estimated affected users")


class RootCauseInfo(BaseModel):
    """Nested root cause information."""
    hypothesis: Optional[str] = None
    confidence: Optional[float] = None
    evidence_count: Optional[int] = None


class ProposedActionInfo(BaseModel):
    """Nested proposed action information."""
    type: Optional[str] = None
    description: Optional[str] = None
    risk_level: Optional[str] = None
    approval_status: Optional[str] = None


class IncidentResponse(BaseModel):
    """Response schema for a single incident."""
    id: str
    title: str
    service: str
    severity: str
    status: str
    description: Optional[str] = None
    alert_source: Optional[str] = None
    alert_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by: Optional[str] = None
    estimated_impact: Optional[str] = None
    affected_users: Optional[str] = None
    current_phase: Optional[str] = None
    agent_status: Optional[str] = None
    root_cause: Optional[RootCauseInfo] = None
    proposed_action: Optional[ProposedActionInfo] = None


class IncidentListItem(BaseModel):
    """Summary schema for incident list view."""
    id: str
    title: str
    service: str
    severity: str
    status: str
    created_at: datetime
    agent_status: Optional[str] = None


class IncidentListResponse(BaseModel):
    """Paginated response for incident listing."""
    total: int
    limit: int
    offset: int
    incidents: List[IncidentListItem]


class IncidentStatusUpdate(BaseModel):
    """Request schema for updating incident status."""
    status: str = Field(..., description="New incident status")
    current_phase: Optional[str] = None
    agent_status: Optional[str] = None
