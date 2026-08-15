# Architecture Overview

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend Layer                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Next.js + TypeScript + shadcn/ui                   │   │
│  │  - Incident Dashboard                              │   │
│  │  - Chat Interface                                  │   │
│  │  - Approval Dialogs                                │   │
│  │  - Timeline Visualization                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  FastAPI                                            │   │
│  │  - /api/incidents                                  │   │
│  │  - /api/investigations                             │   │
│  │  - /api/approvals                                  │   │
│  │  - /api/tools                                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                   Agent Layer (TrueForge)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Main Incident Agent                                │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │ Investigation Loop                           │   │   │
│  │  │ - Understand                                 │   │   │
│  │  │ - Collect Evidence                           │   │   │
│  │  │ - Analyze                                    │   │   │
│  │  │ - Form Hypothesis                            │   │   │
│  │  │ - Test Theory                                │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │                      ↕                               │   │
│  │  Subagents (Parallel)                               │   │
│  │  ┌─────────────┬─────────────┬──────────────┐       │   │
│  │  │ Metrics Agnt│ Log Agent   │ Git Agent    │       │   │
│  │  └─────────────┴─────────────┴──────────────┘       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│               Integration Layer (MCP + Model)               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Tool Orchestration                                 │   │
│  │  ┌──────────────┬──────────────┬──────────────┐     │   │
│  │  │ GitHub MCP   │ Grafana MCP  │ PostgreSQL   │     │   │
│  │  │              │              │ MCP          │     │   │
│  │  └──────────────┴──────────────┴──────────────┘     │   │
│  │  TrueForge Sandbox                                  │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │ Safe Code Execution                          │   │   │
│  │  │ (Diagnostic scripts, analysis)               │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │  AI Model Bridge                                    │   │
│  │  ┌──────────────┬──────────────┐                    │   │
│  │  │ Gemini API   │ Groq API     │                    │   │
│  │  └──────────────┴──────────────┘                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                  External Systems                           │
│  ┌──────────────┬──────────────┬─────────────────────────┐  │
│  │   GitHub     │    Grafana   │   PostgreSQL            │  │
│  │              │              │   (prod systems)        │  │
│  └──────────────┴──────────────┴─────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

### 1. Frontend (Next.js)

**Technology Stack:**
- Framework: Next.js
- Language: TypeScript
- UI Components: shadcn/ui

**Responsibilities:**
- Incident dashboard display
- Agent chat interface
- Real-time timeline visualization
- Approval request dialogs
- Tool execution visualization
- Investigation results display
- Root cause report rendering
- Session history and audit trails

**Key Screens:**
- Incident list view
- Incident detail / investigation view
- Approval gates
- Timeline view
- Report generation

### 2. API Gateway (FastAPI)

**Technology:**
- Framework: FastAPI (Python)
- Authentication: TBD
- Versioning: API v1

**Responsibilities:**
- Expose REST endpoints
- Route requests to services
- Request validation
- Response serialization
- Error handling
- Logging and monitoring

**Endpoint Categories:**
```
POST   /api/incidents                    # Create incident
GET    /api/incidents                    # List incidents
GET    /api/incidents/{id}               # Get incident details
POST   /api/incidents/{id}/investigate   # Start investigation
GET    /api/incidents/{id}/timeline      # Get execution timeline
POST   /api/incidents/{id}/approve       # Approve action
POST   /api/incidents/{id}/reject        # Reject action
GET    /api/incidents/{id}/report        # Get incident report
GET    /api/tools                        # List available tools
GET    /api/sessions/{id}                # Get session details
```

### 3. Agent Layer (TrueForge)

**Core Framework:** TrueForge Agent Harness

**Main Components:**

#### Incident Agent
- Primary decision-making loop
- Orchestrates investigation
- Manages subagent coordination
- Proposes actions
- Enforces safety policies

#### Investigation Loop
```
Input: Incident Description
  ↓
Understand: What's the problem?
  ↓
Collect Evidence: Query tools
  ↓
Analyze: Process results
  ↓
Form Hypothesis: What caused this?
  ↓
Test Theory: Sandbox analysis
  ↓
Root Cause: Confident determination
  ↓
Propose Action: What should we do?
  ↓
Risk Assessment: How risky?
  ↓
Approval Gate: If high-risk, pause
  ↓
Execute: Perform action
  ↓
Verify: Did it work?
  ↓
Output: Incident report
```

#### Subagents
- **Metrics Agent** — Analyzes Grafana metrics, error rates, latency
- **Log Agent** — Parses logs, identifies exceptions, correlates errors
- **Git Agent** — Inspects commits, PRs, deployment history
- **Database Agent** — Queries database, analyzes slow queries (optional)

**Coordination:**
- Main agent delegates specialized tasks
- Subagents operate in parallel
- Main agent waits for subagent results
- Central agent synthesizes findings

#### Skills
Reusable operational procedures:
- Investigate error rate spike
- Analyze deployment impact
- Identify timeout issues
- Database performance diagnosis
- Configuration change analysis

### 4. Integration Layer

#### MCP (Model Context Protocol)

**Purpose:** Bridge between agent and external tools

**Architecture:**
```
Agent ↔ MCP Layer ↔ Tool Implementations ↔ External Systems
```

**MCP Implementations:**

##### GitHub MCP
```
Functions:
- get_repository_info(owner, repo)
- get_recent_commits(owner, repo, limit)
- get_pull_request(owner, repo, pr_number)
- search_commits(query)
- get_deployment_history(repo)
```

##### Grafana/Observability MCP
```
Functions:
- query_metrics(query, time_range)
- get_dashboard(name)
- query_logs(filter, time_range)
- get_alert_history(service)
- compare_metrics(before, after)
```

##### PostgreSQL MCP
```
Functions:
- execute_query(sql)
- get_table_schema(table)
- get_slow_queries()
- analyze_data(table, analysis_type)
```

#### TrueForge Sandbox

**Purpose:** Safe execution of generated diagnostic code

**Architecture:**
```
Agent generates code
        ↓
Submit to TrueForge Sandbox
        ↓
Isolated execution environment
        ↓
Return stdout/stderr/results
        ↓
Agent processes results
```

**Capabilities:**
- Execute Python scripts
- Query databases
- Parse logs
- Analyze metrics
- Test hypotheses
- Generate reports

**Constraints:**
- Read-only access to most systems
- Limited write permissions
- Timeout enforcement
- Resource limits
- No direct network access outside MCP

#### AI Model Bridge

**Supported Providers:**
- Google Gemini API
- Groq API
- Other providers via configuration

**Model Responsibilities:**
- Reasoning about evidence
- Hypothesis formation
- Tool calling decisions
- Risk assessment
- Explanation generation

**Architecture:**
```
Agent ↔ TrueForge ↔ Model Provider API
                        ↓
                   LLM Inference
                        ↓
                   Tool Calls + Reasoning
```

### 5. Data Layer

#### PostgreSQL

**Primary Database**

**Tables:**
```
users
├── id (PK)
├── username
├── email
├── role
├── created_at

incidents
├── id (PK)
├── title
├── service
├── severity
├── status
├── created_at
├── resolved_at
├── root_cause
├── confidence

incident_events
├── id (PK)
├── incident_id (FK)
├── timestamp
├── event_type
├── description
├── tool_called
├── result

agent_sessions
├── id (PK)
├── incident_id (FK)
├── agent_type
├── started_at
├── ended_at
├── status

tool_calls
├── id (PK)
├── session_id (FK)
├── tool_name
├── input
├── output
├── duration
├── timestamp

approvals
├── id (PK)
├── incident_id (FK)
├── action_proposed
├── risk_level
├── requested_at
├── approved_at
├── approved_by
├── approval_reason

incident_reports
├── id (PK)
├── incident_id (FK)
├── root_cause_summary
├── evidence_list
├── remediation_taken
├── verification_results
├── generated_at
```

#### Redis (Optional)

**Use Cases:**
- Temporary agent state
- Background job queue
- Event streaming
- Caching MCP results
- Rate limiting

## Data Flow

### Incident Investigation Flow

```
1. User submits incident
         ↓
2. FastAPI creates incident record
         ↓
3. TrueForge agent receives task
         ↓
4. Agent queries MCP tools (parallel)
   ├── GitHub (recent deployments)
   ├── Grafana (metrics timeline)
   └── PostgreSQL (application data)
         ↓
5. Agent delegates to subagents
   ├── Metrics Agent → Analyze error trend
   ├── Log Agent → Find exceptions
   └── Git Agent → Identify code changes
         ↓
6. Agent synthesizes evidence
         ↓
7. Agent generates hypothesis
         ↓
8. Agent creates diagnostic script
         ↓
9. TrueForge Sandbox executes script
         ↓
10. Agent forms root cause conclusion
         ↓
11. Agent proposes remediation action
         ↓
12. Risk assessment determines if approval needed
         ↓
13. If high-risk:
    ├── FastAPI notifies frontend
    ├── Frontend shows approval dialog
    ├── User approves/rejects
    └── FastAPI receives decision
         ↓
14. Agent executes approved action
         ↓
15. Agent verifies results
         ↓
16. FastAPI updates incident status
         ↓
17. Frontend displays completed report
```

### Approval Gate Flow

```
Agent proposes high-risk action
        ↓
FastAPI receives approval request
        ↓
Frontend displays:
├── What will happen?
├── Why this action?
├── Evidence supporting it
├── Risk assessment
└── Approval buttons
        ↓
User reviews and decides
        ↓
Frontend submits decision
        ↓
FastAPI processes
        ↓
Agent receives: APPROVED or REJECTED
        ↓
If APPROVED:
├── Execute action via MCP tool
├── Monitor execution
├── Collect results
└── Verify outcome
        ↓
If REJECTED:
├── Stop action
├── Document decision
└── Suggest alternatives
```

## Technology Stack Summary

| Layer | Component | Technology |
|-------|-----------|-----------|
| **Frontend** | Web UI | Next.js + TypeScript + shadcn/ui |
| **API** | Gateway | FastAPI (Python) |
| **Agent** | Runtime | TrueForge |
| **Tool Bridge** | Protocol | MCP (Model Context Protocol) |
| **Execution** | Sandbox | TrueForge Sandbox |
| **AI** | Model | Gemini API / Groq API |
| **Database** | Primary | PostgreSQL |
| **Cache** | Optional | Redis |
| **Container** | Orchestration | Docker + Docker Compose |

## Deployment Model

```
docker-compose.yml
├── opsforge-frontend
│   └── Next.js application
├── opsforge-api
│   └── FastAPI backend
├── postgres
│   └── PostgreSQL database
├── redis
│   └── Redis cache (optional)
└── trueforge
    └── Agent harness (TBD deployment)
```

## Configuration & Environment

**Environment Variables:**
```bash
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000

# Backend
DATABASE_URL=postgresql://user:pass@postgres/opsforge
REDIS_URL=redis://redis:6379
LOG_LEVEL=info

# Model Provider
MODEL_PROVIDER=gemini
MODEL_NAME=gemini-2.0
MODEL_API_KEY=<key>

# MCP Tools
GITHUB_TOKEN=<token>
GRAFANA_URL=https://monitoring.example.com
GRAFANA_API_KEY=<key>
GRAFANA_ORG_ID=1

# TrueForge
TRUEFORGE_API_URL=https://api.trueforge.ai
TRUEFORGE_API_KEY=<key>

# Security
JWT_SECRET=<random-secret>
SANDBOX_TIMEOUT_SECONDS=30
```

---

**Version:** 1.0  
**Last Updated:** 2026-08-16
