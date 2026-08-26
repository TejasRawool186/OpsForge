"""Timeline & Event Tracking Database Service Layer."""

import json
import logging
from datetime import datetime
from typing import List, Optional, Tuple, Any, Dict
from sqlalchemy import select, func, asc, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.event import IncidentEvent
from app.models.base import utcnow

logger = logging.getLogger(__name__)


class TimelineDBService:
    """Database service handling incident events and timeline query pagination."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def add_event(
        self,
        incident_id: str,
        event_type: str,
        description: str,
        phase: Optional[str] = None,
        tool: Optional[str] = None,
        tool_call_id: Optional[str] = None,
        result_summary: Optional[str] = None,
        confidence: Optional[float] = None,
        sandbox_id: Optional[str] = None,
        approval_id: Optional[str] = None,
        data: Optional[Dict[str, Any]] = None,
    ) -> IncidentEvent:
        """Add a new timeline event for an incident."""
        data_str = json.dumps(data) if data is not None else None
        event = IncidentEvent(
            incident_id=incident_id,
            timestamp=utcnow(),
            event_type=event_type,
            description=description,
            phase=phase,
            tool=tool,
            tool_call_id=tool_call_id,
            result_summary=result_summary,
            confidence=confidence,
            sandbox_id=sandbox_id,
            approval_id=approval_id,
            data_json=data_str,
        )
        self.db.add(event)
        await self.db.flush()
        await self.db.refresh(event)
        logger.info(f"Added timeline event {event_type} for incident {incident_id}")
        return event

    async def get_timeline(
        self,
        incident_id: str,
        event_type: Optional[str] = None,
        tool: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
        sort_order: str = "asc",
    ) -> Tuple[List[IncidentEvent], int]:
        """Fetch timeline events for an incident with optional filtering and pagination."""
        stmt = select(IncidentEvent).where(IncidentEvent.incident_id == incident_id)
        count_stmt = select(func.count()).select_from(IncidentEvent).where(IncidentEvent.incident_id == incident_id)

        if event_type:
            stmt = stmt.where(IncidentEvent.event_type == event_type)
            count_stmt = count_stmt.where(IncidentEvent.event_type == event_type)
        if tool:
            stmt = stmt.where(IncidentEvent.tool == tool)
            count_stmt = count_stmt.where(IncidentEvent.tool == tool)

        if sort_order.lower() == "desc":
            stmt = stmt.order_by(desc(IncidentEvent.timestamp))
        else:
            stmt = stmt.order_by(asc(IncidentEvent.timestamp))

        stmt = stmt.offset(offset).limit(limit)

        total_res = await self.db.execute(count_stmt)
        total = total_res.scalar() or 0

        events_res = await self.db.execute(stmt)
        events = list(events_res.scalars().all())

        return events, total
