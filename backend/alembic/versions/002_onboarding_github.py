"""Add workspaces, workspace_members, github_connections, and github_repositories tables.

Revision ID: 002_onboarding_github
Revises: 001_initial_schema
Create Date: 2026-08-29 21:40:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002_onboarding_github'
down_revision = '001_initial_schema'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create Workspaces Table
    op.create_table(
        'workspaces',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('environment', sa.String(), nullable=False, server_default='production'),
        sa.Column('region', sa.String(), nullable=False, server_default='us-east-1'),
        sa.Column('owner_id', sa.String(), nullable=False),
        sa.Column('onboarding_status', sa.String(), nullable=False, server_default='NOT_STARTED'),
        sa.Column('onboarding_step', sa.String(), nullable=False, server_default='welcome'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # Create Workspace Members Table
    op.create_table(
        'workspace_members',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('workspace_id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('role', sa.String(), nullable=False, server_default='MEMBER'),
        sa.Column('joined_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['workspace_id'], ['workspaces.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create GitHub Connections Table
    op.create_table(
        'github_connections',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('workspace_id', sa.String(), nullable=False),
        sa.Column('auth_method', sa.String(), nullable=False, server_default='APP'),
        sa.Column('installation_id', sa.String(), nullable=True),
        sa.Column('github_username', sa.String(), nullable=True),
        sa.Column('encrypted_tokens', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=False, server_default='CONNECTED'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['workspace_id'], ['workspaces.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create GitHub Repositories Table
    op.create_table(
        'github_repositories',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('connection_id', sa.String(), nullable=False),
        sa.Column('github_repo_id', sa.String(), nullable=True),
        sa.Column('owner', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('full_name', sa.String(), nullable=False),
        sa.Column('default_branch', sa.String(), nullable=False, server_default='main'),
        sa.Column('is_selected', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['connection_id'], ['github_connections.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('github_repositories')
    op.drop_table('github_connections')
    op.drop_table('workspace_members')
    op.drop_table('workspaces')
