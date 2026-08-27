"""Common shared Pydantic models for OpsForge API."""

from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel


class ErrorResponse(BaseModel):
    """Standard error response format."""
    error: str
    message: str
    details: Optional[Dict[str, Any]] = None
    timestamp: datetime


class HealthResponse(BaseModel):
    """Health check endpoint response."""
    status: str = "healthy"
    project: str = "OpsForge"
    version: str = "1.0.0"
    database: str = "connected"
    timestamp: datetime
