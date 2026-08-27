"""API Routers Package Initialization."""

from app.routers.incidents import router as incidents_router
from app.routers.approvals import router as approvals_router
from app.routers.timeline import router as timeline_router
from app.routers.investigations import router as investigations_router
from app.routers.tools import router as tools_router
from app.routers.remediation import router as remediation_router
from app.routers.reports import router as reports_router

__all__ = [
    "incidents_router",
    "approvals_router",
    "timeline_router",
    "investigations_router",
    "tools_router",
    "remediation_router",
    "reports_router",
]
