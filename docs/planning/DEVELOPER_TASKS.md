# Developer Task Assignments & Sequence — OpsForge Project
## Hackathon Window: August 24-30, 2026

**Project:** OpsForge (Autonomous SRE Incident Response System)  
**Hackathon:** The Agent Harness Hackathon (TrueForge-based)  
**Team Structure:** 3 Core Developers

---

## 👥 Team Structure & Roles

| Developer | Primary Role | Domain Responsibilities |
|-----------|--------------|-------------------------|
| **Tejas Rawool** | **Project Lead & Backend Infrastructure & DevOps Lead** | Overall system architecture, Async FastAPI core, SQLAlchemy ORM models, Alembic migrations, Database connection pooling, Docker containerization, CI/CD pipelines, TrueForge agent harness loop, and Safety Approval persistence layer. |
| **Samar** | **Frontend Lead** | Next.js 14 App Router, SRE Command Center UI, IssueTracker visual design system, glassmorphic UI component library, Notification dropdown system, WebGL LineWaves landing page, and responsive page layouts. |
| **Vighnesh** | **Integration & QA Lead** | REST API contracts, Pydantic request/response schemas, FastAPI routers (Incidents, Approvals, Timeline, Tools, Risk, Reports), Frontend API client layer, Pytest backend test suite, Qodo code reviews, and E2E scenario testing. |

---

## 📅 Implementation Roadmap by Developer

### 1. Tejas Rawool — Backend Infrastructure & DevOps Lead
- [x] Configure `backend/app/core/config.py` with Pydantic BaseSettings.
- [x] Set up async SQLAlchemy database engine (`aiosqlite` / `asyncpg`) in `backend/app/db/session.py`.
- [x] Implement core database ORM models (`Incident`, `Event`, `Investigation`, `Approval`, `AuditLog`, `ToolRegistry`, `RemediationLog`).
- [x] Configure Alembic migration pipeline (`alembic/env.py`) and generate baseline migration.
- [x] Build core database CRUD service layer (`IncidentCRUDService`, `TimelineDBService`, `InvestigationDBService`, `ApprovalDBService`, `ToolRegistryDBService`, `RemediationDBService`).
- [x] Implement FastAPI main application, lifecycle hooks, and `RequestGuardMiddleware`.
- [x] Create database seeding scripts (`seed_initial_data.py`, `seed_demo_data.py`).
- [x] Configure containerization (`Dockerfile`, `docker-compose.yml`) and GitHub Actions CI pipelines.

### 2. Samar — Frontend Lead
- [x] Initialize Next.js 14 (App Router) project in `frontend/` with TypeScript & Tailwind CSS.
- [x] Build core UI primitives in `src/components/ui/` (`Button`, `Badge`, `Card`, `Modal`, `Tabs`, `Input`, `Tooltip`, `Table`).
- [x] Build application shell (`Sidebar`, `Navbar`, `CommandPalette`, `AppLayout`).
- [x] Build Incident Command Center views (`/incidents`, `/incidents/[id]`, `/approvals`, `/tools`, `/reports`, `/settings`).
- [x] Overhaul UI to match IssueTracker visual design system (left-striped KPI cards, priority stats ribbon).
- [x] Build `NotificationsDropdown.tsx` with live unread counter, animated pulse indicator, and categorized notification feeds.
- [x] Build centered WebGL splash landing screen (`/`) with `sessionStorage` landing page guard.

### 3. Vighnesh — Integration & QA Lead
- [x] Create Pydantic data schemas in `backend/app/schemas/`.
- [x] Build FastAPI REST routers for Incidents, Investigations, Approvals, Timeline, Tools, Risk Assessment, and Reports.
- [x] Build Risk Assessment matrix router (`app/routers/risk_assessment.py`).
- [x] Build Multi-Format Post-Mortem Report Exporter (`app/routers/reports.py`).
- [x] Build frontend API client layer (`frontend/src/lib/api.ts`) with mock data fallback provider (`mock-data.ts`).
- [x] Build Pytest test suites (`test_db_services.py`, `test_api_endpoints.py`) achieving 100% passing results.
- [x] Execute Qodo automated code reviews across pull requests and document evidence in `README.md`.
