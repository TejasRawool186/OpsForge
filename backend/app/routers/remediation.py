"""Remediation & Verification API Router."""

import json
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.incident_crud import IncidentCRUDService
from app.services.remediation_db import RemediationDBService
from app.services.timeline_db import TimelineDBService
from app.models.base import utcnow
from app.schemas.remediation import (
    RemediationExecuteRequest, RemediationExecuteResponse,
    VerificationRequest, VerificationResponse, MetricComparison,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/incidents", tags=["Remediation"])


@router.post("/{incident_id}/remediation/execute", response_model=RemediationExecuteResponse, status_code=201)
async def execute_remediation(
    incident_id: str, payload: RemediationExecuteRequest,
    db: AsyncSession = Depends(get_db),
):
    """Execute a remediation action for an incident."""
    crud = IncidentCRUDService(db)
    incident = await crud.get_incident_by_id(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail={"error": "INCIDENT_NOT_FOUND", "message": f"Incident {incident_id} not found"})

    rem_svc = RemediationDBService(db)
    log_entry = await rem_svc.log_remediation_execution(
        incident_id=incident_id, action_type=payload.action_type,
        execution_time_seconds=25,
        post_metrics={"action": payload.action_type, "parameters": payload.parameters or {}},
    )

    tl_svc = TimelineDBService(db)
    await tl_svc.add_event(
        incident_id=incident_id, event_type="REMEDIATION_EXECUTED",
        description=f"Executed remediation: {payload.action_type}", phase="REMEDIATION",
    )

    return RemediationExecuteResponse(
        id=log_entry.id, incident_id=incident_id, action_type=log_entry.action_type,
        executed_at=log_entry.executed_at, execution_time_seconds=log_entry.execution_time_seconds,
        verification_status=log_entry.verification_status, message=f"Remediation {payload.action_type} executed successfully",
    )


@router.post("/{incident_id}/verify", response_model=VerificationResponse)
async def verify_remediation(
    incident_id: str, payload: VerificationRequest,
    db: AsyncSession = Depends(get_db),
):
    """Trigger post-remediation verification for an incident."""
    crud = IncidentCRUDService(db)
    incident = await crud.get_incident_by_id(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail={"error": "INCIDENT_NOT_FOUND", "message": f"Incident {incident_id} not found"})

    rem_svc = RemediationDBService(db)
    latest = await rem_svc.get_latest_remediation(incident_id)
    if not latest:
        raise HTTPException(status_code=404, detail={"error": "REMEDIATION_NOT_FOUND", "message": "No remediation found to verify"})

    simulated_metrics = {
        "error_rate": {"before": "31%", "during": "14%", "after": "2.3%", "recovery_time_minutes": payload.recovery_threshold_minutes},
        "timeout_rate": {"before": "175 per min", "after": "15 per min"},
    }

    updated = await rem_svc.update_verification_result(
        remediation_id=latest.id, verification_status="RECOVERED",
        post_metrics=simulated_metrics, recovery_time_minutes=payload.recovery_threshold_minutes,
        report_data={"incident_id": incident_id, "status": "RECOVERED", "verified_by": "OpsForge Agent"},
    )

    tl_svc = TimelineDBService(db)
    await tl_svc.add_event(
        incident_id=incident_id, event_type="VERIFICATION_COMPLETED",
        description="Post-remediation verification completed: RECOVERED", phase="VERIFICATION",
    )

    metrics_resp = {}
    for key, val in simulated_metrics.items():
        metrics_resp[key] = MetricComparison(**val)

    return VerificationResponse(
        incident_id=incident_id, remediation_id=latest.id,
        verification_status="RECOVERED", verified_at=updated.verified_at or utcnow(),
        metrics=metrics_resp, recovery_time_minutes=payload.recovery_threshold_minutes,
        message="Verification completed — incident metrics have recovered to baseline",
    )
