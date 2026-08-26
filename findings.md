# Findings: Samar Backend Infrastructure — OpsForge

## Project Context & Database Architecture
- **Project Name:** OpsForge (Autonomous AI Incident Response Engineer)
- **Role:** Samar (Backend Infrastructure Lead)
- **Primary Tech Stack:** PostgreSQL, SQLAlchemy 2.0 (Async), Alembic, AsyncSession, SQLite fallback for dev/tests.

## Required Database Tables & Fields
1. **`incidents`**:
   - `id`: String PK (e.g. `INC-2026-001`)
   - `title`: String(255), indexed
   - `service`: String(100), indexed
   - `severity`: String(20) (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), indexed
   - `status`: String(30) (`CREATED`, `INVESTIGATING`, `ROOT_CAUSE_FOUND`, `PROPOSING_ACTION`, `APPROVAL_REQUIRED`, `EXECUTING`, `VERIFYING`, `RESOLVED`, `CLOSED`), indexed
   - `description`: Text
   - `alert_source`: String(50)
   - `alert_id`: String(100)
   - `created_at`: DateTime, indexed
   - `updated_at`: DateTime
   - `created_by`: String(100)
   - `estimated_impact`: Text
   - `affected_users`: String(100)
   - `current_phase`: String(100)
   - `agent_status`: String(100)

2. **`incident_events`** (Timeline):
   - `id`: Integer PK
   - `incident_id`: String FK -> `incidents.id`, indexed
   - `timestamp`: DateTime, indexed
   - `event_type`: String(50), indexed
   - `description`: Text
   - `phase`: String(50)
   - `tool`: String(50)
   - `tool_call_id`: String(100)
   - `result_summary`: Text
   - `confidence`: Float
   - `sandbox_id`: String(100)
   - `approval_id`: String(100)
   - `data_json`: JSON / Text

3. **`investigations`**:
   - `id`: String PK (e.g. `INV-2026-001`)
   - `incident_id`: String FK -> `incidents.id`, indexed
   - `status`: String(50)
   - `phase`: String(50)
   - `strategy`: String(50)
   - `agent_type`: String(50)
   - `started_at`: DateTime
   - `ended_at`: DateTime
   - `reasoning`: Text
   - `hypothesis`: Text
   - `confidence`: Float
   - `evidence_count`: Integer
   - `evidence_json`: JSON / Text

4. **`approvals`**:
   - `id`: String PK (e.g. `apr-001`)
   - `incident_id`: String FK -> `incidents.id`, indexed
   - `action`: Text
   - `description`: Text
   - `risk_level`: String(20) (`SAFE`, `LOW`, `MEDIUM`, `HIGH`, `DESTRUCTIVE`), indexed
   - `confidence`: Float
   - `summary`: Text
   - `evidence_json`: JSON / Text
   - `reversibility`: String(50)
   - `estimated_downtime`: String(50)
   - `verification_plan`: Text
   - `alternatives_json`: JSON / Text
   - `requested_at`: DateTime
   - `expires_at`: DateTime
   - `status`: String(20) (`PENDING`, `APPROVED`, `REJECTED`, `EXPIRED`), indexed
   - `approved_by`: String(100)
   - `approval_reason`: Text
   - `rejected_by`: String(100)
   - `rejection_reason`: Text

5. **`audit_logs`**:
   - `id`: Integer PK
   - `incident_id`: String FK -> `incidents.id`, indexed
   - `approval_id`: String FK -> `approvals.id`, nullable, indexed
   - `action_type`: String(50)
   - `actor`: String(100)
   - `decision`: String(50)
   - `reason`: Text
   - `timestamp`: DateTime
   - `metadata_json`: JSON / Text

6. **`tool_registry`**:
   - `id`: Integer PK
   - `name`: String(50) UNIQUE, indexed
   - `display_name`: String(100)
   - `status`: String(20) (`ACTIVE`, `DEGRADED`, `INACTIVE`)
   - `capabilities_json`: JSON / Text
   - `last_check`: DateTime
   - `latency_ms`: Integer
   - `error_rate`: Float
   - `available_quota`: Integer

7. **`remediation_logs`**:
   - `id`: Integer PK
   - `incident_id`: String FK -> `incidents.id`, indexed
   - `action_type`: String(50)
   - `executed_at`: DateTime
   - `execution_time_seconds`: Integer
   - `post_metrics_json`: JSON / Text
   - `verification_status`: String(30) (`PENDING`, `RECOVERED`, `FAILED`)
   - `verified_at`: DateTime
   - `recovery_time_minutes`: Integer

## Performance & Design Requirements
- Async SQLAlchemy using `select()` syntax.
- Multi-column indexes on key search paths.
- Atomic state updates with transaction support.
- JSON support compatible with both SQLite and PostgreSQL.
