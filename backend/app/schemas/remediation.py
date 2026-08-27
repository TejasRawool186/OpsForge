"""Pydantic schemas for Remediation and Verification endpoints."""

from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class RemediationExecuteRequest(BaseModel):
    """Request schema for executing a remediation action."""
    action_type: str = Field(..., description="Type: ROLLBACK, SCALE_UP, DB_INDEX_ADD, SERVICE_RESTART")
    description: Optional[str] = Field(None, description="Human-readable action description")
    parameters: Optional[Dict[str, Any]] = Field(None, description="Action-specific parameters")


class RemediationExecuteResponse(BaseModel):
    """Response after remediation execution."""
    id: int
    incident_id: str
    action_type: str
    executed_at: datetime
    execution_time_seconds: int
    verification_status: str
    message: str = "Remediation action executed successfully"


class VerificationRequest(BaseModel):
    """Request schema for triggering post-remediation verification."""
    check_metrics: bool = Field(default=True, description="Whether to verify metrics")
    recovery_threshold_minutes: int = Field(default=12, description="Expected recovery time")


class MetricComparison(BaseModel):
    """Pre/during/post metric comparison."""
    before: str
    during: Optional[str] = None
    after: str
    recovery_time_minutes: Optional[int] = None


class VerificationResponse(BaseModel):
    """Response after verification completes."""
    incident_id: str
    remediation_id: int
    verification_status: str
    verified_at: datetime
    metrics: Dict[str, MetricComparison] = {}
    recovery_time_minutes: int
    message: str = "Verification completed"
