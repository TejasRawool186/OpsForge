"""FastAPI Router for Onboarding flow and readiness checks."""

import logging
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.routers.auth import get_current_user
from app.services.workspace_service import WorkspaceService
from app.services.readiness_service import ReadinessService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/onboarding", tags=["Onboarding"])


@router.get("/state")
async def get_onboarding_state(
    workspace_id: str = Query(None, description="Workspace ID"),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the onboarding state for the user's workspace or detect first-time user."""
    svc = WorkspaceService(db)
    workspaces = await svc.get_user_workspaces(current_user.id)

    if not workspaces:
        return {
            "has_workspace": False,
            "onboarding_required": True,
            "step": "welcome",
            "status": "NOT_STARTED",
        }

    # If workspace_id provided, get that specific workspace
    if workspace_id:
        workspace = await svc.get_workspace_by_id(workspace_id)
        if not workspace:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")
        member = await svc.verify_membership(workspace_id, current_user.id)
        if not member:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a member of this workspace")
    else:
        workspace = workspaces[0]  # Use most recent

    is_completed = workspace.onboarding_status == "COMPLETED"

    return {
        "has_workspace": True,
        "workspace_id": workspace.id,
        "workspace_name": workspace.name,
        "onboarding_required": not is_completed,
        "step": workspace.onboarding_step or "welcome",
        "status": workspace.onboarding_status,
    }


@router.get("/readiness")
async def check_readiness(
    workspace_id: str = Query(..., description="Workspace ID"),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Run live environment readiness checks for a workspace."""
    ws_svc = WorkspaceService(db)
    member = await ws_svc.verify_membership(workspace_id, current_user.id)
    if not member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a member of this workspace")

    readiness_svc = ReadinessService(db)
    result = await readiness_svc.check_workspace_readiness(workspace_id, current_user.id)
    return result


@router.post("/complete")
async def complete_onboarding(
    workspace_id: str = Query(..., description="Workspace ID"),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark onboarding as complete and redirect user to command center."""
    ws_svc = WorkspaceService(db)
    member = await ws_svc.verify_membership(workspace_id, current_user.id)
    if not member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a member of this workspace")

    workspace = await ws_svc.complete_onboarding(workspace_id)
    return {
        "status": "completed",
        "workspace": workspace.to_dict(),
        "redirect_url": "/incidents",
    }
