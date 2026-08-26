"""initial schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-08-26 12:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Table: incidents
    op.create_table(
        'incidents',
        sa.Column('id', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('service', sa.String(length=100), nullable=False),
        sa.Column('severity', sa.String(length=20), nullable=False, server_default='MEDIUM'),
        sa.Column('status', sa.String(length=30), nullable=False, server_default='CREATED'),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('alert_source', sa.String(length=50), nullable=True),
        sa.Column('alert_id', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_by', sa.String(length=100), nullable=True, server_default='system'),
        sa.Column('estimated_impact', sa.Text(), nullable=True),
        sa.Column('affected_users', sa.String(length=100), nullable=True),
        sa.Column('current_phase', sa.String(length=100), nullable=True, server_default='Initial Detection'),
        sa.Column('agent_status', sa.String(length=100), nullable=True, server_default='Idle'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_incidents_title'), 'incidents', ['title'], unique=False)
    op.create_index(op.f('ix_incidents_service'), 'incidents', ['service'], unique=False)
    op.create_index(op.f('ix_incidents_severity'), 'incidents', ['severity'], unique=False)
    op.create_index(op.f('ix_incidents_status'), 'incidents', ['status'], unique=False)
    op.create_index(op.f('ix_incidents_created_at'), 'incidents', ['created_at'], unique=False)
    op.create_index('idx_incident_status_service', 'incidents', ['status', 'service'], unique=False)
    op.create_index('idx_incident_created_severity', 'incidents', ['created_at', 'severity'], unique=False)

    # 2. Table: incident_events
    op.create_table(
        'incident_events',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('incident_id', sa.String(length=50), nullable=False),
        sa.Column('timestamp', sa.DateTime(timezone=True), nullable=False),
        sa.Column('event_type', sa.String(length=50), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('phase', sa.String(length=50), nullable=True),
        sa.Column('tool', sa.String(length=50), nullable=True),
        sa.Column('tool_call_id', sa.String(length=100), nullable=True),
        sa.Column('result_summary', sa.Text(), nullable=True),
        sa.Column('confidence', sa.Float(), nullable=True),
        sa.Column('sandbox_id', sa.String(length=100), nullable=True),
        sa.Column('approval_id', sa.String(length=100), nullable=True),
        sa.Column('data_json', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['incident_id'], ['incidents.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_incident_events_incident_id'), 'incident_events', ['incident_id'], unique=False)
    op.create_index(op.f('ix_incident_events_timestamp'), 'incident_events', ['timestamp'], unique=False)
    op.create_index(op.f('ix_incident_events_event_type'), 'incident_events', ['event_type'], unique=False)
    op.create_index(op.f('ix_incident_events_tool'), 'incident_events', ['tool'], unique=False)
    op.create_index('idx_events_incident_time', 'incident_events', ['incident_id', 'timestamp'], unique=False)

    # 3. Table: investigations
    op.create_table(
        'investigations',
        sa.Column('id', sa.String(length=50), nullable=False),
        sa.Column('incident_id', sa.String(length=50), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='STARTED'),
        sa.Column('phase', sa.String(length=50), nullable=True, server_default='ANALYZING_EVIDENCE'),
        sa.Column('strategy', sa.String(length=50), nullable=False, server_default='AUTOMATIC'),
        sa.Column('agent_type', sa.String(length=50), nullable=False, server_default='incident-agent'),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('ended_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('reasoning', sa.Text(), nullable=True),
        sa.Column('hypothesis', sa.Text(), nullable=True),
        sa.Column('confidence', sa.Float(), nullable=True, server_default='0.0'),
        sa.Column('evidence_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('evidence_json', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['incident_id'], ['incidents.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_investigations_incident_id'), 'investigations', ['incident_id'], unique=False)
    op.create_index(op.f('ix_investigations_status'), 'investigations', ['status'], unique=False)
    op.create_index('idx_investigation_incident_status', 'investigations', ['incident_id', 'status'], unique=False)

    # 4. Table: approvals
    op.create_table(
        'approvals',
        sa.Column('id', sa.String(length=50), nullable=False),
        sa.Column('incident_id', sa.String(length=50), nullable=False),
        sa.Column('action', sa.Text(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('risk_level', sa.String(length=20), nullable=False, server_default='HIGH'),
        sa.Column('confidence', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('summary', sa.Text(), nullable=True),
        sa.Column('evidence_json', sa.Text(), nullable=True),
        sa.Column('reversibility', sa.String(length=50), nullable=True, server_default='FULLY_REVERSIBLE'),
        sa.Column('estimated_downtime', sa.String(length=50), nullable=True),
        sa.Column('verification_plan', sa.Text(), nullable=True),
        sa.Column('alternatives_json', sa.Text(), nullable=True),
        sa.Column('requested_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='PENDING'),
        sa.Column('approved_by', sa.String(length=100), nullable=True),
        sa.Column('approval_reason', sa.Text(), nullable=True),
        sa.Column('approved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('rejected_by', sa.String(length=100), nullable=True),
        sa.Column('rejection_reason', sa.Text(), nullable=True),
        sa.Column('rejected_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['incident_id'], ['incidents.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_approvals_incident_id'), 'approvals', ['incident_id'], unique=False)
    op.create_index(op.f('ix_approvals_risk_level'), 'approvals', ['risk_level'], unique=False)
    op.create_index(op.f('ix_approvals_status'), 'approvals', ['status'], unique=False)
    op.create_index(op.f('ix_approvals_requested_at'), 'approvals', ['requested_at'], unique=False)
    op.create_index('idx_approval_status_risk', 'approvals', ['status', 'risk_level'], unique=False)
    op.create_index('idx_approval_incident_status', 'approvals', ['incident_id', 'status'], unique=False)

    # 5. Table: audit_logs
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('incident_id', sa.String(length=50), nullable=False),
        sa.Column('approval_id', sa.String(length=50), nullable=True),
        sa.Column('action_type', sa.String(length=50), nullable=False),
        sa.Column('actor', sa.String(length=100), nullable=False, server_default='system'),
        sa.Column('decision', sa.String(length=50), nullable=False),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.Column('timestamp', sa.DateTime(timezone=True), nullable=False),
        sa.Column('metadata_json', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['approval_id'], ['approvals.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['incident_id'], ['incidents.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_audit_logs_incident_id'), 'audit_logs', ['incident_id'], unique=False)
    op.create_index(op.f('ix_audit_logs_approval_id'), 'audit_logs', ['approval_id'], unique=False)
    op.create_index(op.f('ix_audit_logs_action_type'), 'audit_logs', ['action_type'], unique=False)
    op.create_index(op.f('ix_audit_logs_timestamp'), 'audit_logs', ['timestamp'], unique=False)
    op.create_index('idx_audit_incident_time', 'audit_logs', ['incident_id', 'timestamp'], unique=False)

    # 6. Table: tool_registry
    op.create_table(
        'tool_registry',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=50), nullable=False),
        sa.Column('display_name', sa.String(length=100), nullable=False),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='ACTIVE'),
        sa.Column('capabilities_json', sa.Text(), nullable=True),
        sa.Column('last_check', sa.DateTime(timezone=True), nullable=False),
        sa.Column('latency_ms', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('error_rate', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('available_quota', sa.Integer(), nullable=False, server_default='5000'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_index(op.f('ix_tool_registry_name'), 'tool_registry', ['name'], unique=True)
    op.create_index(op.f('ix_tool_registry_status'), 'tool_registry', ['status'], unique=False)
    op.create_index('idx_tool_name_status', 'tool_registry', ['name', 'status'], unique=False)

    # 7. Table: remediation_logs
    op.create_table(
        'remediation_logs',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('incident_id', sa.String(length=50), nullable=False),
        sa.Column('action_type', sa.String(length=50), nullable=False),
        sa.Column('executed_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('execution_time_seconds', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('post_metrics_json', sa.Text(), nullable=True),
        sa.Column('verification_status', sa.String(length=30), nullable=False, server_default='PENDING'),
        sa.Column('verified_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('recovery_time_minutes', sa.Integer(), nullable=True),
        sa.Column('report_json', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['incident_id'], ['incidents.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_remediation_logs_incident_id'), 'remediation_logs', ['incident_id'], unique=False)
    op.create_index(op.f('ix_remediation_logs_verification_status'), 'remediation_logs', ['verification_status'], unique=False)
    op.create_index('idx_remediation_incident_status', 'remediation_logs', ['incident_id', 'verification_status'], unique=False)


def downgrade() -> None:
    op.drop_table('remediation_logs')
    op.drop_table('tool_registry')
    op.drop_table('audit_logs')
    op.drop_table('approvals')
    op.drop_table('investigations')
    op.drop_table('incident_events')
    op.drop_table('incidents')
