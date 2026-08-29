"""OpsForge FastAPI Application — Main entry point."""

import logging
from datetime import datetime, timezone
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.db.session import async_engine
from app.models import Base
from app.middleware.request_guard import RequestGuardMiddleware
from app.routers.incidents import router as incidents_router
from app.routers.approvals import router as approvals_router
from app.routers.timeline import router as timeline_router
from app.routers.investigations import router as investigations_router
from app.routers.tools import router as tools_router
from app.routers.remediation import router as remediation_router
from app.routers.reports import router as reports_router
from app.routers.risk_assessment import router as risk_assessment_router
from app.routers.integrations import router as integrations_router
from app.routers.auth import router as auth_router
from app.routers.mock import router as mock_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("opsforge")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle manager."""
    logger.info("OpsForge Backend starting up...")
    # Create database tables on startup (for SQLite dev mode)
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created/verified.")

    # Seed default tool registry
    await _seed_default_tools()
    logger.info("Default tool registry seeded.")

    yield

    logger.info("OpsForge Backend shutting down...")
    await async_engine.dispose()


async def _seed_default_tools():
    """Seed the tool registry with default MCP tools if empty."""
    from app.db.session import AsyncSessionLocal
    from app.services.tool_registry_db import ToolRegistryDBService

    async with AsyncSessionLocal() as session:
        svc = ToolRegistryDBService(session)
        tools = await svc.get_all_tools()
        if not tools:
            await svc.upsert_tool(
                name="github", display_name="GitHub", status="ACTIVE",
                capabilities=["get_repository_info", "get_recent_commits", "get_pull_request", "search_commits", "get_deployment_history"],
                latency_ms=145, error_rate=0.0, available_quota=4500,
            )
            await svc.upsert_tool(
                name="grafana", display_name="Grafana", status="ACTIVE",
                capabilities=["query_metrics", "get_dashboard", "query_logs", "get_alert_history", "compare_metrics"],
                latency_ms=89, error_rate=0.0, available_quota=5000,
            )
            await svc.upsert_tool(
                name="postgres", display_name="PostgreSQL", status="ACTIVE",
                capabilities=["execute_query", "get_table_schema", "get_slow_queries", "analyze_data"],
                latency_ms=12, error_rate=0.0, available_quota=10000,
            )
            await session.commit()


# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="OpsForge — Autonomous AI Incident Response Engineer API",
    version="1.0.0",
    lifespan=lifespan,
)

# Request Guard Middleware
app.add_middleware(RequestGuardMiddleware)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handlers
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content={"error": "NOT_FOUND", "message": str(exc.detail) if hasattr(exc, "detail") else "Resource not found",
                 "timestamp": datetime.now(timezone.utc).isoformat()},
    )


@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    logger.error(f"Internal server error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "INTERNAL_ERROR", "message": "An internal server error occurred",
                 "timestamp": datetime.now(timezone.utc).isoformat()},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {type(exc).__name__}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "INTERNAL_ERROR", "message": "An unexpected error occurred",
                 "timestamp": datetime.now(timezone.utc).isoformat()},
    )


# Health check
@app.get("/health", tags=["System"])
async def health_check():
    return {"status": "healthy", "project": settings.PROJECT_NAME, "version": "1.0.0",
            "timestamp": datetime.now(timezone.utc).isoformat()}


# API info
@app.get("/", tags=["System"])
async def root():
    return {"project": settings.PROJECT_NAME, "description": "Autonomous AI Incident Response Engineer",
            "version": "1.0.0", "docs": "/docs", "api_prefix": settings.API_V1_STR}


# Register API routers under /api/v1 and /api
for r in [
    incidents_router,
    approvals_router,
    timeline_router,
    investigations_router,
    tools_router,
    remediation_router,
    reports_router,
    risk_assessment_router,
    integrations_router,
    auth_router,
    mock_router,
]:
    app.include_router(r, prefix=settings.API_V1_STR)
    app.include_router(r, prefix="/api")

