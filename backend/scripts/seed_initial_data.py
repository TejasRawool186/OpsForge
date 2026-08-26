"""Initial Database Seed Script for Development Testing."""

import asyncio
import logging
import os
import sys

# Ensure backend root is in python path
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


async def seed_initial_data():
    """Populate baseline database entries for development and testing."""
    logger.info("Initializing database tables...")
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        incident_service = IncidentCRUDService(session)
        timeline_service = TimelineDBService(session)
        investigation_service = InvestigationDBService(session)
        approval_service = ApprovalDBService(session)
        tool_service = ToolRegistryDBService(session)

        # 1. Seed Tool Registry
        logger.info("Seeding MCP Tool Registry...")
        await tool_service.upsert_tool(
            name="github",
            display_name="GitHub MCP Server",
            status="ACTIVE",
            capabilities=["get_repository_info", "get_recent_commits", "get_pull_request", "get_deployment_history"],
            latency_ms=145,
            error_rate=0.0,
            available_quota=4500,
        )
        await tool_service.upsert_tool(
            name="grafana",
            display_name="Grafana Observability MCP",
            status="ACTIVE",
            capabilities=["query_metrics", "get_dashboard", "query_logs", "get_alert_history", "compare_metrics"],
            latency_ms=85,
            error_rate=0.0,
            available_quota=5000,
        )
        await tool_service.upsert_tool(
            name="postgres",
            display_name="PostgreSQL MCP Inspector",
            status="ACTIVE",
            capabilities=["execute_query", "get_table_schema", "get_slow_queries", "analyze_data"],
            latency_ms=42,
            error_rate=0.0,
            available_quota=5000,
        )

        # 2. Seed Baseline Incidents
        logger.info("Seeding baseline incidents...")
        inc1 = await incident_service.create_incident(
            id="INC-2026-001",
            title="Checkout service error spike",
            service="checkout-service",
            severity="HIGH",
            status="APPROVAL_REQUIRED",
            description="Error rate increased from 2% to 31% starting at 10:30 UTC",
            alert_source="grafana",
            alert_id="alert-12345",
            created_by="grafana-alerting",
            estimated_impact="Customers cannot complete checkout orders",
            affected_users="~15,000",
            current_phase="Human Safety Approval Gate",
            agent_status="Paused for Approval",
        )

        inc2 = await incident_service.create_incident(
            id="INC-2026-002",
            title="High Database Connection Pool Latency",
            service="payment-processor",
            severity="MEDIUM",
            status="RESOLVED",
            description="DB Connection pool exhaustion warning on payment-db",
            alert_source="prometheus",
            alert_id="alert-67890",
            created_by="prometheus-alerts",
            estimated_impact="Mild payment submission delay",
            affected_users="~1,200",
            current_phase="Incident Resolved",
            agent_status="Completed",
        )

        # 3. Seed Timeline Events for INC-2026-001
        logger.info("Seeding timeline events for INC-2026-001...")
        await timeline_service.add_event(
            incident_id="INC-2026-001",
            event_type="INVESTIGATION_STARTED",
            description="Agent began investigating incident automatically",
            phase="INITIAL",
        )
        await timeline_service.add_event(
            incident_id="INC-2026-001",
            event_type="TOOL_CALL",
            description="Querying Grafana for error rate metrics timeline",
            phase="ANALYSIS",
            tool="grafana",
            tool_call_id="tc-001",
        )
        await timeline_service.add_event(
            incident_id="INC-2026-001",
            event_type="TOOL_RESULT",
            description="Grafana metrics confirmed error rate jump from 2% to 31% at 10:30 UTC",
            phase="ANALYSIS",
            tool="grafana",
            result_summary="Error spike correlated with deployment-102",
            confidence=0.89,
        )

        # 4. Seed Investigation
        logger.info("Seeding active investigation for INC-2026-001...")
        inv = await investigation_service.create_investigation(
            investigation_id="INV-2026-001",
            incident_id="INC-2026-001",
            strategy="AUTOMATIC",
            agent_type="incident-agent",
        )
        await investigation_service.add_evidence(
            investigation_id="INV-2026-001",
            evidence_item={
                "type": "METRIC",
                "description": "Error rate increased within 2 min of deployment #102",
                "data": "2% → 31%",
            },
        )
        await investigation_service.update_hypothesis(
            investigation_id="INV-2026-001",
            hypothesis="Deployment 102 introduced payment timeout issue in checkout-service v4.2.1",
            confidence=0.91,
            reasoning="Strong temporal correlation between GitHub release #102 and payment error spike.",
            status="HYPOTHESIS_FORMED",
        )

        # 5. Seed Approval Request
        logger.info("Seeding pending approval request for INC-2026-001...")
        await approval_service.create_approval_request(
            approval_id="apr-001",
            incident_id="INC-2026-001",
            action="Rollback checkout-service from 4.2.1 to 4.2.0",
            risk_level="HIGH",
            confidence=0.91,
            description="Rollback deployment-102 to clear payment timeout exception code path",
            summary="Strong evidence indicates deployment-102 caused payment timeout spike",
            evidence=[
                {"type": "METRIC", "description": "Error rate spike: 2% → 31%", "data": "Grafana alert #12345"},
                {"type": "CODE", "description": "PR #8421 modified timeout handling", "link": "https://github.com/checkout/pull/8421"},
            ],
            reversibility="FULLY_REVERSIBLE",
            estimated_downtime="< 2 minutes",
            verification_plan="Monitor error rate for 10 minutes post-rollback",
        )

        await session.commit()
        logger.info("Successfully completed initial data seeding!")


if __name__ == "__main__":
    asyncio.run(seed_initial_data())
