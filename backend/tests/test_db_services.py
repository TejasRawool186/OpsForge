"""Integration unit tests for core CRUD and DB Services."""

import pytest
from app.services.incident_crud import IncidentCRUDService
from app.services.timeline_db import TimelineDBService
from app.services.investigation_db import InvestigationDBService
from app.services.approval_db import ApprovalDBService
from app.services.tool_registry_db import ToolRegistryDBService
from app.services.remediation_db import RemediationDBService


@pytest.mark.asyncio
async def test_incident_crud_operations(db_session):
    """Test creating, listing, updating, and deleting incidents via IncidentCRUDService."""
    service = IncidentCRUDService(db_session)

    # 1. Create
    inc = await service.create_incident(
        id="INC-SVC-001",
        title="Frontend CDN Outage",
        service="frontend-cdn",
        severity="CRITICAL",
    )
    assert inc.id == "INC-SVC-001"

    # 2. Get
    fetched = await service.get_incident_by_id("INC-SVC-001")
    assert fetched is not None
    assert fetched.title == "Frontend CDN Outage"

    # 3. List
    incidents, total = await service.list_incidents(service="frontend-cdn")
    assert total == 1
    assert len(incidents) == 1

    # 4. Update
    updated = await service.update_incident_status("INC-SVC-001", "RESOLVED", current_phase="Done")
    assert updated.status == "RESOLVED"
    assert updated.current_phase == "Done"

    # 5. Delete
    deleted = await service.delete_incident("INC-SVC-001")
    assert deleted is True
    assert await service.get_incident_by_id("INC-SVC-001") is None


@pytest.mark.asyncio
async def test_approval_and_audit_flow(db_session):
    """Test approval request creation, decision processing, and mandatory audit log generation."""
    inc_service = IncidentCRUDService(db_session)
    app_service = ApprovalDBService(db_session)

    await inc_service.create_incident(
        id="INC-APP-001",
        title="High Memory Usage",
        service="cache-redis",
        severity="HIGH",
    )

    # Create approval
    app_req = await app_service.create_approval_request(
        approval_id="apr-test-01",
        incident_id="INC-APP-001",
        action="Flush redis cache cluster",
        risk_level="HIGH",
        confidence=0.95,
    )
    assert app_req.status == "PENDING"

    # Check incident status updated to APPROVAL_REQUIRED
    inc = await inc_service.get_incident_by_id("INC-APP-001")
    assert inc.status == "APPROVAL_REQUIRED"

    # Process decision
    approval_res, audit_entry = await app_service.decide_approval(
        approval_id="apr-test-01",
        decision="APPROVED",
        actor="devops-lead",
        reason="Verified cache flush is safe",
    )

    assert approval_res.status == "APPROVED"
    assert approval_res.approved_by == "devops-lead"
    assert audit_entry is not None
    assert audit_entry.actor == "devops-lead"
    assert audit_entry.decision == "APPROVED"
    assert audit_entry.action_type == "APPROVAL_DECISION"

    # Verify incident updated to EXECUTING
    inc = await inc_service.get_incident_by_id("INC-APP-001")
    assert inc.status == "EXECUTING"


@pytest.mark.asyncio
async def test_tool_registry_upsert(db_session):
    """Test Tool Registry service upsert and retrieval."""
    tool_service = ToolRegistryDBService(db_session)

    tool = await tool_service.upsert_tool(
        name="github",
        display_name="GitHub MCP Server",
        status="ACTIVE",
        latency_ms=100,
    )
    assert tool.name == "github"
    assert tool.latency_ms == 100

    # Upsert to update latency
    updated = await tool_service.upsert_tool(
        name="github",
        display_name="GitHub MCP Server",
        status="ACTIVE",
        latency_ms=150,
    )
    assert updated.latency_ms == 150
