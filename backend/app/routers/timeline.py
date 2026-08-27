"""Timeline API Router — Incident event timeline endpoints."""

import json
import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.timeline_db import TimelineDBService
from app.services.incident_crud import IncidentCRUDService
from app.schemas.timeline import TimelineEventResponse, TimelineListResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/incidents", tags=["Timeline"])


@router.get("/{incident_id}/timeline", response_model=TimelineListResponse)
async def get_incident_timeline(
    incident_id: str,
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    tool: Optional[str] = Query(None, description="Filter by tool name"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    sort_order: str = Query("asc", description="Sort order: asc or desc"),
    db: AsyncSession = Depends(get_db),
):
    """Get the execution timeline for an incident with optional filtering."""
    # Verify incident exists
    crud = IncidentCRUDService(db)
    incident = await crud.get_incident_by_id(incident_id)
    if not incident:
        raise HTTPException(
            status_code=404,
            detail={"error": "INCIDENT_NOT_FOUND", "message": f"Incident {incident_id} not found"},
        )

    svc = TimelineDBService(db)
    events, total = await svc.get_timeline(
        incident_id=incident_id,
        event_type=event_type,
        tool=tool,
        limit=limit,
        offset=offset,
        sort_order=sort_order,
    )

    event_responses = []
    for event in events:
        data = None
        if event.data_json:
            try:
                data = json.loads(event.data_json)
            except (json.JSONDecodeError, TypeError):
                pass

        event_responses.append(
            TimelineEventResponse(
                id=event.id,
                timestamp=event.timestamp,
                event_type=event.event_type,
                description=event.description,
                phase=event.phase,
                tool=event.tool,
                tool_call_id=event.tool_call_id,
                result_summary=event.result_summary,
                confidence=event.confidence,
                sandbox_id=event.sandbox_id,
                approval_id=event.approval_id,
                data=data,
            )
        )

    return TimelineListResponse(
        incident_id=incident_id,
        total=total,
        limit=limit,
        offset=offset,
        events=event_responses,
    )
