"""Remediation & Post-Fix Verification Database Service Layer."""

import json
import logging
from datetime import datetime
from typing import Optional, Dict, Any, Tuple
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.remediation import RemediationLog
from app.models.incident import Incident
from app.models.base import utcnow

logger = logging.getLogger(__name__)


class RemediationDBService:
    """Database service tracking remediation execution and post-action verification metrics."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def log_remediation_execution(
        self,
        incident_id: str,
        action_type: str,
        execution_time_seconds: int = 15,
        post_metrics: Optional[Dict[str, Any]] = None,
    ) -> RemediationLog:
        """Create a remediation log entry."""
        now = utcnow()
        log_entry = RemediationLog(
            incident_id=incident_id,
            action_type=action_type.upper(),
            executed_at=now,
            execution_time_seconds=execution_time_seconds,
            post_metrics_json=json.dumps(post_metrics or {}),
            verification_status="PENDING",
        )
        self.db.add(log_entry)

        # Update incident status to VERIFYING
        incident_stmt = (
            update(Incident)
            .where(Incident.id == incident_id)
            .values(
                status="VERIFYING",
                current_phase="Post-Action Verification",
                agent_status="Verifying Metrics",
                updated_at=now,
            )
        )
        await self.db.execute(incident_stmt)

        await self.db.flush()
        await self.db.refresh(log_entry)
        logger.info(f"Logged remediation execution {action_type} for incident {incident_id}")
        return log_entry

    async def update_verification_result(
        self,
        remediation_id: int,
        verification_status: str,  # RECOVERED or FAILED
        post_metrics: Dict[str, Any],
        recovery_time_minutes: int = 12,
        report_data: Optional[Dict[str, Any]] = None,
    ) -> Optional[RemediationLog]:
        """Record verification outcome and update incident status."""
        stmt = select(RemediationLog).where(RemediationLog.id == remediation_id)
        res = await self.db.execute(stmt)
        log_entry = res.scalar_one_or_none()

        if not log_entry:
            return None

        now = utcnow()
        status_upper = verification_status.upper()
        log_entry.verification_status = status_upper
        log_entry.verified_at = now
        log_entry.recovery_time_minutes = recovery_time_minutes
        log_entry.post_metrics_json = json.dumps(post_metrics)
        if report_data:
            log_entry.report_json = json.dumps(report_data)

        # Update parent incident status
        final_incident_status = "RESOLVED" if status_upper == "RECOVERED" else "INVESTIGATING"
        final_phase = "Incident Resolved & Verified" if status_upper == "RECOVERED" else "Verification Failed — Re-evaluating"
        final_agent_status = "Completed" if status_upper == "RECOVERED" else "Idle"

        incident_stmt = (
            update(Incident)
            .where(Incident.id == log_entry.incident_id)
            .values(
                status=final_incident_status,
                current_phase=final_phase,
                agent_status=final_agent_status,
                updated_at=now,
            )
        )
        await self.db.execute(incident_stmt)

        await self.db.flush()
        await self.db.refresh(log_entry)
        logger.info(f"Updated verification result for remediation {remediation_id}: {status_upper}")
        return log_entry

    async def get_latest_remediation(self, incident_id: str) -> Optional[RemediationLog]:
        """Fetch the latest remediation log for an incident."""
        stmt = (
            select(RemediationLog)
            .where(RemediationLog.incident_id == incident_id)
            .order_by(RemediationLog.executed_at.desc())
        )
        res = await self.db.execute(stmt)
        return res.scalars().first()
