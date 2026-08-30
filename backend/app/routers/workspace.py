"""FastAPI Router for Workspace Management."""

import logging
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.routers.auth import get_current_user
from app.services.workspace_service import WorkspaceService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/workspaces", tags=["Workspaces"])


class WorkspaceCreatePayload(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Workspace name")
    environment: str = Field(default="production", description="Environment type")
    region: str = Field(default="us-east-1", description="Deployment region")
    role: str = Field(default="SRE_OPERATOR", description="User's role in workspace")


class OnboardingUpdatePayload(BaseModel):
    status: Optional[str] = None
    step: Optional[str] = None


@router.post("", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def create_workspace(
    payload: WorkspaceCreatePayload,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new workspace for the authenticated user."""
    svc = WorkspaceService(db)
    workspace = await svc.create_workspace(
        name=payload.name,
        owner_id=current_user.id,
        environment=payload.environment,
        region=payload.region,
        role=payload.role,
    )
    return workspace.to_dict()


@router.get("", response_model=List[Dict[str, Any]])
async def list_workspaces(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all workspaces the authenticated user belongs to."""
    svc = WorkspaceService(db)
    workspaces = await svc.get_user_workspaces(current_user.id)
    return [w.to_dict() for w in workspaces]


@router.get("/{workspace_id}", response_model=Dict[str, Any])
async def get_workspace(
    workspace_id: str,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get workspace details (requires membership)."""
    svc = WorkspaceService(db)
    member = await svc.verify_membership(workspace_id, current_user.id)
    if not member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a member of this workspace")
    workspace = await svc.get_workspace_by_id(workspace_id)
    if not workspace:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")
    return workspace.to_dict()


@router.patch("/{workspace_id}/onboarding", response_model=Dict[str, Any])
async def update_onboarding(
    workspace_id: str,
    payload: OnboardingUpdatePayload,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update workspace onboarding progress."""
    svc = WorkspaceService(db)
    member = await svc.verify_membership(workspace_id, current_user.id)
    if not member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a member of this workspace")
    workspace = await svc.update_onboarding(workspace_id, status=payload.status, step=payload.step)
    return workspace.to_dict()
