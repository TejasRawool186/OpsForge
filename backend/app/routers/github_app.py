"""FastAPI Router for GitHub App OAuth flow and repository management."""

import logging
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.routers.auth import get_current_user
from app.services.github_app_service import GitHubAppService
from app.services.workspace_service import WorkspaceService
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/github", tags=["GitHub App"])


class GitHubCallbackPayload(BaseModel):
    code: str = Field(..., description="GitHub OAuth authorization code")
    state: str = Field(..., description="CSRF state parameter")
    installation_id: Optional[str] = Field(None, description="GitHub App installation ID")
    workspace_id: str = Field(..., description="OpsForge workspace ID")


class RepositorySelectPayload(BaseModel):
    workspace_id: str = Field(..., description="Workspace ID")
    owner: str = Field(..., description="Repository owner")
    name: str = Field(..., description="Repository name")
    full_name: str = Field(..., description="Full repository name (owner/repo)")
    default_branch: str = Field(default="main")
    github_repo_id: Optional[str] = None


@router.get("/connect")
async def github_connect(
    workspace_id: str = Query(..., description="Workspace to connect GitHub for"),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Initiate GitHub App authorization flow."""
    # Verify workspace membership
    ws_svc = WorkspaceService(db)
    member = await ws_svc.verify_membership(workspace_id, current_user.id)
    if not member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a member of this workspace")

    if not settings.GITHUB_APP_CLIENT_ID:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="GitHub App not configured. Set GITHUB_APP_CLIENT_ID environment variable.",
        )

    github_svc = GitHubAppService(db)
    state = github_svc.generate_state()

    # In production, store state in session/cache with workspace_id + user_id
    # For now, encode workspace_id in the state
    combined_state = f"{state}:{workspace_id}:{current_user.id}"

    auth_url = github_svc.get_authorization_url(combined_state)
    return {
        "authorization_url": auth_url,
        "state": combined_state,
    }


@router.post("/callback")
async def github_callback(
    payload: GitHubCallbackPayload,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Handle GitHub OAuth callback — exchange code, get user, save connection."""
    github_svc = GitHubAppService(db)
    ws_svc = WorkspaceService(db)

    # Validate workspace membership
    member = await ws_svc.verify_membership(payload.workspace_id, current_user.id)
    if not member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a member of this workspace")

    # Validate state (extract and verify workspace_id matches)
    try:
        state_parts = payload.state.split(":")
        if len(state_parts) >= 3:
            state_workspace_id = state_parts[1]
            state_user_id = state_parts[2]
            if state_workspace_id != payload.workspace_id:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid state: workspace mismatch")
            if state_user_id != current_user.id:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid state: user mismatch")
    except (IndexError, ValueError):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid state parameter")

    try:
        # Exchange code for token (server-side only)
        token_data = await github_svc.exchange_code_for_token(payload.code)
        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No access token in GitHub response")

        # Get GitHub user info
        github_user = await github_svc.get_github_user(access_token)
        github_username = github_user.get("login", "")
        github_user_id = str(github_user.get("id", ""))

        # Get installations
        installations = await github_svc.get_user_installations(access_token)
        installation_id = payload.installation_id

        # If installation_id not provided, try to find the OpsForge app installation
        if not installation_id and installations:
            for inst in installations:
                app_slug = inst.get("app_slug", "")
                if app_slug == settings.GITHUB_APP_SLUG or str(inst.get("app_id", "")) == settings.GITHUB_APP_ID:
                    installation_id = str(inst["id"])
                    break
            # If still not found, use the first installation
            if not installation_id:
                installation_id = str(installations[0]["id"])

        # Save connection
        connection = await github_svc.save_connection(
            workspace_id=payload.workspace_id,
            user_id=current_user.id,
            github_user_id=github_user_id,
            github_username=github_username,
            installation_id=installation_id,
            auth_method="github_app",
        )

        return {
            "status": "connected",
            "github_username": github_username,
            "installation_id": installation_id,
            "connection": connection.to_dict(),
        }

    except ValueError as e:
        logger.error(f"GitHub callback error: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"GitHub callback unexpected error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="GitHub connection failed")


@router.get("/status")
async def github_status(
    workspace_id: str = Query(..., description="Workspace ID"),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get GitHub connection status for a workspace."""
    ws_svc = WorkspaceService(db)
    member = await ws_svc.verify_membership(workspace_id, current_user.id)
    if not member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a member of this workspace")

    github_svc = GitHubAppService(db)
    conn = await github_svc.get_connection(workspace_id)
    if not conn:
        return {"connected": False, "status": "NOT_CONNECTED"}

    selected_repo = await github_svc.get_selected_repository(workspace_id)

    return {
        "connected": conn.status == "CONNECTED",
        "status": conn.status,
        "github_username": conn.github_username,
        "auth_method": conn.auth_method,
        "installation_id": conn.installation_id,
        "selected_repository": selected_repo.to_dict() if selected_repo else None,
        "connection": conn.to_dict(),
    }


@router.get("/repositories")
async def list_repositories(
    workspace_id: str = Query(..., description="Workspace ID"),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List repositories available to the workspace's GitHub App installation."""
    ws_svc = WorkspaceService(db)
    member = await ws_svc.verify_membership(workspace_id, current_user.id)
    if not member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a member of this workspace")

    github_svc = GitHubAppService(db)
    conn = await github_svc.get_connection(workspace_id)
    if not conn or conn.status != "CONNECTED":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="GitHub not connected")

    if not conn.installation_id:
        return {"repositories": [], "message": "No GitHub App installation found"}

    try:
        repos = await github_svc.get_installation_repositories(conn.installation_id)
        return {
            "repositories": [
                {
                    "id": str(r.get("id", "")),
                    "owner": r.get("owner", {}).get("login", ""),
                    "name": r.get("name", ""),
                    "full_name": r.get("full_name", ""),
                    "default_branch": r.get("default_branch", "main"),
                    "private": r.get("private", False),
                    "description": r.get("description", ""),
                }
                for r in repos
            ],
        }
    except Exception as e:
        logger.error(f"Failed to list repos: {e}")
        return {"repositories": [], "message": str(e)}


@router.post("/repositories/select")
async def select_repository(
    payload: RepositorySelectPayload,
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Select a repository for the workspace."""
    ws_svc = WorkspaceService(db)
    member = await ws_svc.verify_membership(payload.workspace_id, current_user.id)
    if not member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a member of this workspace")

    github_svc = GitHubAppService(db)
    conn = await github_svc.get_connection(payload.workspace_id)
    if not conn or conn.status != "CONNECTED":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="GitHub not connected")

    # Verify repository access if installation exists
    if conn.installation_id:
        try:
            has_access = await github_svc.verify_repository_access(
                conn.installation_id, payload.owner, payload.name
            )
            if not has_access:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Installation does not have access to {payload.full_name}",
                )
        except ValueError:
            logger.warning("Could not verify repo access (GitHub App not fully configured)")

    repo = await github_svc.save_repository(
        github_connection_id=conn.id,
        owner=payload.owner,
        name=payload.name,
        full_name=payload.full_name,
        github_repo_id=payload.github_repo_id,
        default_branch=payload.default_branch,
    )
    return {"status": "selected", "repository": repo.to_dict()}


@router.post("/disconnect")
async def disconnect_github(
    workspace_id: str = Query(..., description="Workspace ID"),
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Disconnect GitHub from workspace."""
    ws_svc = WorkspaceService(db)
    member = await ws_svc.verify_membership(workspace_id, current_user.id)
    if not member:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a member of this workspace")

    github_svc = GitHubAppService(db)
    success = await github_svc.disconnect(workspace_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No GitHub connection found")
    return {"status": "disconnected"}
