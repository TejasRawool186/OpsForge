"""Service layer for workspace management and onboarding state."""

import logging
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.workspace import Workspace, WorkspaceMember, OnboardingStatus

logger = logging.getLogger(__name__)


class WorkspaceService:
    """Service to handle workspace CRUD, membership, and onboarding state."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_workspace(
        self,
        name: str,
        owner_id: str,
        environment: str = "production",
        region: str = "us-east-1",
        role: str = "SRE_OPERATOR",
    ) -> Workspace:
        """Create a new workspace and add owner as first member."""
        workspace = Workspace(
            name=name,
            environment=environment,
            region=region,
            owner_id=owner_id,
            onboarding_status=OnboardingStatus.IN_PROGRESS.value,
            onboarding_step="github",
        )
        self.db.add(workspace)
        await self.db.flush()

        # Add owner as workspace member
        member = WorkspaceMember(
            workspace_id=workspace.id,
            user_id=owner_id,
            role=role,
        )
        self.db.add(member)
        await self.db.commit()
        await self.db.refresh(workspace)
        logger.info(f"Created workspace '{name}' for user {owner_id}")
        return workspace

    async def get_workspace_by_id(self, workspace_id: str) -> Optional[Workspace]:
        """Get workspace by ID."""
        stmt = select(Workspace).where(Workspace.id == workspace_id)
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def get_user_workspaces(self, user_id: str) -> List[Workspace]:
        """Get all workspaces a user belongs to."""
        stmt = (
            select(Workspace)
            .join(WorkspaceMember, WorkspaceMember.workspace_id == Workspace.id)
            .where(WorkspaceMember.user_id == user_id)
            .order_by(Workspace.created_at.desc())
        )
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def verify_membership(self, workspace_id: str, user_id: str) -> Optional[WorkspaceMember]:
        """Verify user is a member of the workspace."""
        stmt = select(WorkspaceMember).where(
            WorkspaceMember.workspace_id == workspace_id,
            WorkspaceMember.user_id == user_id,
        )
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def update_onboarding(
        self,
        workspace_id: str,
        status: Optional[str] = None,
        step: Optional[str] = None,
    ) -> Workspace:
        """Update workspace onboarding progress."""
        workspace = await self.get_workspace_by_id(workspace_id)
        if not workspace:
            raise ValueError(f"Workspace {workspace_id} not found")

        if status:
            workspace.onboarding_status = status
        if step:
            workspace.onboarding_step = step
        workspace.updated_at = datetime.now(timezone.utc)
        await self.db.commit()
        await self.db.refresh(workspace)
        return workspace

    async def complete_onboarding(self, workspace_id: str) -> Workspace:
        """Mark onboarding as completed."""
        return await self.update_onboarding(
            workspace_id,
            status=OnboardingStatus.COMPLETED.value,
            step="complete",
        )
