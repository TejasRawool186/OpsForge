"""Mock Mode Fallback Router — Demo/offline backup endpoints."""

import json
import logging
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/mock", tags=["Mock Mode"])

# Static mock data for offline/demo presentation reliability
MOCK_INCIDENTS = [
    {
        "id": "INC-2026-001", "title": "Checkout service error spike", "service": "checkout-service",
        "severity": "HIGH", "status": "RESOLVED", "description": "Error rate increased from 2% to 31% starting at 10:30 UTC",
        "alert_source": "grafana", "created_at": "2026-08-16T10:31:00Z", "created_by": "grafana-alerting",
        "agent_status": "Completed", "current_phase": "Incident Resolved & Verified",
        "estimated_impact": "Customers cannot checkout", "affected_users": "~15,000",
        "root_cause": {"hypothesis": "Deployment 102 introduced payment timeout issue", "confidence": 0.91, "evidence_count": 4},
        "proposed_action": {"type": "ROLLBACK", "description": "Rollback checkout-service from 4.2.1 to 4.2.0", "risk_level": "HIGH", "approval_status": "APPROVED"},
    },
    {
        "id": "INC-2026-002", "title": "Database connection pool exhaustion", "service": "user-service",
        "severity": "CRITICAL", "status": "INVESTIGATING", "description": "Connection pool at 100% capacity",
        "alert_source": "grafana", "created_at": "2026-08-17T14:22:00Z", "created_by": "grafana-alerting",
        "agent_status": "Investigating", "current_phase": "Investigation In Progress",
    },
    {
        "id": "INC-2026-003", "title": "Memory leak in notification service", "service": "notification-service",
        "severity": "MEDIUM", "status": "APPROVAL_REQUIRED", "description": "Gradual memory increase over 48h",
        "alert_source": "prometheus", "created_at": "2026-08-18T09:00:00Z", "created_by": "prometheus-alerting",
        "agent_status": "Paused for Approval", "current_phase": "Human Safety Approval Gate",
    },
]

MOCK_APPROVALS = [
    {
        "id": "apr-001", "incident_id": "INC-2026-001", "action": "Rollback checkout-service from 4.2.1 to 4.2.0",
        "risk_level": "HIGH", "confidence": 0.91, "requested_at": "2026-08-16T10:31:40Z",
        "expires_at": "2026-08-16T10:33:40Z", "status": "APPROVED",
        "summary": "Strong evidence indicates deployment-102 caused payment timeout spike",
        "evidence_count": 4,
    },
]

MOCK_TOOLS = [
    {"name": "github", "display_name": "GitHub", "status": "ACTIVE", "capabilities": ["get_repository_info", "get_recent_commits", "get_pull_request", "search_commits", "get_deployment_history"], "last_check": "2026-08-16T10:30:00Z"},
    {"name": "grafana", "display_name": "Grafana", "status": "ACTIVE", "capabilities": ["query_metrics", "get_dashboard", "query_logs", "get_alert_history", "compare_metrics"], "last_check": "2026-08-16T10:30:05Z"},
    {"name": "postgres", "display_name": "PostgreSQL", "status": "ACTIVE", "capabilities": ["execute_query", "get_table_schema", "get_slow_queries", "analyze_data"], "last_check": "2026-08-16T10:30:10Z"},
]


@router.get("/incidents")
async def mock_list_incidents():
    """Mock: list incidents."""
    return {"total": len(MOCK_INCIDENTS), "limit": 20, "offset": 0, "incidents": MOCK_INCIDENTS}


@router.get("/incidents/{incident_id}")
async def mock_get_incident(incident_id: str):
    """Mock: get incident by ID."""
    for inc in MOCK_INCIDENTS:
        if inc["id"] == incident_id:
            return inc
    return JSONResponse(status_code=404, content={"error": "INCIDENT_NOT_FOUND", "message": f"Mock incident {incident_id} not found"})


@router.get("/approvals/pending")
async def mock_pending_approvals():
    """Mock: list pending approvals."""
    pending = [a for a in MOCK_APPROVALS if a["status"] == "PENDING"]
    return {"total": len(pending), "approvals": pending}


@router.get("/tools")
async def mock_list_tools():
    """Mock: list tools."""
    return {"tools": MOCK_TOOLS}


@router.get("/tools/{name}/status")
async def mock_tool_status(name: str):
    """Mock: tool status."""
    for t in MOCK_TOOLS:
        if t["name"] == name:
            return {**t, "latency_ms": 100, "error_rate": 0.0, "available_quota": 5000}
    return JSONResponse(status_code=404, content={"error": "TOOL_NOT_FOUND"})
