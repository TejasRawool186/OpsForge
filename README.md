# OpsForge Documentation Hub

Welcome to the OpsForge project documentation repository. The root directory contains **only `README.md`**, while all comprehensive technical guides, architecture specifications, API contracts, planning schedules, team governance policies, and developer progress logs are neatly organized within categorized subdirectories inside `docs/`.

---

## 📑 Documentation Structure Overview

```
OpsForge/
├── README.md (Root File)
└── docs/
    ├── architecture/
    │   ├── ARCHITECTURE.md                  # System architecture & component design
    │   ├── AGENT_CAPABILITIES.md            # Multi-agent framework & subagent workflows
    │   ├── MCP_INTEGRATIONS.md              # Model Context Protocol tool integrations
    │   ├── SAFETY_DESIGN.md                 # Safety gates, risk framework & approvals
    │   └── OpsForge_Project_Specification.md# Master technical specification document
    ├── api/
    │   └── API_ENDPOINTS.md                 # REST API endpoints, schemas & HTTP codes
    ├── planning/
    │   ├── DEVELOPER_TASKS.md               # Sequence-wise hackathon developer task schedule
    │   ├── IMPLEMENTATION_PHASES.md         # 10-phase development roadmap & milestones
    │   ├── PROJECT_SUMMARY.md               # Vision, core capabilities & executive summary
    │   └── INDEX.md                         # Documentation index & role-based reading guide
    ├── governance/
    │   └── CODE_OF_CONDUCT.md               # Git workflows, code standards & team rules
    └── dev/
        ├── tejas.md                         # Tejas — Project Lead & Frontend Lead Log
        ├── samar.md                         # Samar — Backend Infrastructure Lead Log
        ├── atharv.md                        # Atharv — Backend API & Integration Lead Log
        └── vighnesh.md                      # Vighnesh — DevOps & QA Lead Log
```

---

## 🎯 Quick Navigation Links

### 🏗️ Architecture & System Specifications (`docs/architecture/`)
- **[System Architecture](docs/architecture/ARCHITECTURE.md)** — High-level architecture, layer responsibilities, data flow, and tech stack.
- **[Agent Capabilities & Workflows](docs/architecture/AGENT_CAPABILITIES.md)** — TrueForge incident agent loop, subagents (Metrics, Log, Git), and state machine design.
- **[MCP Integrations](docs/architecture/MCP_INTEGRATIONS.md)** — Model Context Protocol specifications for GitHub, Grafana, and PostgreSQL.
- **[Safety Design & Risk Framework](docs/architecture/SAFETY_DESIGN.md)** — Risk matrix (Level 0-3), human approval gate, and safety protocols.
- **[Project Specifications](docs/architecture/OpsForge_Project_Specification.md)** — Comprehensive master specification document.

### 🔌 API Documentation (`docs/api/`)
- **[API Endpoints Specification](docs/api/API_ENDPOINTS.md)** — FastAPI REST endpoints, Pydantic schemas, timeline streaming, and error contracts.

### 📅 Planning & Roadmap (`docs/planning/`)
- **[Hackathon Developer Tasks](docs/planning/DEVELOPER_TASKS.md)** — Day-by-day sequence-wise task lists for each team member (August 22-27, 2026).
- **[Implementation Phases](docs/planning/IMPLEMENTATION_PHASES.md)** — 10-phase development roadmap and key checkpoints.
- **[Project Summary](docs/planning/PROJECT_SUMMARY.md)** — Core problem statement, product vision, and 30-second elevator pitch.
- **[Documentation Index](docs/planning/INDEX.md)** — Role-based documentation index and reading guides.

### 📜 Team Governance & Standards (`docs/governance/`)
- **[Code of Conduct & Standards](docs/governance/CODE_OF_CONDUCT.md)** — Team guidelines, Git branching policy, code review rules, and security standards.

### 💻 Individual Developer Logs (`docs/dev/`)
- **[Tejas Log & Master Plan](docs/dev/tejas.md)** — Project Lead & Frontend Lead daily logs and task schedule.
- **[Samar Log](docs/dev/samar.md)** — Backend Infrastructure Lead daily progress log.
- **[Atharv Log](docs/dev/atharv.md)** — Backend API & Integration Lead daily progress log.
- **[Vighnesh Log](docs/dev/vighnesh.md)** — DevOps & QA Lead daily progress log.

---

## 🚀 Key Technologies & Stack

- **Agent Framework:** TrueForge (Core Agent Runtime & Subagent Coordinator)
- **Frontend UI:** Next.js 13+ (TypeScript, Tailwind CSS, shadcn/ui)
- **Backend API:** FastAPI (Python, Pydantic)
- **Database & ORM:** PostgreSQL + SQLAlchemy + Alembic
- **Integrations:** Model Context Protocol (GitHub MCP, Grafana MCP, PostgreSQL MCP)
- **DevOps & Infrastructure:** Docker, Docker Compose, GitHub Actions CI/CD
- **Testing:** Pytest (Backend), Jest (Frontend), Playwright (E2E)

---

## 📞 Support & Role Reading Paths

- **Product Managers & Stakeholders:** Start with [Project Summary](docs/planning/PROJECT_SUMMARY.md) and [Developer Tasks](docs/planning/DEVELOPER_TASKS.md).
- **Frontend & Agent Developers:** Read [Architecture](docs/architecture/ARCHITECTURE.md) and [Agent Capabilities](docs/architecture/AGENT_CAPABILITIES.md).
- **Backend Engineers:** Read [API Endpoints](docs/api/API_ENDPOINTS.md) and [MCP Integrations](docs/architecture/MCP_INTEGRATIONS.md).
- **DevOps & Security Engineers:** Read [Safety Design](docs/architecture/SAFETY_DESIGN.md) and [Code of Conduct](docs/governance/CODE_OF_CONDUCT.md).

---

**Last Updated:** 2026-08-16  
**Version:** 2.0  
**Hackathon:** The Agent Harness Hackathon (TrueForge)
