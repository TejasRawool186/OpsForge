"""Tool Registry API Router — MCP tool status and capabilities."""

import json
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.tool_registry_db import ToolRegistryDBService
from app.schemas.tool import ToolResponse, ToolListResponse, ToolStatusResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tools", tags=["Tools"])


def _parse_capabilities(tool) -> list:
    if tool.capabilities_json:
        try:
            return json.loads(tool.capabilities_json)
        except (json.JSONDecodeError, TypeError):
            pass
    return []


@router.get("", response_model=ToolListResponse)
async def list_tools(db: AsyncSession = Depends(get_db)):
    """List all registered MCP tools and their status."""
    svc = ToolRegistryDBService(db)
    tools = await svc.get_all_tools()
    tool_list = [
        ToolResponse(
            name=t.name,
            display_name=t.display_name,
            status=t.status,
            capabilities=_parse_capabilities(t),
            last_check=t.last_check,
            latency_ms=getattr(t, "latency_ms", 15),
            requires_approval=getattr(t, "requires_approval", False),
            tool_type=getattr(t, "tool_type", "MCP Tool"),
            description=getattr(t, "description", None),
            mcp_server=getattr(t, "mcp_server", t.name),
        )
        for t in tools
    ]
    return ToolListResponse(tools=tool_list)


@router.get("/{tool_name}/status", response_model=ToolStatusResponse)
async def get_tool_status(tool_name: str, db: AsyncSession = Depends(get_db)):
    """Get detailed status for a specific tool."""
    svc = ToolRegistryDBService(db)
    tool = await svc.get_tool_by_name(tool_name)
    if not tool:
        raise HTTPException(status_code=404, detail={"error": "TOOL_NOT_FOUND", "message": f"Tool '{tool_name}' not found"})
    return ToolStatusResponse(
        name=tool.name, display_name=tool.display_name, status=tool.status,
        last_check=tool.last_check, latency_ms=tool.latency_ms, error_rate=tool.error_rate,
        available_quota=tool.available_quota, capabilities=_parse_capabilities(tool),
    )
