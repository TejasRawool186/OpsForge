"""Tool Registry & Health Status Database Service Layer."""

import json
import logging
from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.tool import ToolRegistry
from app.models.base import utcnow

logger = logging.getLogger(__name__)


class ToolRegistryDBService:
    """Database service managing registered MCP tools, status health checks, and capabilities."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def upsert_tool(
        self,
        name: str,
        display_name: str,
        status: str = "ACTIVE",
        capabilities: Optional[List[str]] = None,
        latency_ms: int = 0,
        error_rate: float = 0.0,
        available_quota: int = 5000,
    ) -> ToolRegistry:
        """Register or update a tool's status and health parameters."""
        stmt = select(ToolRegistry).where(ToolRegistry.name == name.lower())
        res = await self.db.execute(stmt)
        tool = res.scalar_one_or_none()

        caps_json = json.dumps(capabilities or [])

        if tool is None:
            tool = ToolRegistry(
                name=name.lower(),
                display_name=display_name,
                status=status.upper(),
                capabilities_json=caps_json,
                last_check=utcnow(),
                latency_ms=latency_ms,
                error_rate=error_rate,
                available_quota=available_quota,
            )
            self.db.add(tool)
        else:
            tool.display_name = display_name
            tool.status = status.upper()
            tool.capabilities_json = caps_json
            tool.last_check = utcnow()
            tool.latency_ms = latency_ms
            tool.error_rate = error_rate
            tool.available_quota = available_quota

        await self.db.flush()
        await self.db.refresh(tool)
        logger.info(f"Upserted tool status in database: {name} ({status})")
        return tool

    async def get_all_tools(self) -> List[ToolRegistry]:
        """Fetch all registered tools."""
        stmt = select(ToolRegistry).order_by(ToolRegistry.name.asc())
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def get_tool_by_name(self, name: str) -> Optional[ToolRegistry]:
        """Fetch a specific tool status by name."""
        stmt = select(ToolRegistry).where(ToolRegistry.name == name.lower())
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()
