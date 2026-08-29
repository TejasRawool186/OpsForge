"""FastAPI Router for Managing Per-User Tool Integrations."""

import logging
from typing import Dict, Any, Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.services.integration_service import IntegrationService
from app.services.integration_checker import IntegrationCheckerService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/integrations", tags=["User Integrations"])


class IntegrationCreatePayload(BaseModel):
    user_id: str = Field(default="default_user", description="User or tenant identifier")
    tool_name: str = Field(..., description="Tool key, e.g., 'github', 'grafana', 'postgres'")
    display_name: Optional[str] = Field(default=None, description="Human readable label")
    config: Dict[str, Any] = Field(default_factory=dict, description="Non-secret settings")
    credentials: Optional[Dict[str, Any]] = Field(default=None, description="Secret API tokens or passwords")


class IntegrationTestPayload(BaseModel):
    tool_name: str
    config: Dict[str, Any] = Field(default_factory=dict)
    credentials: Optional[Dict[str, Any]] = Field(default=None)


@router.get("", response_model=List[Dict[str, Any]])
async def list_integrations(
    user_id: str = Query("default_user", description="User ID to list integrations for"),
    db: AsyncSession = Depends(get_db),
):
    """List all integrations configured for a user (secrets omitted)."""
    svc = IntegrationService(db)
    integrations = await svc.get_user_integrations(user_id)
    return [item.to_dict() for item in integrations]


@router.post("", response_model=Dict[str, Any])
async def save_integration(
    payload: IntegrationCreatePayload,
    db: AsyncSession = Depends(get_db),
):
    """Save or update integration configuration and credentials."""
    svc = IntegrationService(db)
    integration = await svc.save_user_integration(
        user_id=payload.user_id,
        tool_name=payload.tool_name,
        config=payload.config,
        credentials=payload.credentials,
        display_name=payload.display_name,
    )
    
    # Automatically perform live test upon saving if credentials provided
    creds_to_test = payload.credentials or await svc.get_decrypted_credentials(integration.id)
    is_success, msg = await IntegrationCheckerService.test_integration(
        tool_name=payload.tool_name,
        config=payload.config,
        credentials=creds_to_test,
    )
    status = "CONNECTED" if is_success else "ERROR"
    updated_integration = await svc.update_status(integration.id, status=status, error_message=msg if not is_success else None)
    
    resp_data = updated_integration.to_dict()
    resp_data["test_message"] = msg
    return resp_data


@router.post("/{integration_id}/test", response_model=Dict[str, Any])
async def test_existing_integration(
    integration_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Trigger a live connectivity check for an existing saved integration."""
    svc = IntegrationService(db)
    integration = await svc.get_integration_by_id(integration_id)
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")

    decrypted_creds = await svc.get_decrypted_credentials(integration_id)
    is_success, msg = await IntegrationCheckerService.test_integration(
        tool_name=integration.tool_name,
        config=integration.config or {},
        credentials=decrypted_creds,
    )
    status = "CONNECTED" if is_success else "ERROR"
    updated = await svc.update_status(integration_id, status=status, error_message=msg if not is_success else None)
    
    return {
        "success": is_success,
        "message": msg,
        "integration": updated.to_dict(),
    }


@router.post("/test-raw", response_model=Dict[str, Any])
async def test_raw_integration(
    payload: IntegrationTestPayload,
):
    """Perform a dry-run connectivity test without saving credentials to database."""
    is_success, msg = await IntegrationCheckerService.test_integration(
        tool_name=payload.tool_name,
        config=payload.config,
        credentials=payload.credentials or {},
    )
    return {"success": is_success, "message": msg}


@router.delete("/{integration_id}", response_model=Dict[str, Any])
async def delete_integration(
    integration_id: str,
    user_id: str = Query("default_user", description="User ID confirming ownership"),
    db: AsyncSession = Depends(get_db),
):
    """Delete a saved user integration."""
    svc = IntegrationService(db)
    success = await svc.delete_integration(integration_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Integration not found or unauthorized")
    return {"status": "success", "message": f"Integration {integration_id} removed"}
