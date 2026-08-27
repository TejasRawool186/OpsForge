"""Pydantic schemas for Approval endpoints."""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class EvidenceItem(BaseModel):
    """Evidence item for approval context."""
    type: str
    description: str
    data: Optional[str] = None
    link: Optional[str] = None
    result: Optional[str] = None


class AlternativeOption(BaseModel):
    """Alternative remediation option."""
    option: str
    feasibility: str
    timeline: str


class ApprovalResponse(BaseModel):
    """Summary response for an approval request."""
    id: str
    incident_id: str
    action: str
    risk_level: str
    confidence: float
    requested_at: datetime
    expires_at: Optional[datetime] = None
    summary: Optional[str] = None
    evidence_count: int = 0
    status: str


class ApprovalDetailResponse(BaseModel):
    """Detailed response for a single approval request with full evidence."""
    id: str
    incident_id: str
    action: str
    description: Optional[str] = None
    risk_level: str
    confidence: float
    summary: Optional[str] = None
    evidence: List[EvidenceItem] = []
    reversibility: Optional[str] = None
    estimated_downtime: Optional[str] = None
    verification_plan: Optional[str] = None
    alternatives: List[AlternativeOption] = []
    requested_at: datetime
    expires_at: Optional[datetime] = None
    status: str
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    rejected_by: Optional[str] = None
    rejected_at: Optional[datetime] = None


class ApprovalListResponse(BaseModel):
    """Response for listing pending approvals."""
    total: int
    approvals: List[ApprovalResponse]


class ApprovalDecisionRequest(BaseModel):
    """Request schema for approving or rejecting an action."""
    decision: str = Field(..., description="APPROVED or REJECTED")
    decided_by: str = Field(..., description="Email or identifier of the person making the decision")
    reason: Optional[str] = Field(None, description="Reason for the decision")
    override_risk: bool = Field(default=False, description="Whether to override risk assessment")
    suggested_alternative: Optional[str] = Field(None, description="Suggested alternative action (for rejections)")


class ApprovalDecisionResponse(BaseModel):
    """Response after processing an approval decision."""
    id: str
    incident_id: str
    status: str
    decided_by: Optional[str] = None
    decided_at: Optional[datetime] = None
