"""Human Approval Safety Gate & Audit Persistence DB Service."""

import json
import logging
from datetime import datetime, timezone
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.approval import Approval
from app.models.audit import AuditLog
from app.models.incident import Incident
from app.models.base import utcnow

logger = logging.getLogger(__name__)


class ApprovalDBService:
    """Database service handling pending approvals, atomic decision persistence, and audit logging."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_approval_request(
        self,
        approval_id: str,
        incident_id: str,
        action: str,
        risk_level: str = "HIGH",
        confidence: float = 0.0,
        description: Optional[str] = None,
        summary: Optional[str] = None,
        evidence: Optional[List[Dict[str, Any]]] = None,
        reversibility: str = "FULLY_REVERSIBLE",
        estimated_downtime: Optional[str] = "< 2 minutes",
        verification_plan: Optional[str] = None,
        alternatives: Optional[List[Dict[str, Any]]] = None,
        expires_in_seconds: int = 600,
    ) -> Approval:
        """Create a pending approval request."""
        now = utcnow()
        expires_at = datetime.fromtimestamp(now.timestamp() + expires_in_seconds, tz=timezone.utc)

        approval = Approval(
            id=approval_id,
            incident_id=incident_id,
            action=action,
            description=description,
            risk_level=risk_level.upper(),
            confidence=confidence,
            summary=summary,
            evidence_json=json.dumps(evidence or []),
            reversibility=reversibility,
            estimated_downtime=estimated_downtime,
            verification_plan=verification_plan,
            alternatives_json=json.dumps(alternatives or []),
            requested_at=now,
            expires_at=expires_at,
            status="PENDING",
        )
        self.db.add(approval)

        # Automatically update incident status to APPROVAL_REQUIRED
        stmt = (
            update(Incident)
            .where(Incident.id == incident_id)
            .values(
                status="APPROVAL_REQUIRED",
                current_phase="Human Safety Approval Gate",
                agent_status="Paused for Approval",
                updated_at=now,
            )
        )
        await self.db.execute(stmt)

        await self.db.flush()
        await self.db.refresh(approval)
        logger.info(f"Created approval request {approval_id} for incident {incident_id} (Risk: {risk_level})")
        return approval

    async def get_approval_by_id(self, approval_id: str) -> Optional[Approval]:
        """Fetch approval request by ID."""
        stmt = select(Approval).where(Approval.id == approval_id)
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def get_pending_approvals(self) -> List[Approval]:
        """Fetch all currently pending approval requests."""
        stmt = (
            select(Approval)
            .where(Approval.status == "PENDING")
            .order_by(Approval.requested_at.desc())
        )
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def decide_approval(
        self,
        approval_id: str,
        decision: str,  # APPROVED or REJECTED
        actor: str,
        reason: Optional[str] = None,
    ) -> Tuple[Optional[Approval], Optional[AuditLog]]:
        """Atomically process an approval decision and record a non-repudiable audit log entry."""
        approval = await self.get_approval_by_id(approval_id)
        if not approval:
            logger.warning(f"Approval request {approval_id} not found")
            return None, None

        if approval.status != "PENDING":
            logger.warning(f"Approval request {approval_id} is already in status {approval.status}")
            return approval, None

        now = utcnow()
        decision_upper = decision.upper()

        if decision_upper == "APPROVED":
            approval.status = "APPROVED"
            approval.approved_by = actor
            approval.approval_reason = reason
            approval.approved_at = now

            # Update incident status to EXECUTING
            incident_stmt = (
                update(Incident)
                .where(Incident.id == approval.incident_id)
                .values(
                    status="EXECUTING",
                    current_phase="Remediation Execution",
                    agent_status="Executing Action",
                    updated_at=now,
                )
            )
            await self.db.execute(incident_stmt)

        elif decision_upper == "REJECTED":
            approval.status = "REJECTED"
            approval.rejected_by = actor
            approval.rejection_reason = reason
            approval.rejected_at = now

            # Update incident status back to INVESTIGATING or ROOT_CAUSE_FOUND
            incident_stmt = (
                update(Incident)
                .where(Incident.id == approval.incident_id)
                .values(
                    status="ROOT_CAUSE_FOUND",
                    current_phase="Action Rejected — Evaluating Alternatives",
                    agent_status="Idle",
                    updated_at=now,
                )
            )
            await self.db.execute(incident_stmt)
        else:
            raise ValueError(f"Invalid decision '{decision}'. Must be APPROVED or REJECTED.")

        # Create mandatory AuditLog entry
        audit_log = AuditLog(
            incident_id=approval.incident_id,
            approval_id=approval.id,
            action_type="APPROVAL_DECISION",
            actor=actor,
            decision=decision_upper,
            reason=reason,
            timestamp=now,
            metadata_json=json.dumps({
                "action": approval.action,
                "risk_level": approval.risk_level,
                "confidence": approval.confidence,
            }),
        )
        self.db.add(audit_log)

        await self.db.flush()
        await self.db.refresh(approval)
        await self.db.refresh(audit_log)
        logger.info(f"Processed decision for approval {approval_id}: {decision_upper} by {actor}")
        return approval, audit_log
