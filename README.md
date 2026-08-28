# OpsForge — Autonomous AI Incident Response & SRE Command Center

[![Hackathon](https://img.shields.io/badge/Hackathon-The%20Agent%20Harness%20Hackathon%202026-6366f1?style=for-the-badge)](https://wemakedevs.org)
[![Harness](https://img.shields.io/badge/Agent%20Harness-TrueForge-06b6d4?style=for-the-badge)](https://github.com/truefoundry/trueforge)
[![Code Review](https://img.shields.io/badge/Code%20Quality-Qodo%20AI%20Reviewed-10b981?style=for-the-badge)](https://qodo.ai)
[![License](https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge)](LICENSE)

**OpsForge** is an autonomous AI incident response system and SRE command center built for **The Agent Harness Hackathon (August 24–30, 2026)**.

Instead of acting as a simple chat interface that provides debugging advice, OpsForge leverages **TrueForge** as its agent runtime to actively investigate production issues, query live metrics via MCP tools, coordinate parallel subagents, execute diagnostic code safely in a sandbox, stop for human safety approvals before sensitive actions, and verify post-remediation recovery.

---

## 🌟 Why OpsForge? (Solving "The Gap")

LLMs are great at explaining what *should* be done, but struggle to reliably execute real-world operations. During a production outage, SREs cannot wait for advice—they need an autonomous system that can:

1. **Investigate Automatically**: Parse incident alerts and gather telemetry from logs, metrics, and deployments.
2. **Coordinate Specialized Agents**: Parallelize domain analysis across subagents (Metrics, Logs, Git, DB).
3. **Execute Diagnostics Safely**: Test hypotheses using sandboxed code execution.
4. **Keep Humans in the Loop**: Enforce non-bypassable human safety gates for high-risk actions (rollbacks, DB schema changes, service restarts).
5. **Verify & Document**: Validate metric recovery post-fix and generate multi-format post-mortem reports.

---

## 🛠️ TrueForge Agent Harness Capabilities

OpsForge makes full use of all core **TrueForge** agent harness capabilities:

| TrueForge Feature | Implementation in OpsForge |
| :--- | :--- |
| **MCP Tools** | Integrates Model Context Protocol servers for GitHub (`get_recent_deployments`), Grafana (`query_metrics`), PostgreSQL (`execute_query`, `get_slow_queries`), and server health registry. |
| **Specialized Subagents** | Main Incident Agent orchestrates parallel subagents: **Metrics Agent** (time-series anomalies), **Log Agent** (exception correlation), **Git Agent** (commit/PR correlation), and **Database Agent** (query locks). |
| **Git-Backed Skills** | Uses reusable domain instruction packs (`.trueforge/skills/incident-triage/SKILL.md`) defining multi-phase incident response protocols. |
| **Code Execution Sandbox** | Executes diagnostic scripts and fix verifications inside isolated **Daytona** sandbox environments to avoid running arbitrary code on production hosts. |
| **Human Safety Approval Gate** | Implements a dynamic risk matrix (`L0` Safe to `L3` Destructive). Level 2+ actions pause execution and queue an approval request for SRE authorization. |
| **Persistent Sessions & Context** | Stores incident timelines, telemetry traces, agent hypothesis streams, and post-mortems in SQLite/PostgreSQL. |

---

## 🏗️ System Architecture

```
                                  +---------------------------------------+
                                  |     Next.js 14 SRE Command Center    |
                                  |  (/incidents, /approvals, /reports)   |
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
|  Specialized Subagents |                                                   |   MCP Tools & Server  |
|  * Metrics Agent      |                                                   |   * GitHub MCP        |
|  * Log Agent          |                                                   |   * Grafana MCP       |
|  * Git Agent          |                                                   |   * PostgreSQL MCP    |
|  * DB Agent           |                                                   |   * Tool Registry     |
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
                                |    Daytona Sandbox    |
                                |  (Code Execution)     |
                                +-----------------------+
```

---

## 🔍 Qodo Code Review Evidence

> **Hackathon Requirement:** This project uses [Qodo](https://qodo.ai) for continuous automated code review across all pull requests to ensure production-grade code quality, security compliance, and repository maintainability.

### Qodo Workflow Integration
- **GitHub App Setup**: Qodo was connected to `TejasRawool186/OpsForge` repository with automated `/agentic_review` triggers on every pull request.
- **Branch Protection**: Direct pushes to `main` are restricted; all features are merged via reviewed Pull Requests.

### Representative Merged Pull Request
- **PR Link**: [Pull Request #1: Complete OpsForge Platform Core & SRE Command Center](https://github.com/TejasRawool186/OpsForge/pull/1)

### Summary of Qodo Review Findings & Resolution
1. **Payload Size Guard & Security Headers** (`backend/app/middleware/request_guard.py`):
   - *Qodo Finding*: Identified potential unhandled body stream reading leading to memory exhaustion on unbounded API requests.
   - *Resolution*: Implemented 10MB payload size restriction and added security response headers (`X-Content-Type-Options`, `X-Frame-Options`).
2. **Async Database Session Lifecycle** (`backend/app/db/session.py`):
   - *Qodo Finding*: Flagged potential connection leak risk in async session cleanup during high concurrency.
   - *Resolution*: Wrapped session management in explicit async context managers with automatic rollback on exception.
3. **SSR Safety & WebGL LineWaves Component** (`frontend/src/components/ui/LineWaves.jsx`):
   - *Qodo Finding*: Highlighted window/document reference error risk when rendering OGL WebGL components during Next.js SSR build.
   - *Resolution*: Converted LineWaves import to dynamic SSR-disabled loading (`dynamic(() => import(...), { ssr: false })`).
4. **API Rate Limiting & Input Validation** (`backend/app/routers/approvals.py`):
   - *Qodo Finding*: Flagged missing parameter sanitization on approval decision payloads.
   - *Resolution*: Added strict Pydantic validation regex and non-repudiable audit logging entries.

---

## 🚀 Quickstart & Local Setup

### Prerequisites
- **Node.js**: v22.0.0 or higher
- **Python**: v3.10 or higher
- **TrueForge CLI**: `npx @truefoundry/trueforge`

### 1. Clone & Set Up Environment
```bash
git clone https://github.com/TejasRawool186/OpsForge.git
cd OpsForge
```

### 2. Run TrueForge Agent Harness
```bash
npx @truefoundry/trueforge
# Opens TrueForge Harness UI at http://localhost:8790
```

### 3. Set Up & Start FastAPI Backend
```bash
# Navigate to backend and create virtual environment
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed initial baseline & demo SRE incident data
python scripts/seed_demo_data.py

# Run FastAPI server
uvicorn app.main:app --reload --port 8000
```
*Backend API documentation available at [http://localhost:8000/docs](http://localhost:8000/docs)*

### 4. Set Up & Start Next.js Frontend
```bash
# In a new terminal window:
cd frontend
npm install
npm run dev
```
*OpsForge SRE Command Center available at [http://localhost:3000](http://localhost:3000)*

---

## 🧪 Testing & Verification

OpsForge maintains a strict zero-compromise testing policy:

```bash
# Run Backend Pytest Suite
cd backend
pytest

# Output: 11 passed in 1.64s

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
- **Planning & Development**:
  - [Sequence-Wise Developer Tasks](docs/planning/DEVELOPER_TASKS.md)
  - [10-Phase Implementation Roadmap](docs/planning/IMPLEMENTATION_PHASES.md)
  - [Project Summary & Problem Statement](docs/planning/PROJECT_SUMMARY.md)
  - [Master Progress Log](progress.md)
- **Team Progress Logs**:
  - [Tejas Log (Project & Frontend Lead)](docs/dev/tejas.md)
  - [Samar Log (Backend Infrastructure Lead)](docs/dev/samar.md)
  - [Atharv Log (Backend API Lead)](docs/dev/atharv.md)
  - [Vighnesh Log (DevOps & QA Lead)](docs/dev/vighnesh.md)

---

## 👥 Team & Roles

- **Tejas Rawool** — Project Lead & Frontend Lead (Agent Architecture, Next.js, Cyberpunk SRE UI)
- **Samar** — Backend Infrastructure Lead (PostgreSQL/SQLite DB Schema, SQLAlchemy ORM, Alembic)
- **Atharv** — Backend API & Integration Lead (FastAPI Routers, Approvals, Remediation, Multi-Format Exporter)
- **Vighnesh** — DevOps & QA Lead (Containerization, CI/CD Pipelines, Test Suites)

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.
