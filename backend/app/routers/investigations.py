"""Investigation API Router — Start and track investigations."""

import logging
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.incident_crud import IncidentCRUDService
from app.services.investigation_db import InvestigationDBService
from app.services.timeline_db import TimelineDBService
from app.schemas.investigation import (
    InvestigationStartRequest,
    InvestigationResponse,
    InvestigationProgress,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/incidents", tags=["Investigations"])


@router.post("/{incident_id}/investigate", response_model=InvestigationResponse, status_code=201)
async def start_investigation(
    incident_id: str,
    payload: InvestigationStartRequest,
    db: AsyncSession = Depends(get_db),
):
    """Start an investigation for an incident (triggers agent)."""
    # Verify incident exists
    crud = IncidentCRUDService(db)
    incident = await crud.get_incident_by_id(incident_id)
    if not incident:
        raise HTTPException(
            status_code=404,
            detail={"error": "INCIDENT_NOT_FOUND", "message": f"Incident {incident_id} not found"},
        )

    # Generate investigation ID
    counter = str(uuid.uuid4().int)[:3].zfill(3)
    investigation_id = f"INV-2026-{counter}"

    # Create investigation record
    inv_svc = InvestigationDBService(db)
    investigation = await inv_svc.create_investigation(
        investigation_id=investigation_id,
        incident_id=incident_id,
        strategy=payload.strategy,
    )

    # If manual hypothesis provided, set it
    if payload.hypothesis:
        investigation = await inv_svc.update_hypothesis(
            investigation_id=investigation_id,
            hypothesis=payload.hypothesis,
            confidence=0.5,
            reasoning="Manual hypothesis provided by engineer.",
        )

    # Update incident status to INVESTIGATING
    await crud.update_incident_status(
        incident_id=incident_id,
        status="INVESTIGATING",
        current_phase="Investigation In Progress",
        agent_status="Investigating",
    )

    # Add timeline event
    timeline_svc = TimelineDBService(db)
    await timeline_svc.add_event(
        incident_id=incident_id,
        event_type="INVESTIGATION_STARTED",
        description=f"Agent began investigating incident with strategy: {payload.strategy}",
        phase="INITIAL",
    )

    logger.info(f"API: Started investigation {investigation_id} for incident {incident_id}")
    return InvestigationResponse(
        incident_id=incident_id,
        investigation_id=investigation.id,
        status=investigation.status,
        phase=investigation.phase,
        strategy=investigation.strategy,
        agent_type=investigation.agent_type,
        started_at=investigation.started_at,
        last_update=investigation.started_at,
    )


@router.get("/{incident_id}/investigation", response_model=InvestigationResponse)
async def get_investigation_status(
    incident_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get the current investigation status and progress for an incident."""
    # Verify incident exists
    crud = IncidentCRUDService(db)
    incident = await crud.get_incident_by_id(incident_id)
    if not incident:
        raise HTTPException(
            status_code=404,
            detail={"error": "INCIDENT_NOT_FOUND", "message": f"Incident {incident_id} not found"},
        )

    inv_svc = InvestigationDBService(db)
    investigation = await inv_svc.get_investigation_by_incident(incident_id)
    if not investigation:
        raise HTTPException(
            status_code=404,
            detail={"error": "INVESTIGATION_NOT_FOUND", "message": f"No investigation found for incident {incident_id}"},
        )

    progress = InvestigationProgress(
        evidence_collected=investigation.evidence_count,
        evidence_total=investigation.evidence_count,
        hypothesis_confidence=investigation.confidence or 0.0,
    )

    return InvestigationResponse(
        incident_id=incident_id,
        investigation_id=investigation.id,
        status=investigation.status,
        phase=investigation.phase,
        strategy=investigation.strategy,
        agent_type=investigation.agent_type,
        started_at=investigation.started_at,
        ended_at=investigation.ended_at,
        progress=progress,
        agent_reasoning=investigation.reasoning,
        hypothesis=investigation.hypothesis,
        confidence=investigation.confidence,
        last_update=investigation.ended_at or investigation.started_at,
    )
