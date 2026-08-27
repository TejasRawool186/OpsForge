"""Pydantic schemas for Tool Registry endpoints."""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class ToolResponse(BaseModel):
    """Response schema for a registered tool."""
    name: str
    display_name: str
    status: str
    capabilities: List[str] = []
    last_check: datetime


class ToolListResponse(BaseModel):
    """Response for listing all tools."""
    tools: List[ToolResponse]


class ToolStatusResponse(BaseModel):
    """Detailed status response for a single tool."""
    name: str
    display_name: str
    status: str
    last_check: datetime
    latency_ms: int
    error_rate: float
    available_quota: int
    capabilities: List[str] = []
