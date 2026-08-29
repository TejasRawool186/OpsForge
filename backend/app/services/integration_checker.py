"""Dynamic health check and testing service for third-party integrations."""

import httpx
import logging
from typing import Dict, Any, Tuple
import asyncpg

logger = logging.getLogger(__name__)


class IntegrationCheckerService:
    """Performs live connectivity and authorization tests for user integrations."""

    @staticmethod
    async def test_github(config: Dict[str, Any], credentials: Dict[str, Any]) -> Tuple[bool, str]:
        """Test GitHub integration using token and optional repository owner/name."""
        token = credentials.get("github_token") or credentials.get("token")
        owner = config.get("repo_owner")
        repo = config.get("repo_name")

        headers = {
            "Accept": "application/vnd.github+json",
            "User-Agent": "OpsForge-Agent/1.0",
        }
        if token:
            headers["Authorization"] = f"Bearer {token}"

        url = "https://api.github.com/user"
        if owner and repo:
            url = f"https://api.github.com/repos/{owner}/{repo}"

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(url, headers=headers)
                if resp.status_code in [200, 304]:
                    res_data = resp.json()
                    target_name = res_data.get("full_name") or res_data.get("login") or "GitHub API"
                    return True, f"Successfully connected to GitHub ({target_name})"
                elif resp.status_code == 401:
                    return False, "GitHub Authentication Failed: Invalid Personal Access Token"
                elif resp.status_code == 404:
                    return False, f"Repository '{owner}/{repo}' not found or token lacks access"
                else:
                    return False, f"GitHub API error (HTTP {resp.status_code}): {resp.text[:100]}"
        except Exception as exc:
            logger.error(f"GitHub test exception: {exc}")
            return False, f"Network error connecting to GitHub: {str(exc)}"

    @staticmethod
    async def test_grafana(config: Dict[str, Any], credentials: Dict[str, Any]) -> Tuple[bool, str]:
        """Test Grafana instance health and API key validity."""
        url = config.get("grafana_url", "").rstrip("/")
        if not url:
            return False, "Grafana URL is required"

        api_key = credentials.get("grafana_api_key") or credentials.get("api_key")
        headers = {"User-Agent": "OpsForge-Agent/1.0"}
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"

        try:
            health_url = f"{url}/api/health"
            async with httpx.AsyncClient(timeout=10.0, verify=False) as client:
                resp = await client.get(health_url, headers=headers)
                if resp.status_code == 200:
                    health_data = resp.json()
                    version = health_data.get("version", "unknown")
                    database_status = health_data.get("database", "ok")
                    return True, f"Connected to Grafana v{version} (DB Status: {database_status})"
                elif resp.status_code == 401:
                    return False, "Grafana Authentication Failed: Invalid API Key or Service Token"
                else:
                    return False, f"Grafana error (HTTP {resp.status_code}): {resp.text[:100]}"
        except Exception as exc:
            logger.error(f"Grafana test exception: {exc}")
            return False, f"Failed to reach Grafana at {url}: {str(exc)}"

    @staticmethod
    async def test_postgres(config: Dict[str, Any], credentials: Dict[str, Any]) -> Tuple[bool, str]:
        """Test custom PostgreSQL database connection."""
        host = config.get("db_host") or config.get("host")
        port = int(config.get("db_port") or config.get("port") or 5432)
        database = config.get("db_name") or config.get("database") or "postgres"
        user = credentials.get("db_user") or credentials.get("user") or "postgres"
        password = credentials.get("db_password") or credentials.get("password") or ""

        if not host:
            return False, "Database host is required"

        try:
            conn = await asyncpg.connect(
                host=host,
                port=port,
                user=user,
                password=password,
                database=database,
                ssl="require" if config.get("ssl", True) else False,
                timeout=5.0,
            )
            version = await conn.fetchval("SELECT version()")
            await conn.close()
            short_ver = version.split()[0] + " " + version.split()[1] if version else "PostgreSQL"
            return True, f"Connected successfully to PostgreSQL database ({short_ver})"
        except Exception as exc:
            logger.error(f"PostgreSQL test exception: {exc}")
            return False, f"PostgreSQL connection error: {str(exc)}"

    @classmethod
    async def test_integration(cls, tool_name: str, config: Dict[str, Any], credentials: Dict[str, Any]) -> Tuple[bool, str]:
        """Route to appropriate integration test based on tool name."""
        tool = tool_name.lower()
        if tool == "github":
            return await cls.test_github(config, credentials)
        elif tool == "grafana":
            return await cls.test_grafana(config, credentials)
        elif tool == "postgres" or tool == "postgresql":
            return await cls.test_postgres(config, credentials)
        else:
            return True, f"Configuration saved for {tool_name}"
