"""Incident CRUD Database Service Layer for OpsForge."""

import logging
from datetime import datetime, timezone
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy import select, func, update, delete, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.incident import Incident
from app.models.base import utcnow

logger = logging.getLogger(__name__)


class IncidentCRUDService:
    """Database service layer handling Incident CRUD operations and queries."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_incident(
        self,
        id: str,
        title: str,
        service: str,
        severity: str = "MEDIUM",
        status: str = "CREATED",
        description: Optional[str] = None,
        alert_source: Optional[str] = None,
        alert_id: Optional[str] = None,
        created_by: Optional[str] = "system",
        estimated_impact: Optional[str] = None,
        affected_users: Optional[str] = None,
        current_phase: Optional[str] = "Initial Detection",
        agent_status: Optional[str] = "Idle",
    ) -> Incident:
        """Create a new incident entry in the database."""
        incident = Incident(
            id=id,
            title=title,
            service=service,
            severity=severity.upper(),
            status=status.upper(),
            description=description,
            alert_source=alert_source,
            alert_id=alert_id,
            created_at=utcnow(),
            updated_at=utcnow(),
            created_by=created_by,
            estimated_impact=estimated_impact,
            affected_users=affected_users,
            current_phase=current_phase,
            agent_status=agent_status,
        )
        self.db.add(incident)
        await self.db.flush()
        await self.db.refresh(incident)
        logger.info(f"Created incident in database: {id} - {title}")
        return incident

    async def get_incident_by_id(self, incident_id: str) -> Optional[Incident]:
        """Retrieve an incident by its unique ID."""
        stmt = select(Incident).where(Incident.id == incident_id)
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def list_incidents(
        self,
        status: Optional[str] = None,
        service: Optional[str] = None,
        severity: Optional[str] = None,
        limit: int = 20,
        offset: int = 0,
        sort_by: str = "created_at",
        sort_order: str = "desc",
    ) -> Tuple[List[Incident], int]:
        """List incidents with filtering, sorting, and pagination."""
        stmt = select(Incident)
        count_stmt = select(func.count()).select_from(Incident)

        if status:
            stmt = stmt.where(Incident.status == status.upper())
            count_stmt = count_stmt.where(Incident.status == status.upper())
        if service:
            stmt = stmt.where(Incident.service == service)
            count_stmt = count_stmt.where(Incident.service == service)
        if severity:
            stmt = stmt.where(Incident.severity == severity.upper())
            count_stmt = count_stmt.where(Incident.severity == severity.upper())

        # Sorting
        sort_col = getattr(Incident, sort_by, Incident.created_at)
        if sort_order.lower() == "asc":
            stmt = stmt.order_by(asc(sort_col))
        else:
            stmt = stmt.order_by(desc(sort_col))

        stmt = stmt.offset(offset).limit(limit)

        total_res = await self.db.execute(count_stmt)
        total = total_res.scalar() or 0

        incidents_res = await self.db.execute(stmt)
        incidents = list(incidents_res.scalars().all())

        return incidents, total

    async def update_incident_status(
        self,
        incident_id: str,
        status: str,
        current_phase: Optional[str] = None,
        agent_status: Optional[str] = None,
    ) -> Optional[Incident]:
        """Update incident status and current phase."""
        incident = await self.get_incident_by_id(incident_id)
        if not incident:
            return None

        incident.status = status.upper()
        incident.updated_at = utcnow()
        if current_phase:
            incident.current_phase = current_phase
        if agent_status:
            incident.agent_status = agent_status

        await self.db.flush()
        await self.db.refresh(incident)
        logger.info(f"Updated incident status {incident_id} -> {status}")
        return incident

    async def delete_incident(self, incident_id: str) -> bool:
        """Delete an incident and all associated cascade items."""
        incident = await self.get_incident_by_id(incident_id)
        if not incident:
            return False
        await self.db.delete(incident)
        await self.db.flush()
        return True
