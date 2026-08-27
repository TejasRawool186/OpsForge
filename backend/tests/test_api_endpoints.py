"""Pytest suite for Atharv's FastAPI API Endpoints."""

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db.session import get_db


@pytest_asyncio.fixture(scope="function")
async def client(db_session):
    """Provide AsyncClient connected to FastAPI app with overridden DB dependency."""
    async def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_health_check(client):
    """Test health check endpoint."""
    res = await client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["project"] == "OpsForge"


@pytest.mark.asyncio
async def test_incident_lifecycle_apis(client):
    """Test incident CRUD endpoints."""
    # 1. Create incident
    payload = {
        "title": "Payment gateway timeout spike",
        "service": "checkout-service",
        "severity": "HIGH",
        "description": "Error rate increased to 25%",
        "alert_source": "grafana",
    }
    res = await client.post("/api/incidents", json=payload)
    assert res.status_code == 201
    inc_data = res.json()
    inc_id = inc_data["id"]
    assert inc_data["title"] == payload["title"]
    assert inc_data["status"] == "CREATED"

    # 2. List incidents
    res = await client.get("/api/incidents")
    assert res.status_code == 200
    list_data = res.json()
    assert list_data["total"] >= 1
    assert any(i["id"] == inc_id for i in list_data["incidents"])

    # 3. Get incident detail
    res = await client.get(f"/api/incidents/{inc_id}")
    assert res.status_code == 200
    detail = res.json()
    assert detail["id"] == inc_id

    # 4. Update status
    res = await client.patch(f"/api/incidents/{inc_id}/status", json={"status": "INVESTIGATING", "current_phase": "Phase 1"})
    assert res.status_code == 200
    assert res.json()["status"] == "INVESTIGATING"


@pytest.mark.asyncio
async def test_investigation_and_timeline_apis(client):
    """Test investigation start/status and timeline endpoints."""
    # Create incident first
    res = await client.post("/api/incidents", json={"title": "DB Latency Spike", "service": "user-db", "severity": "CRITICAL"})
    inc_id = res.json()["id"]

    # Start investigation
    res = await client.post(f"/api/incidents/{inc_id}/investigate", json={"strategy": "AUTOMATIC", "hypothesis": "Connection pool full"})
    assert res.status_code == 201
    inv_data = res.json()
    assert inv_data["status"] in ("STARTED", "HYPOTHESIS_FORMED")

    # Get investigation status
    res = await client.get(f"/api/incidents/{inc_id}/investigation")
    assert res.status_code == 200
    assert res.json()["incident_id"] == inc_id

    # Get timeline
    res = await client.get(f"/api/incidents/{inc_id}/timeline")
    assert res.status_code == 200
    timeline = res.json()
    assert timeline["total"] >= 1


@pytest.mark.asyncio
async def test_approval_and_risk_apis(client):
    """Test risk assessment and approval processing APIs."""
    # Create incident
    res = await client.post("/api/incidents", json={"title": "High Memory Usage", "service": "cart", "severity": "HIGH"})
    inc_id = res.json()["id"]

    # Risk assessment
    res = await client.post(f"/api/incidents/{inc_id}/risk-assessment", json={"action_type": "ROLLBACK"})
    assert res.status_code == 200
    risk = res.json()
    assert risk["risk_level"] in ("HIGH", "DESTRUCTIVE")
    assert risk["requires_approval"] is True

    # Check pending approvals (empty initially or seeded)
    res = await client.get("/api/approvals/pending")
    assert res.status_code == 200


@pytest.mark.asyncio
async def test_remediation_verification_report_apis(client):
    """Test remediation execution, verification, and report endpoints."""
    # Create incident
    res = await client.post("/api/incidents", json={"title": "API Error Surge", "service": "api-gateway", "severity": "CRITICAL"})
    inc_id = res.json()["id"]

    # Execute remediation
    res = await client.post(f"/api/incidents/{inc_id}/remediation/execute", json={"action_type": "SCALE_UP", "parameters": {"replicas": 5}})
    assert res.status_code == 201
    rem = res.json()
    assert rem["action_type"] == "SCALE_UP"

    # Verify remediation
    res = await client.post(f"/api/incidents/{inc_id}/verify", json={"check_metrics": True, "recovery_threshold_minutes": 10})
    assert res.status_code == 200
    ver = res.json()
    assert ver["verification_status"] == "RECOVERED"

    # Get Report
    res = await client.get(f"/api/incidents/{inc_id}/report")
    assert res.status_code == 200
    report = res.json()
    assert report["incident_id"] == inc_id

    # Export Report JSON
    res = await client.post(f"/api/incidents/{inc_id}/report/export", json={"format": "JSON"})
    assert res.status_code == 200

    # Export Report Markdown
    res = await client.post(f"/api/incidents/{inc_id}/report/export", json={"format": "MARKDOWN"})
    assert res.status_code == 200
    assert "format" in res.json()


@pytest.mark.asyncio
async def test_tools_and_mock_apis(client):
    """Test MCP tool registry and mock fallback APIs."""
    # Get tools
    res = await client.get("/api/tools")
    assert res.status_code == 200

    # Get mock incidents
    res = await client.get("/api/mock/incidents")
    assert res.status_code == 200
    assert res.json()["total"] >= 1
