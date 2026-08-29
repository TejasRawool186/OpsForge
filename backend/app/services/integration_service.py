"""Service layer for user tool integrations management."""

import logging
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user_integration import UserIntegration
from app.core.security import encrypt_credentials, decrypt_credentials

logger = logging.getLogger(__name__)


class IntegrationService:
    """Service to handle CRUD and security for user integrations."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_integrations(self, user_id: str) -> List[UserIntegration]:
        """Fetch all integrations for a user."""
        stmt = select(UserIntegration).where(UserIntegration.user_id == user_id).order_by(UserIntegration.created_at.desc())
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def get_user_integration_by_tool(self, user_id: str, tool_name: str) -> Optional[UserIntegration]:
        """Fetch integration for specific user and tool."""
        stmt = select(UserIntegration).where(
            UserIntegration.user_id == user_id,
            UserIntegration.tool_name == tool_name
        )
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def get_integration_by_id(self, integration_id: str) -> Optional[UserIntegration]:
        """Fetch integration by ID."""
        stmt = select(UserIntegration).where(UserIntegration.id == integration_id)
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def save_user_integration(
        self,
        user_id: str,
        tool_name: str,
        config: Dict[str, Any],
        credentials: Optional[Dict[str, Any]] = None,
        display_name: Optional[str] = None,
    ) -> UserIntegration:
        """Create or update a user integration with encrypted credentials."""
        existing = await self.get_user_integration_by_tool(user_id, tool_name)
        
        encrypted_creds = None
        if credentials:
            # If credentials passed, encrypt them
            encrypted_creds = encrypt_credentials(credentials)
        elif existing and existing.encrypted_credentials:
            # Keep existing credentials if not provided in update
            encrypted_creds = existing.encrypted_credentials

        if existing:
            existing.config = config
            if encrypted_creds:
                existing.encrypted_credentials = encrypted_creds
            if display_name:
                existing.display_name = display_name
            existing.status = "UNTESTED"
            existing.updated_at = datetime.now(timezone.utc)
            await self.db.commit()
            await self.db.refresh(existing)
            logger.info(f"Updated integration {tool_name} for user {user_id}")
            return existing
        else:
            integration = UserIntegration(
                user_id=user_id,
                tool_name=tool_name,
                display_name=display_name or tool_name.capitalize(),
                config=config,
                encrypted_credentials=encrypted_creds,
                status="UNTESTED",
            )
            self.db.add(integration)
            await self.db.commit()
            await self.db.refresh(integration)
            logger.info(f"Created new integration {tool_name} for user {user_id}")
            return integration

    async def update_status(self, integration_id: str, status: str, error_message: Optional[str] = None) -> UserIntegration:
        """Update connection status and last tested timestamp."""
        integration = await self.get_integration_by_id(integration_id)
        if not integration:
            raise ValueError(f"Integration {integration_id} not found")

        integration.status = status
        integration.error_message = error_message
        integration.last_tested_at = datetime.now(timezone.utc)
        await self.db.commit()
        await self.db.refresh(integration)
        return integration

    async def get_decrypted_credentials(self, integration_id: str) -> Dict[str, Any]:
        """Fetch and decrypt credentials for a specific integration."""
        integration = await self.get_integration_by_id(integration_id)
        if not integration or not integration.encrypted_credentials:
            return {}
        return decrypt_credentials(integration.encrypted_credentials)

    async def delete_integration(self, integration_id: str, user_id: str) -> bool:
        """Delete a user integration."""
        integration = await self.get_integration_by_id(integration_id)
        if not integration or integration.user_id != user_id:
            return False
        await self.db.delete(integration)
        await self.db.commit()
        logger.info(f"Deleted integration {integration_id} for user {user_id}")
        return True
