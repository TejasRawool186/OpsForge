"""Unit tests for WorkspaceService, GitHubAppService, ReadinessService, and Onboarding Flow."""

import pytest
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMember
from app.services.workspace_service import WorkspaceService
from app.services.readiness_service import ReadinessService
from app.services.github_app_service import GitHubAppService


@pytest.mark.asyncio
async def test_workspace_creation_and_membership(db_session):
    # Create test user
    user = User(id="user_101", email="sre@opsforge.io", hashed_password="mock_hash", full_name="SRE Admin")
    db_session.add(user)
    await db_session.commit()

    svc = WorkspaceService(db_session)
    ws = await svc.create_workspace(
        name="Production Ops",
        owner_id=user.id,
        environment="production",
        region="us-east-1",
        role="SRE_OPERATOR",
    )

    assert ws.id is not None
    assert ws.name == "Production Ops"
    assert ws.onboarding_status == "IN_PROGRESS"

    # Verify membership created as SRE_OPERATOR
    member = await svc.verify_membership(ws.id, user.id)
    assert member is not None
    assert member.role == "SRE_OPERATOR"

    # Test onboarding step update
    updated_ws = await svc.update_onboarding(ws.id, step="github", status="IN_PROGRESS")
    assert updated_ws.onboarding_step == "github"
    assert updated_ws.onboarding_status == "IN_PROGRESS"

    # Test completing onboarding
    completed_ws = await svc.complete_onboarding(ws.id)
    assert completed_ws.onboarding_status == "COMPLETED"


@pytest.mark.asyncio
async def test_readiness_check(db_session):
    user = User(id="user_102", email="ops@opsforge.io", hashed_password="mock_hash", full_name="Ops Lead")
    db_session.add(user)
    await db_session.commit()

    ws_svc = WorkspaceService(db_session)
    ws = await ws_svc.create_workspace(name="Staging Workspace", owner_id=user.id)

    readiness_svc = ReadinessService(db_session)
    res = await readiness_svc.check_workspace_readiness(ws.id, user.id)

    assert "overall_ready" in res
    assert "github" in res
    assert "grafana" in res
    assert "postgres" in res
    assert "safety" in res
    assert res["total_count"] == 3


@pytest.mark.asyncio
async def test_github_app_service(db_session):
    user = User(id="user_103", email="dev@opsforge.io", hashed_password="mock_hash", full_name="Dev Engineer")
    db_session.add(user)
    await db_session.commit()

    ws_svc = WorkspaceService(db_session)
    ws = await ws_svc.create_workspace(name="Test WS", owner_id=user.id)

    gh_svc = GitHubAppService(db_session)

    # State & URL verification
    state = gh_svc.generate_state()
    assert isinstance(state, str)
    connect_url = gh_svc.get_authorization_url(state)
    assert "github.com/login/oauth/authorize" in connect_url
    assert f"state={state}" in connect_url

    # Test connection when none exists
    conn = await gh_svc.get_connection(ws.id)
    assert conn is None
