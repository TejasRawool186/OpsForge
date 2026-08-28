# Implementation Task Plan — OpsForge Development

> **Team Allocation:**  
> - **Tejas Rawool**: Project Lead, Backend Infrastructure & DevOps Lead  
> - **Samar**: Frontend Lead (UI/UX, Next.js, Component Library, Dashboards, Landing Page)  
> - **Vighnesh**: Integration & QA Lead (API Contracts, MCP Tools, Safety Workflows, Test Suite)  
> **Status:** COMPLETED

---

## 🎯 Implementation Phases & Developer Assignments

### Phase 1: Environment, Backend Infrastructure & DevOps `[Tejas]`
- [x] Configure `backend/app/core/config.py` with Pydantic BaseSettings.
- [x] Configure `backend/app/db/session.py` with async SQLAlchemy engine & connection pool.
- [x] Implement core database ORM models in `backend/app/models/` (`Incident`, `Event`, `Investigation`, `Approval`, `AuditLog`, `ToolRegistry`, `RemediationLog`).
- [x] Set up Alembic migrations pipeline and baseline migration (`001_initial_schema.py`).
- [x] Configure containerization (`Dockerfile`, `docker-compose.yml`) and CI pipelines.

### Phase 2: Core Database CRUD Services & Handlers `[Tejas]`
- [x] Implement `IncidentCRUDService` (`backend/app/services/incident_crud.py`).
- [x] Implement `TimelineDBService` (`backend/app/services/timeline_db.py`).
- [x] Implement `InvestigationDBService` (`backend/app/services/investigation_db.py`).
- [x] Implement `ApprovalDBService` with atomic safety gates and audit tracking (`backend/app/services/approval_db.py`).
- [x] Implement `ToolRegistryDBService` (`backend/app/services/tool_registry_db.py`).
- [x] Implement `RemediationDBService` (`backend/app/services/remediation_db.py`).
- [x] Create database seeding scripts (`seed_initial_data.py`, `seed_demo_data.py`).

### Phase 3: Frontend Command Center & Design System `[Samar]`
- [x] Initialize Next.js 14 (App Router) project in `frontend/` with TypeScript & Tailwind CSS.
- [x] Build core UI primitives in `src/components/ui/` (`Button`, `Badge`, `Card`, `Modal`, `Tabs`, `Input`, `Tooltip`, `Table`).
- [x] Build application shell (`Sidebar`, `Navbar`, `CommandPalette`, `AppLayout`).
- [x] Build Incident Command Center pages (`/incidents`, `/incidents/[id]`, `/approvals`, `/tools`, `/reports`, `/settings`).
- [x] Implement IssueTracker visual language overhaul, stats ribbon, and notification dropdown (`NotificationsDropdown.tsx`).
- [x] Implement centered splash landing page (`/`) with WebGL LineWaves background.

### Phase 4: Integration APIs & Safety Gate Workflows `[Vighnesh]`
- [x] Create Pydantic data schemas in `backend/app/schemas/`.
- [x] Build Incident, Investigation, Approval, Timeline, Tool, and Remediation FastAPI routers.
- [x] Build Safety Risk Assessment router (`app/routers/risk_assessment.py`).
- [x] Build Multi-Format Post-Mortem Report Exporter (`app/routers/reports.py`).
- [x] Build frontend API client layer (`frontend/src/lib/api.ts`).

### Phase 5: Verification, QA & Test Suite `[Vighnesh & Tejas]`
- [x] Implement Pytest async DB test suite (`backend/tests/test_db_services.py`).
- [x] Implement Pytest API endpoint test suite (`backend/tests/test_api_endpoints.py`).
- [x] Execute Next.js build verification (`npm run build` — `10/10` static/dynamic pages compiled).
- [x] Verify Qodo code review integration.
