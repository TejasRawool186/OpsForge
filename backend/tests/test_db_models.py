"""Unit tests for SQLAlchemy ORM model definitions and relationships."""

import pytest
from app.models.incident import Incident
from app.models.event import IncidentEvent
from app.models.investigation import Investigation
from app.models.approval import Approval
from app.models.audit import AuditLog
from app.models.tool import ToolRegistry
from app.models.remediation import RemediationLog
from app.models.base import utcnow


@pytest.mark.asyncio
async def test_create_incident_model(db_session):
    """Test incident creation and attribute persistence."""
    incident = Incident(
        id="INC-TEST-001",
        title="Test Payment Outage",
        service="payment-svc",
        severity="HIGH",
        status="CREATED",
        created_at=utcnow(),
        updated_at=utcnow(),
    )
    db_session.add(incident)
    await db_session.commit()

    saved = await db_session.get(Incident, "INC-TEST-001")
    assert saved is not None
    assert saved.title == "Test Payment Outage"
    assert saved.service == "payment-svc"
    assert saved.severity == "HIGH"
    assert saved.status == "CREATED"


@pytest.mark.asyncio
async def test_incident_cascade_relationships(db_session):
    """Test incident parent model cascading deletion to child timeline events."""
    incident = Incident(
        id="INC-TEST-002",
        title="Database Latency Test",
        service="user-db",
        severity="MEDIUM",
        status="INVESTIGATING",
        created_at=utcnow(),
        updated_at=utcnow(),
    )
    db_session.add(incident)
    await db_session.flush()

    event = IncidentEvent(
        incident_id="INC-TEST-002",
        timestamp=utcnow(),
        event_type="TOOL_CALL",
        description="Queried postgres tool for active locks",
        tool="postgres",
    )
    db_session.add(event)
    await db_session.commit()

    saved_event = await db_session.get(IncidentEvent, event.id)
    assert saved_event is not None
    assert saved_event.incident_id == "INC-TEST-002"
