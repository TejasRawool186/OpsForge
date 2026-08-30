"""GitHub App service for OAuth flow, installation management, and API communication."""

import logging
import time
import secrets
from typing import List, Optional, Dict, Any, Tuple
import httpx
import jwt as pyjwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.models.github_connection import GitHubConnection, GitHubRepository

logger = logging.getLogger(__name__)


class GitHubAppService:
    """Centralized service for GitHub App authentication and API communication."""

    GITHUB_API_BASE = "https://api.github.com"
    GITHUB_AUTH_URL = "https://github.com/login/oauth/authorize"
    GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"

    def __init__(self, db: AsyncSession):
        self.db = db

    # ---- OAuth / App Auth Flow ----

    def get_authorization_url(self, state: str) -> str:
        """Generate GitHub OAuth authorization URL for GitHub App."""
        return (
            f"{self.GITHUB_AUTH_URL}"
            f"?client_id={settings.GITHUB_APP_CLIENT_ID}"
            f"&state={state}"
            f"&redirect_uri={settings.FRONTEND_URL}/onboarding"
        )

    @staticmethod
    def generate_state() -> str:
        """Generate a cryptographically secure state parameter for CSRF protection."""
        return secrets.token_urlsafe(32)

    async def exchange_code_for_token(self, code: str) -> Dict[str, Any]:
        """Exchange OAuth authorization code for access token."""
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                self.GITHUB_TOKEN_URL,
                headers={"Accept": "application/json"},
                data={
                    "client_id": settings.GITHUB_APP_CLIENT_ID,
                    "client_secret": settings.GITHUB_APP_CLIENT_SECRET,
                    "code": code,
                },
            )
            if resp.status_code != 200:
                logger.error(f"GitHub token exchange failed: {resp.status_code}")
                raise ValueError("Failed to exchange GitHub authorization code")
            data = resp.json()
            if "error" in data:
                raise ValueError(f"GitHub OAuth error: {data.get('error_description', data['error'])}")
            return data

    async def get_github_user(self, access_token: str) -> Dict[str, Any]:
        """Get authenticated GitHub user info."""
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{self.GITHUB_API_BASE}/user",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github+json",
                    "User-Agent": "OpsForge-Agent/1.0",
                },
            )
            if resp.status_code != 200:
                raise ValueError("Failed to get GitHub user info")
            return resp.json()

    async def get_user_installations(self, access_token: str) -> List[Dict[str, Any]]:
        """Get GitHub App installations accessible to the authenticated user."""
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{self.GITHUB_API_BASE}/user/installations",
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/vnd.github+json",
                    "User-Agent": "OpsForge-Agent/1.0",
                },
            )
            if resp.status_code != 200:
                logger.warning(f"Failed to get installations: {resp.status_code}")
                return []
            data = resp.json()
            return data.get("installations", [])

    # ---- Installation Token (Server-Side) ----

    def _generate_jwt(self) -> str:
        """Generate a JWT signed with the GitHub App private key."""
        if not settings.GITHUB_APP_ID or not settings.GITHUB_APP_PRIVATE_KEY:
            raise ValueError("GitHub App ID and Private Key must be configured")

        now = int(time.time())
        payload = {
            "iat": now - 30,
            "exp": now + (8 * 60),  # 8 minutes in future (exp - iat = 510s, well within GitHub 600s max)
            "iss": settings.GITHUB_APP_ID,
        }
        # Handle private key potentially being base64 encoded or file path
        private_key = settings.GITHUB_APP_PRIVATE_KEY
        if "\\n" in private_key:
            private_key = private_key.replace("\\n", "\n")

        return pyjwt.encode(payload, private_key, algorithm="RS256")

    async def get_installation_token(self, installation_id: str) -> str:
        """Generate a short-lived installation access token."""
        jwt_token = self._generate_jwt()
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                f"{self.GITHUB_API_BASE}/app/installations/{installation_id}/access_tokens",
                headers={
                    "Authorization": f"Bearer {jwt_token}",
                    "Accept": "application/vnd.github+json",
                    "User-Agent": "OpsForge-Agent/1.0",
                },
            )
            if resp.status_code != 201:
                logger.error(f"Failed to get installation token: {resp.status_code} {resp.text}")
                raise ValueError("Failed to generate installation access token")
            return resp.json()["token"]

    # ---- Repository Operations ----

    async def get_installation_repositories(self, installation_id: str) -> List[Dict[str, Any]]:
        """Get repositories accessible to a GitHub App installation."""
        try:
            token = await self.get_installation_token(installation_id)
        except ValueError:
            logger.warning("Cannot get installation token, returning empty repos")
            return []

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{self.GITHUB_API_BASE}/installation/repositories",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Accept": "application/vnd.github+json",
                    "User-Agent": "OpsForge-Agent/1.0",
                },
                params={"per_page": 100},
            )
            if resp.status_code != 200:
                logger.warning(f"Failed to list repos: {resp.status_code}")
                return []
            return resp.json().get("repositories", [])

    async def verify_repository_access(self, installation_id: str, owner: str, repo: str) -> bool:
        """Verify the installation has access to a specific repository."""
        repos = await self.get_installation_repositories(installation_id)
        return any(r.get("full_name") == f"{owner}/{repo}" for r in repos)

    async def get_repository(self, installation_id: str, owner: str, repo: str) -> Optional[Dict[str, Any]]:
        """Get repository metadata via installation token."""
        try:
            token = await self.get_installation_token(installation_id)
        except ValueError:
            return None

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{self.GITHUB_API_BASE}/repos/{owner}/{repo}",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Accept": "application/vnd.github+json",
                    "User-Agent": "OpsForge-Agent/1.0",
                },
            )
            if resp.status_code != 200:
                return None
            return resp.json()

    async def get_pull_requests(self, installation_id: str, owner: str, repo: str) -> List[Dict[str, Any]]:
        """Get pull requests for a repository."""
        try:
            token = await self.get_installation_token(installation_id)
        except ValueError:
            return []

        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                f"{self.GITHUB_API_BASE}/repos/{owner}/{repo}/pulls",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Accept": "application/vnd.github+json",
                    "User-Agent": "OpsForge-Agent/1.0",
                },
                params={"state": "all", "per_page": 10},
            )
            if resp.status_code != 200:
                return []
            return resp.json()

    # ---- Database Operations ----

    async def save_connection(
        self,
        workspace_id: str,
        user_id: str,
        github_user_id: Optional[str] = None,
        github_username: Optional[str] = None,
        installation_id: Optional[str] = None,
        auth_method: str = "github_app",
    ) -> GitHubConnection:
        """Save or update a GitHub connection for a workspace."""
        # Check for existing connection
        stmt = select(GitHubConnection).where(
            GitHubConnection.workspace_id == workspace_id,
        )
        res = await self.db.execute(stmt)
        existing = res.scalar_one_or_none()

        if existing:
            existing.github_user_id = github_user_id or existing.github_user_id
            existing.github_username = github_username or existing.github_username
            existing.installation_id = installation_id or existing.installation_id
            existing.auth_method = auth_method
            existing.status = "CONNECTED"
            existing.error_message = None
            await self.db.commit()
            await self.db.refresh(existing)
            return existing

        conn = GitHubConnection(
            workspace_id=workspace_id,
            user_id=user_id,
            github_user_id=github_user_id,
            github_username=github_username,
            installation_id=installation_id,
            auth_method=auth_method,
            status="CONNECTED",
        )
        self.db.add(conn)
        await self.db.commit()
        await self.db.refresh(conn)
        return conn

    async def get_connection(self, workspace_id: str) -> Optional[GitHubConnection]:
        """Get GitHub connection for a workspace."""
        stmt = select(GitHubConnection).where(
            GitHubConnection.workspace_id == workspace_id,
        )
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def save_repository(
        self,
        github_connection_id: str,
        owner: str,
        name: str,
        full_name: str,
        github_repo_id: Optional[str] = None,
        default_branch: str = "main",
    ) -> GitHubRepository:
        """Save a selected repository."""
        # Unselect any previously selected repos for this connection
        stmt = select(GitHubRepository).where(
            GitHubRepository.github_connection_id == github_connection_id,
            GitHubRepository.is_selected == True,
        )
        res = await self.db.execute(stmt)
        for repo in res.scalars().all():
            repo.is_selected = False

        # Check if repo already exists
        stmt = select(GitHubRepository).where(
            GitHubRepository.github_connection_id == github_connection_id,
            GitHubRepository.full_name == full_name,
        )
        res = await self.db.execute(stmt)
        existing = res.scalar_one_or_none()

        if existing:
            existing.is_selected = True
            existing.default_branch = default_branch
            await self.db.commit()
            await self.db.refresh(existing)
            return existing

        repo = GitHubRepository(
            github_connection_id=github_connection_id,
            github_repo_id=github_repo_id,
            owner=owner,
            name=name,
            full_name=full_name,
            default_branch=default_branch,
            is_selected=True,
        )
        self.db.add(repo)
        await self.db.commit()
        await self.db.refresh(repo)
        return repo

    async def get_selected_repository(self, workspace_id: str) -> Optional[GitHubRepository]:
        """Get the currently selected repository for a workspace."""
        conn = await self.get_connection(workspace_id)
        if not conn:
            return None
        stmt = select(GitHubRepository).where(
            GitHubRepository.github_connection_id == conn.id,
            GitHubRepository.is_selected == True,
        )
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def disconnect(self, workspace_id: str) -> bool:
        """Disconnect GitHub from workspace."""
        conn = await self.get_connection(workspace_id)
        if not conn:
            return False
        conn.status = "DISCONNECTED"
        await self.db.commit()
        return True
