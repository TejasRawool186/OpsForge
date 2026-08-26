"""Investigation & Evidence Database Service Layer."""

import json
import logging
from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.investigation import Investigation
from app.models.base import utcnow

logger = logging.getLogger(__name__)


class InvestigationDBService:
    """Database service for managing active investigations, evidence collection, and hypotheses."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_investigation(
        self,
        investigation_id: str,
        incident_id: str,
        strategy: str = "AUTOMATIC",
        agent_type: str = "incident-agent",
    ) -> Investigation:
        """Create a new investigation record."""
        investigation = Investigation(
            id=investigation_id,
            incident_id=incident_id,
            status="STARTED",
            phase="ANALYZING_EVIDENCE",
            strategy=strategy,
            agent_type=agent_type,
            started_at=utcnow(),
            confidence=0.0,
            evidence_count=0,
            evidence_json=json.dumps([]),
        )
        self.db.add(investigation)
        await self.db.flush()
        await self.db.refresh(investigation)
        logger.info(f"Created investigation {investigation_id} for incident {incident_id}")
        return investigation

    async def get_investigation_by_id(self, investigation_id: str) -> Optional[Investigation]:
        """Retrieve an investigation by ID."""
        stmt = select(Investigation).where(Investigation.id == investigation_id)
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def get_investigation_by_incident(self, incident_id: str) -> Optional[Investigation]:
        """Retrieve the latest active or completed investigation for an incident."""
        stmt = select(Investigation).where(Investigation.incident_id == incident_id).order_by(Investigation.started_at.desc())
        res = await self.db.execute(stmt)
        return res.scalars().first()

    async def add_evidence(
        self,
        investigation_id: str,
        evidence_item: Dict[str, Any],
    ) -> Optional[Investigation]:
        """Append an evidence item to the investigation."""
        investigation = await self.get_investigation_by_id(investigation_id)
        if not investigation:
            return None

        current_evidence = json.loads(investigation.evidence_json or "[]")
        current_evidence.append(evidence_item)
        
        investigation.evidence_json = json.dumps(current_evidence)
        investigation.evidence_count = len(current_evidence)

        await self.db.flush()
        await self.db.refresh(investigation)
        return investigation

    async def update_hypothesis(
        self,
        investigation_id: str,
        hypothesis: str,
        confidence: float,
        reasoning: Optional[str] = None,
        status: str = "HYPOTHESIS_FORMED",
        phase: Optional[str] = None,
    ) -> Optional[Investigation]:
        """Update investigation hypothesis and confidence score."""
        investigation = await self.get_investigation_by_id(investigation_id)
        if not investigation:
            return None

        investigation.hypothesis = hypothesis
        investigation.confidence = confidence
        if reasoning:
            investigation.reasoning = reasoning
        investigation.status = status
        if phase:
            investigation.phase = phase

        await self.db.flush()
        await self.db.refresh(investigation)
        logger.info(f"Updated hypothesis for investigation {investigation_id}: confidence {confidence}")
        return investigation

    async def complete_investigation(
        self,
        investigation_id: str,
        status: str = "COMPLETED",
    ) -> Optional[Investigation]:
        """Mark investigation as completed."""
        investigation = await self.get_investigation_by_id(investigation_id)
        if not investigation:
            return None

        investigation.status = status
        investigation.ended_at = utcnow()
        await self.db.flush()
        await self.db.refresh(investigation)
        return investigation
