# OpsForge Documentation Index

## 📚 Organized Documentation Suite

**Total Documentation Files:** 15 files across 5 categorized subdirectories  
**Folder Organization:**
- `docs/architecture/` (System architecture, agent design, MCP integrations, safety & specifications)
- `docs/api/` (API endpoints & data contracts)
- `docs/planning/` (Developer tasks, implementation phases, progress log, task plan, findings, project summary & index)
- `docs/governance/` (Code of conduct & team standards)
- `docs/dev/` (Individual developer progress logs)

---

## Document Inventory & Directory Map

### 1. Root Directory (`/`)
- **[README.md](../../README.md)** — Main project entry point, hackathon presentation overview, quick navigation hub, tech stack, and setup instructions.

---

### 2. Architecture & Design (`docs/architecture/`)

- **[ARCHITECTURE.md](../architecture/ARCHITECTURE.md)**
  - **Purpose:** System architecture, layer responsibilities, component interactions, and tech stack details.
  - **Audience:** Architects, tech leads, backend & frontend engineers.

- **[AGENT_CAPABILITIES.md](../architecture/AGENT_CAPABILITIES.md)**
  - **Purpose:** TrueForge incident agent loop, subagents (Metrics, Log, Git), and investigation state machine logic.
  - **Audience:** Agent architects, AI engineers, workflow developers.

- **[MCP_INTEGRATIONS.md](../architecture/MCP_INTEGRATIONS.md)**
  - **Purpose:** Model Context Protocol (MCP) specifications for GitHub, Grafana, and PostgreSQL.
  - **Audience:** Integration engineers, backend developers, DevOps.

- **[SAFETY_DESIGN.md](../architecture/SAFETY_DESIGN.md)**
  - **Purpose:** Multi-level safety framework (Level 0-3), human approval gate, and risk classification engine.
  - **Audience:** Security leads, compliance, core backend developers.

- **[OpsForge_Project_Specification.md](../architecture/OpsForge_Project_Specification.md)**
  - **Purpose:** Master technical specification outlining end-to-end platform design and requirements.
  - **Audience:** All team members.

---

### 3. API & Data Contracts (`docs/api/`)

- **[API_ENDPOINTS.md](../api/API_ENDPOINTS.md)**
  - **Purpose:** Complete REST API endpoint documentation, request/response Pydantic models, and HTTP error codes.
  - **Audience:** Backend & frontend developers, API integrators.

---

### 4. Planning & Hackathon Execution (`docs/planning/`)

- **[DEVELOPER_TASKS.md](DEVELOPER_TASKS.md)**
  - **Purpose:** Sequence-wise task assignments for the 3 core developers (Tejas, Samar, Vighnesh).
  - **Audience:** Whole team.

- **[IMPLEMENTATION_PHASES.md](IMPLEMENTATION_PHASES.md)**
  - **Purpose:** 10-phase long-term development roadmap and project milestones.
  - **Audience:** Tech leads, project managers.

- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)**
  - **Purpose:** High-level executive summary, problem statement, vision, elevator pitches, and core features.
  - **Audience:** Judges, stakeholders, team members.

- **[progress.md](progress.md)**
  - **Purpose:** Master execution log tracking project milestones and build verifications.
  - **Audience:** Whole team, tech leads.

- **[task_plan.md](task_plan.md)**
  - **Purpose:** Detailed task plan detailing implementation breakdown per developer phase.
  - **Audience:** Whole team.

- **[findings.md](findings.md)**
  - **Purpose:** Technical findings, architecture discoveries, and quality assurance resolutions.
  - **Audience:** Whole team.

- **[INDEX.md](INDEX.md)** — *(This Document)*
  - **Purpose:** Central document index and role-based reading guide.

---

### 5. Team Governance & Standards (`docs/governance/`)

- **[CODE_OF_CONDUCT.md](../governance/CODE_OF_CONDUCT.md)**
  - **Purpose:** Code of conduct, team rules, Git branching workflow, PR review standards, and environment security rules.
  - **Audience:** Whole team.

---

### 6. Developer Progress Logs (`docs/dev/`)

- **[tejas.md](../dev/tejas.md)** — Tejas Rawool (Project Lead & Backend & DevOps Lead)
- **[samar.md](../dev/samar.md)** — Samar (Frontend Lead)
- **[vighnesh.md](../dev/vighnesh.md)** — Vighnesh (Integration & QA Lead)

---

## 📖 Reading Paths by Role

### 👨‍💼 Project Lead & Backend & DevOps Lead (Tejas)
1. [README.md](../../README.md)
2. [DEVELOPER_TASKS.md](DEVELOPER_TASKS.md)
3. [ARCHITECTURE.md](../architecture/ARCHITECTURE.md)
4. [AGENT_CAPABILITIES.md](../architecture/AGENT_CAPABILITIES.md)
5. [tejas.md](../dev/tejas.md)

### 🎨 Frontend Lead (Samar)
1. [README.md](../../README.md)
2. [DEVELOPER_TASKS.md](DEVELOPER_TASKS.md)
3. [ARCHITECTURE.md](../architecture/ARCHITECTURE.md)
4. [samar.md](../dev/samar.md)

### 🔌 Integration & QA Lead (Vighnesh)
1. [README.md](../../README.md)
2. [DEVELOPER_TASKS.md](DEVELOPER_TASKS.md)
3. [API_ENDPOINTS.md](../api/API_ENDPOINTS.md)
4. [SAFETY_DESIGN.md](../architecture/SAFETY_DESIGN.md)
5. [vighnesh.md](../dev/vighnesh.md)

---

**Documentation Version:** 3.0  
**Last Updated:** August 28, 2026  
**Status:** Organized & Clean
