"""Incident API Router — CRUD operations for incident management."""

import json
import logging
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.incident_crud import IncidentCRUDService
from app.services.investigation_db import InvestigationDBService
from app.services.approval_db import ApprovalDBService
from app.models.base import utcnow
from app.schemas.incident import (
    IncidentCreate,
    IncidentResponse,
    IncidentListResponse,
    IncidentListItem,
    IncidentStatusUpdate,
    RootCauseInfo,
    ProposedActionInfo,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/incidents", tags=["Incidents"])


def _generate_incident_id() -> str:
    """Generate a unique incident ID."""
    import uuid
    counter = str(uuid.uuid4().int)[:3].zfill(3)
    return f"INC-2026-{counter}"


def _build_incident_response(incident, investigation=None, approval=None) -> IncidentResponse:
    """Build a full IncidentResponse from ORM model, optionally enriching with investigation/approval."""
    root_cause = None
    proposed_action = None

    if investigation:
        root_cause = RootCauseInfo(
            hypothesis=investigation.hypothesis,
            confidence=investigation.confidence,
            evidence_count=investigation.evidence_count,
        )

    if approval:
        proposed_action = ProposedActionInfo(
            type=approval.action.split(" ")[0] if approval.action else None,
            description=approval.action,
            risk_level=approval.risk_level,
            approval_status=approval.status,
        )

    return IncidentResponse(
        id=incident.id,
        title=incident.title,
        service=incident.service,
        severity=incident.severity,
        status=incident.status,
        description=incident.description,
        alert_source=incident.alert_source,
        alert_id=incident.alert_id,
        created_at=incident.created_at,
        updated_at=incident.updated_at,
        created_by=incident.created_by,
        estimated_impact=incident.estimated_impact,
        affected_users=incident.affected_users,
        current_phase=incident.current_phase,
        agent_status=incident.agent_status,
        root_cause=root_cause,
        proposed_action=proposed_action,
    )


@router.post("", response_model=IncidentResponse, status_code=201)
async def create_incident(
    payload: IncidentCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new incident."""
    crud = IncidentCRUDService(db)
    incident_id = _generate_incident_id()

    incident = await crud.create_incident(
        id=incident_id,
        title=payload.title,
        service=payload.service,
        severity=payload.severity,
        description=payload.description,
        alert_source=payload.alert_source,
        alert_id=payload.alert_id,
        created_by=payload.alert_source or "system",
        estimated_impact=payload.estimated_impact,
        affected_users=payload.affected_users,
    )
    logger.info(f"API: Created incident {incident.id}")
    return _build_incident_response(incident)


@router.get("", response_model=IncidentListResponse)
async def list_incidents(
    status: Optional[str] = Query(None, description="Filter by status"),
    service: Optional[str] = Query(None, description="Filter by service name"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    sort_by: str = Query("created_at", description="Sort field"),
    db: AsyncSession = Depends(get_db),
):
    """List all incidents with filtering, sorting, and pagination."""
    crud = IncidentCRUDService(db)
    incidents, total = await crud.list_incidents(
        status=status,
        service=service,
        severity=severity,
        limit=limit,
        offset=offset,
        sort_by=sort_by,
    )

    items = [
        IncidentListItem(
            id=inc.id,
            title=inc.title,
            service=inc.service,
            severity=inc.severity,
            status=inc.status,
            created_at=inc.created_at,
            agent_status=inc.agent_status,
        )
        for inc in incidents
    ]

    return IncidentListResponse(
        total=total,
        limit=limit,
        offset=offset,
        incidents=items,
    )


@router.get("/{incident_id}", response_model=IncidentResponse)
async def get_incident(
    incident_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get detailed incident information by ID."""
    crud = IncidentCRUDService(db)
    incident = await crud.get_incident_by_id(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail={"error": "INCIDENT_NOT_FOUND", "message": f"Incident {incident_id} not found"})

    # Enrich with latest investigation and approval
    inv_svc = InvestigationDBService(db)
    investigation = await inv_svc.get_investigation_by_incident(incident_id)

    apr_svc = ApprovalDBService(db)
    approvals = await apr_svc.get_pending_approvals()
    latest_approval = next((a for a in approvals if a.incident_id == incident_id), None)
    if not latest_approval and incident.approvals:
        latest_approval = incident.approvals[0] if incident.approvals else None

    return _build_incident_response(incident, investigation, latest_approval)


@router.patch("/{incident_id}/status", response_model=IncidentResponse)
async def update_incident_status(
    incident_id: str,
    payload: IncidentStatusUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update incident status."""
    crud = IncidentCRUDService(db)
    incident = await crud.update_incident_status(
        incident_id=incident_id,
        status=payload.status,
        current_phase=payload.current_phase,
        agent_status=payload.agent_status,
    )
    if not incident:
        raise HTTPException(status_code=404, detail={"error": "INCIDENT_NOT_FOUND", "message": f"Incident {incident_id} not found"})

    return _build_incident_response(incident)


@router.delete("/{incident_id}", status_code=204)
async def delete_incident(
    incident_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Delete an incident and all associated data."""
    crud = IncidentCRUDService(db)
    success = await crud.delete_incident(incident_id)
    if not success:
        raise HTTPException(status_code=404, detail={"error": "INCIDENT_NOT_FOUND", "message": f"Incident {incident_id} not found"})
    return None
