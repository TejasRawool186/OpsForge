"""Demo Data Reset Script for Presentation Rehearsal & Live Demos."""

import asyncio
import logging
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.session import AsyncSessionLocal, async_engine
from app.models.base import Base
from app.services import (
    IncidentCRUDService,
    TimelineDBService,
    InvestigationDBService,
    ApprovalDBService,
    ToolRegistryDBService,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def reset_and_seed_demo():
    """Drop and recreate all database tables to instantly reset the demo environment."""
    logger.info("Dropping all existing database tables for demo reset...")
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    logger.info("Seeding demo scenario (Checkout Service Error Spike)...")
    async with AsyncSessionLocal() as session:
        incident_service = IncidentCRUDService(session)
        timeline_service = TimelineDBService(session)
        investigation_service = InvestigationDBService(session)
        approval_service = ApprovalDBService(session)
        tool_service = ToolRegistryDBService(session)

        # Tools
        await tool_service.upsert_tool(
            name="github",
            display_name="GitHub MCP Server",
            status="ACTIVE",
            capabilities=["get_repository_info", "get_recent_commits", "get_pull_request", "get_deployment_history"],
            latency_ms=120,
            error_rate=0.0,
            available_quota=4800,
        )
        await tool_service.upsert_tool(
            name="grafana",
            display_name="Grafana Observability MCP",
            status="ACTIVE",
            capabilities=["query_metrics", "get_dashboard", "query_logs", "get_alert_history", "compare_metrics"],
            latency_ms=75,
            error_rate=0.0,
            available_quota=5000,
        )
        await tool_service.upsert_tool(
            name="postgres",
            display_name="PostgreSQL MCP Inspector",
            status="ACTIVE",
            capabilities=["execute_query", "get_table_schema", "get_slow_queries", "analyze_data"],
            latency_ms=35,
            error_rate=0.0,
            available_quota=5000,
        )

        # Primary Incident
        await incident_service.create_incident(
            id="INC-2026-001",
            title="Checkout service error spike",
            service="checkout-service",
            severity="HIGH",
            status="APPROVAL_REQUIRED",
            description="Error rate increased from 2% to 31% starting at 10:30 UTC following deployment #102",
            alert_source="grafana",
            alert_id="alert-12345",
            created_by="grafana-alerting",
            estimated_impact="Customers unable to complete orders",
            affected_users="~15,000",
            current_phase="Human Safety Approval Gate",
            agent_status="Paused for Approval",
        )

        # Timeline
        await timeline_service.add_event(
            incident_id="INC-2026-001",
            event_type="INVESTIGATION_STARTED",
            description="Agent began investigating incident automatically",
            phase="INITIAL",
        )
        await timeline_service.add_event(
            incident_id="INC-2026-001",
            event_type="TOOL_CALL",
            description="Querying Grafana for error rate metrics",
            phase="METRICS",
            tool="grafana",
            tool_call_id="tc-001",
        )
        await timeline_service.add_event(
            incident_id="INC-2026-001",
            event_type="TOOL_RESULT",
            description="Grafana metrics received: Error rate increased from 2% to 31% at 10:30 UTC",
            phase="METRICS",
            tool="grafana",
            result_summary="Sharp error jump at 10:30 UTC",
            confidence=0.90,
        )
        await timeline_service.add_event(
            incident_id="INC-2026-001",
            event_type="TOOL_CALL",
            description="Querying GitHub MCP for deployment history",
            phase="DEPLOYMENTS",
            tool="github",
            tool_call_id="tc-002",
        )
        await timeline_service.add_event(
            incident_id="INC-2026-001",
            event_type="TOOL_RESULT",
            description="Deployment #102 detected at 10:28 UTC (checkout-service v4.2.1)",
            phase="DEPLOYMENTS",
            tool="github",
            result_summary="PR #8421 committed by build-bot",
            confidence=0.91,
        )
        await timeline_service.add_event(
            incident_id="INC-2026-001",
            event_type="HYPOTHESIS_FORMED",
            description="Deployment #102 introduced payment timeout exception",
            phase="HYPOTHESIS",
            confidence=0.91,
        )
        await timeline_service.add_event(
            incident_id="INC-2026-001",
            event_type="APPROVAL_REQUESTED",
            description="Agent paused state machine and requested human approval to rollback deployment #102",
            phase="SAFETY_GATE",
            approval_id="apr-001",
        )

        # Investigation
        await investigation_service.create_investigation(
            investigation_id="INV-2026-001",
            incident_id="INC-2026-001",
            strategy="AUTOMATIC",
            agent_type="incident-agent",
        )
        await investigation_service.add_evidence(
            investigation_id="INV-2026-001",
            evidence_item={"type": "METRIC", "description": "Error rate jump 2% -> 31%", "data": "Grafana timeline"},
        )
        await investigation_service.add_evidence(
            investigation_id="INV-2026-001",
            evidence_item={"type": "LOG", "description": "PaymentTimeoutException increased 1,360%", "data": "12/min -> 175/min"},
        )
        await investigation_service.add_evidence(
            investigation_id="INV-2026-001",
            evidence_item={"type": "CODE", "description": "PR #8421 modified timeout handler", "data": "checkout-service v4.2.1"},
        )
        await investigation_service.update_hypothesis(
            investigation_id="INV-2026-001",
            hypothesis="Deployment 102 introduced payment timeout issue in checkout-service v4.2.1",
            confidence=0.91,
            reasoning="Strong multi-source correlation between deployment release time, payment error rate, and exception stack trace.",
            status="HYPOTHESIS_FORMED",
        )

        # Approval Request
        await approval_service.create_approval_request(
            approval_id="apr-001",
            incident_id="INC-2026-001",
            action="Rollback checkout-service from 4.2.1 to 4.2.0",
            risk_level="HIGH",
            confidence=0.91,
            description="Roll back deployment-102 to eliminate payment timeout failures",
            summary="Strong evidence indicates deployment-102 caused payment timeout spike",
            evidence=[
                {"type": "METRIC", "description": "Error rate increased within 2 min of deployment", "data": "2% → 31%"},
                {"type": "LOG", "description": "PaymentTimeoutException increased 1,360%", "data": "12 per min → 175 per min"},
                {"type": "CODE", "description": "PR #8421 modified payment timeout handling", "link": "https://github.com/checkout/..."},
            ],
            reversibility="FULLY_REVERSIBLE",
            estimated_downtime="< 2 minutes",
            verification_plan="Monitor error rate for 10 minutes post-rollback",
            alternatives=[
                {"option": "Scale service", "feasibility": "POSSIBLE", "timeline": "15 minutes"},
            ],
        )

        await session.commit()
        logger.info("Demo environment successfully reset and ready for presentation!")


if __name__ == "__main__":
    asyncio.run(reset_and_seed_demo())
