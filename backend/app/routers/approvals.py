"""Approval API Router — Human Safety Gate endpoints."""

import json
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.approval_db import ApprovalDBService
from app.schemas.approval import (
    ApprovalResponse,
    ApprovalDetailResponse,
    ApprovalListResponse,
    ApprovalDecisionRequest,
    ApprovalDecisionResponse,
    EvidenceItem,
    AlternativeOption,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/approvals", tags=["Approvals"])


def _build_approval_summary(approval) -> ApprovalResponse:
    """Build approval summary from ORM model."""
    evidence_count = 0
    if approval.evidence_json:
        try:
            evidence_count = len(json.loads(approval.evidence_json))
        except (json.JSONDecodeError, TypeError):
            pass

    return ApprovalResponse(
        id=approval.id,
        incident_id=approval.incident_id,
        action=approval.action,
        risk_level=approval.risk_level,
        confidence=approval.confidence,
        requested_at=approval.requested_at,
        expires_at=approval.expires_at,
        summary=approval.summary,
        evidence_count=evidence_count,
        status=approval.status,
    )


def _build_approval_detail(approval) -> ApprovalDetailResponse:
    """Build detailed approval response from ORM model."""
    evidence = []
    if approval.evidence_json:
        try:
            raw_evidence = json.loads(approval.evidence_json)
            evidence = [EvidenceItem(**item) for item in raw_evidence]
        except (json.JSONDecodeError, TypeError):
            pass

    alternatives = []
    if approval.alternatives_json:
        try:
            raw_alts = json.loads(approval.alternatives_json)
            alternatives = [AlternativeOption(**alt) for alt in raw_alts]
        except (json.JSONDecodeError, TypeError):
            pass

    return ApprovalDetailResponse(
        id=approval.id,
        incident_id=approval.incident_id,
        action=approval.action,
        description=approval.description,
        risk_level=approval.risk_level,
        confidence=approval.confidence,
        summary=approval.summary,
        evidence=evidence,
        reversibility=approval.reversibility,
        estimated_downtime=approval.estimated_downtime,
        verification_plan=approval.verification_plan,
        alternatives=alternatives,
        requested_at=approval.requested_at,
        expires_at=approval.expires_at,
        status=approval.status,
        approved_by=approval.approved_by,
        approved_at=approval.approved_at,
        rejected_by=approval.rejected_by,
        rejected_at=approval.rejected_at,
    )


@router.get("/pending", response_model=ApprovalListResponse)
async def get_pending_approvals(
    db: AsyncSession = Depends(get_db),
):
    """List all currently pending approval requests."""
    svc = ApprovalDBService(db)
    pending = await svc.get_pending_approvals()

    summaries = [_build_approval_summary(a) for a in pending]
    return ApprovalListResponse(total=len(summaries), approvals=summaries)


@router.get("/{approval_id}", response_model=ApprovalDetailResponse)
async def get_approval_detail(
    approval_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get detailed information for a specific approval request."""
    svc = ApprovalDBService(db)
    approval = await svc.get_approval_by_id(approval_id)
    if not approval:
        raise HTTPException(
            status_code=404,
            detail={"error": "APPROVAL_NOT_FOUND", "message": f"Approval request {approval_id} not found"},
        )
    return _build_approval_detail(approval)


@router.post("/{approval_id}/decide", response_model=ApprovalDecisionResponse)
async def decide_approval(
    approval_id: str,
    payload: ApprovalDecisionRequest,
    db: AsyncSession = Depends(get_db),
):
    """Process approval or rejection decision for a pending action."""
    if payload.decision.upper() not in ("APPROVED", "REJECTED"):
        raise HTTPException(
            status_code=400,
            detail={
                "error": "INVALID_REQUEST",
                "message": "Decision must be APPROVED or REJECTED",
            },
        )

    svc = ApprovalDBService(db)
    approval, audit_log = await svc.decide_approval(
        approval_id=approval_id,
        decision=payload.decision,
        actor=payload.decided_by,
        reason=payload.reason,
    )

    if approval is None:
        raise HTTPException(
            status_code=404,
            detail={"error": "APPROVAL_NOT_FOUND", "message": f"Approval request {approval_id} not found"},
        )

    if audit_log is None:
        raise HTTPException(
            status_code=409,
            detail={"error": "CONFLICT", "message": f"Approval {approval_id} has already been {approval.status.lower()}"},
        )

    decided_at = approval.approved_at if approval.status == "APPROVED" else approval.rejected_at
    decided_by = approval.approved_by if approval.status == "APPROVED" else approval.rejected_by

    logger.info(f"API: Processed approval decision {approval_id} -> {approval.status}")
    return ApprovalDecisionResponse(
        id=approval.id,
        incident_id=approval.incident_id,
        status=approval.status,
        decided_by=decided_by,
        decided_at=decided_at,
    )
