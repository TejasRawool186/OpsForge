"""Pydantic schemas for Timeline endpoints."""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel


class TimelineEventResponse(BaseModel):
    """Response schema for a single timeline event."""
    id: int
    timestamp: datetime
    event_type: str
    description: str
    phase: Optional[str] = None
    tool: Optional[str] = None
    tool_call_id: Optional[str] = None
    result_summary: Optional[str] = None
    confidence: Optional[float] = None
    sandbox_id: Optional[str] = None
    approval_id: Optional[str] = None
    data: Optional[Dict[str, Any]] = None


class TimelineListResponse(BaseModel):
    """Paginated timeline response for an incident."""
    incident_id: str
    total: int
    limit: int
    offset: int
    events: List[TimelineEventResponse]
