# OpsForge — Autonomous AI Incident Response & SRE Command Center

[![Hackathon](https://img.shields.io/badge/Hackathon-The%20Agent%20Harness%20Hackathon%202026-6366f1?style=for-the-badge)](https://wemakedevs.org)
[![Harness](https://img.shields.io/badge/Agent%20Harness-TrueForge-06b6d4?style=for-the-badge)](https://github.com/truefoundry/trueforge)
[![Code Review](https://img.shields.io/badge/Code%20Quality-Qodo%20AI%20Reviewed-10b981?style=for-the-badge)](https://qodo.ai)
[![Demo Video](https://img.shields.io/badge/Demo%20Video-YouTube-ff0000?style=for-the-badge&logo=youtube)](https://www.youtube.com/watch?v=Mpe9J7v2ChY)
[![License](https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge)](LICENSE)

**OpsForge** is an autonomous AI incident response system and SRE command center built for **The Agent Harness Hackathon**.

> 🎬 **Watch the Demo Video**: [YouTube Demo Walkthrough](https://www.youtube.com/watch?v=Mpe9J7v2ChY)

Instead of acting as a simple chat interface that provides debugging advice, OpsForge leverages **TrueForge** as its agent runtime to actively investigate production issues, query live metrics via MCP tools, coordinate incident state workflows, execute diagnostic verifications, stop for human safety approvals before sensitive actions, and generate automated post-mortems.

---

## 📊 Current Implementation Status

OpsForge follows an honest, transparent engineering model distinguishing live, production-ready capabilities from architected roadmap designs:

### 🟢 Implemented & Verified (Production Ready)
- **Interactive Onboarding Wizard & Multi-Tenant Workspaces**: 4-step interactive onboarding (`/onboarding`), workspace management (`/workspace`), and GitHub App connect/browse/disconnect flow.
- **Outbound GitHub Integration**: Real `httpx`-based GitHub App authentication and API integration (`github_app_service.py`).
- **Incident Response & State Engine**: Real-time incident lifecycle management (`/incidents`, `/api/v1/incidents`) backed by async database state.
- **Server-Enforced Human Safety Approval Gate**: Non-bypassable risk engine (`/approvals`, `/api/v1/risk-assessment`, `/api/v1/approvals`) classifying actions from Level 0 (Safe) to Level 3 (Destructive).
- **Automated SRE Reports & Post-Mortems**: Dynamic post-mortem generation and report export (`/reports`, `/api/v1/reports`).
- **MCP Tool Status & Health Registry**: DB-backed MCP tool health and latency monitoring (`/tools`, `/api/v1/tools`).
- **Containerized Stack**: Complete Docker Compose setup (`docker-compose.yml`, Dockerfiles for FastAPI & Next.js 14).
- **TrueForge Git-Backed Skills**: 2 reusable domain instruction packs in `.trueforge/skills/` (`incident-triage`, `post-mortem-report`).
- **Verified Test Suite**: 14/14 Pytest backend tests passing and 10/10 Next.js frontend routes compiling cleanly.

### 🟡 Architected / Planned Roadmap
- **Full Daytona Sandbox Execution**: Isolated code sandbox execution runtime (currently handled via FastAPI server-side verification handlers).
- **Parallel Subagent Swarm**: Multi-agent swarm (Metrics, Log, Git, DB workers) orchestrated by a single primary Incident Agent.

---

## 🌟 Why OpsForge? (Solving "The Gap")

LLMs are great at explaining what *should* be done, but struggle to reliably execute real-world operations. During a production outage, SREs cannot wait for advice—they need an autonomous system that can:

1. **Investigate Automatically**: Parse incident alerts and gather telemetry from logs, metrics, and deployments.
2. **Execute State Machine Workflows**: Guide incidents through triage, investigation, remediation, and post-mortem phases.
3. **Execute Diagnostics Safely**: Verify hypotheses using controlled diagnostic checks.
4. **Keep Humans in the Loop**: Enforce non-bypassable human safety gates for high-risk actions (rollbacks, DB schema changes, service restarts).
5. **Verify & Document**: Validate metric recovery post-fix and generate multi-format post-mortem reports.

---

## 🛠️ TrueForge Agent Harness Capabilities

OpsForge maps core **TrueForge** agent harness capabilities directly to SRE workflows:

| TrueForge Feature | Implementation Status in OpsForge |
| :--- | :--- |
| **MCP Tools** | **Implemented**: DB-backed tool health & latency registry (`/tools`) combined with real outbound GitHub App API calls (`github_app_service.py`). *(Grafana/Postgres MCP tool servers architected in registry).* |
| **Orchestrated Agent** | **Implemented**: Primary Incident Agent state engine orchestrating investigation and recovery workflows. *(Parallel multi-agent subagent swarm architected).* |
| **Git-Backed Skills** | **Implemented**: 2 domain instruction packs in `.trueforge/skills/` (`incident-triage/SKILL.md` and `post-mortem-report/SKILL.md`) defining multi-phase incident response protocols. |
| **Code Execution Sandbox** | **Architected**: Sandbox execution design for Daytona containers; current verifications run via backend diagnostic handlers. |
| **Human Safety Approval Gate** | **Implemented**: Server-enforced risk assessment matrix (`L0` Safe to `L3` Destructive). Level 2+ actions pause execution and queue authorization requests at `/api/v1/approvals`. |
| **Persistent Sessions & Context** | **Implemented**: Async SQLAlchemy models + Alembic migrations (`workspace`, `github_connection`, `incident`, `timeline`, `report`) persisting telemetry and incident state. |

---

## 🏗️ System Architecture

```
                                  +---------------------------------------+
                                  |     Next.js 14 SRE Command Center     |
                                  | (/onboarding, /incidents, /approvals) |
                                  +-------------------+-------------------+
                                                      |
                                           REST API / WebSockets
                                                      |
                                  +-------------------+-------------------+
                                  |         FastAPI Backend Core          |
                                  |   (RequestGuard, Routers, Services)   |
                                  +-------------------+-------------------+
                                                      |
                                                      v
                                  +---------------------------------------+
                                  |      TrueForge Agent Runtime          |
                                  |   (Orchestrator & State Machine)      |
                                  +---------+-------------------+---------+
                                            |                   |
            +-------------------------------+                   +-------------------------------+
            |                                                                                   |
            v                                                                                   v
+-----------------------+                                                   +-----------------------+
| TrueForge Git Skills  |                                                   |   MCP Tools & Server  |
| * incident-triage     |                                                   |   * GitHub Integration|
| * post-mortem-report  |                                                   |   * Tool Registry     |
+-----------+-----------+                                                   +-----------+-----------+
            |                                                                                   |
            +-------------------------------+---------------------------------------------------+
                                            |
                                            v
                                +-----------------------+
                                |  Safety Approval Gate |
                                |  (L0-L3 Risk Matrix)  |
                                +-----------+-----------+
                                            |
                                            v
                                +-----------------------+
                                |    Diagnostic Engine  |
                                |  (Verification Flow)  |
                                +-----------------------+
```

---

## 🔍 Qodo Code Review Evidence

> **Hackathon Requirement:** This project uses [Qodo](https://qodo.ai) for continuous automated code review across pull requests to ensure production-grade code quality, security compliance, and repository maintainability.

### Qodo Workflow Integration
- **GitHub App Setup**: Qodo was connected to `TejasRawool186/OpsForge` repository with automated `/agentic_review` triggers on pull requests.
- **Branch Protection & Quality Gates**: Main branch protection configured with mandatory automated code review checks.

### Representative Merged Pull Request
- **PR Link**: [Pull Request #6: Dockerization, Containerized Builds & Visual Polish](https://github.com/TejasRawool186/OpsForge/pull/6)

### Summary of Qodo Review Findings & Resolution
1. **LineWaves Animation Loop Cleanup** (`frontend/src/components/ui/LineWaves.jsx`):
   - *Qodo Finding*: Highlighted missing canvas resize event listener cleanup and potential animation loop memory leak on component unmount.
   - *Resolution*: Added clean `cancelAnimationFrame` handle and explicit `window.removeEventListener('resize')` teardown in `useEffect`.
2. **Container Environment & Port Mapping** (`docker-compose.yml` & `frontend/Dockerfile`):
   - *Qodo Finding*: Flagged missing environment fallbacks and container network host binding consistency between Next.js production build and FastAPI service.
   - *Resolution*: Configured explicit `NEXT_PUBLIC_API_URL` build args, non-root user permissions, and exposed container port specs.
3. **Workspace Model Cascade Deletion** (`backend/app/models/workspace.py`):
   - *Qodo Finding*: Identified potential orphaned records when deleting parent workspace entities without foreign key cascade constraints.
   - *Resolution*: Implemented SQLAlchemy `cascade="all, delete-orphan"` relationships across workspace entities.
4. **Pydantic Tool Schema Validation** (`backend/app/schemas/tool.py`):
   - *Qodo Finding*: Noted unvalidated latency integer inputs allowing negative or out-of-range tool telemetry values.
   - *Resolution*: Enforced strict `Field(ge=0, le=60000)` non-negative validation constraints.

---

## 🚀 Quickstart & Local Setup

### Option A: Docker Compose Setup (Recommended)
```bash
git clone https://github.com/TejasRawool186/OpsForge.git
cd OpsForge

# Launch full stack (FastAPI Backend + Next.js Frontend)
docker compose up --build
```
- **SRE Command Center**: [http://localhost:3000](http://localhost:3000)
- **Onboarding Wizard**: [http://localhost:3000/onboarding](http://localhost:3000/onboarding)
- **FastAPI API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Option B: Manual Local Setup

#### Prerequisites
- **Node.js**: v22.0.0 or higher
- **Python**: v3.10 or higher
- **TrueForge CLI**: `npx @truefoundry/trueforge`

#### 1. Run TrueForge Agent Harness
```bash
npx @truefoundry/trueforge
# Opens TrueForge Harness UI at http://localhost:8790
```

#### 2. Set Up & Start FastAPI Backend
```bash
cd backend
python -m venv venv

# Activate virtual environment
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations & seed initial SRE incident data
python scripts/seed_demo_data.py

# Start FastAPI dev server
uvicorn app.main:app --reload --port 8000
```

#### 3. Set Up & Start Next.js Frontend
```bash
# In a new terminal window:
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing & Verification

OpsForge maintains a strict zero-compromise testing policy:

```bash
# Run Backend Pytest Suite
cd backend
pytest

# Output: 14 passed in 4.95s (4 test files: API, DB Models, Services, Onboarding)

# Run Frontend Production Build Check
cd frontend
npm run build

# Output: 10/10 static & dynamic routes compiled cleanly (0 errors)
```

---

## 📑 Complete Documentation Hub

Detailed documentation is available in the `docs/` directory:

- **Architecture**:
  - [System Architecture](docs/architecture/ARCHITECTURE.md)
  - [Agent Capabilities & Subagent Architecture](docs/architecture/AGENT_CAPABILITIES.md)
  - [MCP Integrations Specification](docs/architecture/MCP_INTEGRATIONS.md)
  - [Safety Design & Risk Framework](docs/architecture/SAFETY_DESIGN.md)
  - [Master Technical Specification](docs/architecture/OpsForge_Project_Specification.md)
- **API Reference**:
  - [API Endpoints Specification](docs/api/API_ENDPOINTS.md)
- **Governance**:
  - [Code of Conduct](docs/governance/CODE_OF_CONDUCT.md)
- **Planning & Development**:
  - [Developer Tasks & Blueprint](docs/planning/DEVELOPER_TASKS.md)
  - [10-Phase Implementation Roadmap](docs/planning/IMPLEMENTATION_PHASES.md)
  - [Project Summary & Problem Statement](docs/planning/PROJECT_SUMMARY.md)
  - [Master Progress Log](docs/planning/progress.md)
  - [Task Plan](docs/planning/task_plan.md)
  - [Findings & Discoveries](docs/planning/findings.md)
- **Team Progress Logs**:
  - [Tejas Rawool Log (Project & Backend & DevOps Lead)](docs/dev/tejas.md)
  - [Samar Log (Frontend Lead)](docs/dev/samar.md)
  - [Vighnesh Log (Integration & QA Lead)](docs/dev/vighnesh.md)

---

## 👥 Team & Roles

- **Tejas Rawool** — Project Lead & Backend Infrastructure & DevOps Lead (System Architecture, Async FastAPI, ORM Models, Docker/CI, Harness Integration)
- **Samar** — Frontend Lead (Next.js 14 App Router, SRE Command Center, Onboarding Wizard, WebGL Landing Page)
- **Vighnesh** — Integration & QA Lead (REST API Routers, Pydantic Schemas, Safety Gate Logic, Pytest Suite, Qodo AI Reviews)

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.
