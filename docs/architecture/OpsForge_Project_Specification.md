# OpsForge — Autonomous AI Incident Response Engineer

> **Investigate. Diagnose. Fix. Safely.**

## 1. Project Overview

**OpsForge** is an AI-powered autonomous incident-response engineer designed to investigate production incidents, identify probable root causes, safely execute diagnostic code, and perform approved remediation actions.

The core idea is not to build another chatbot. OpsForge is an **action-oriented AI agent** whose job is to operate across real engineering systems.

A user can give OpsForge a task such as:

> “Checkout error rates have increased. Investigate the incident, identify the root cause, and recover the service if a deployment caused it.”

OpsForge can then:

1. Inspect observability data.
2. Query connected systems through MCP.
3. Inspect recent code/deployments.
4. Generate diagnostic scripts or queries.
5. Execute generated code inside a TrueForge sandbox.
6. Delegate specialized investigation to subagents.
7. Build a root-cause hypothesis.
8. Propose a remediation.
9. Pause before irreversible/high-risk actions.
10. Request human approval.
11. Execute the approved action.
12. Verify that the incident is improving.
13. Preserve the session and audit trail.

The project is specifically designed around the **TrueForge Agent Harness** because the harness is what turns an LLM from a response generator into a controlled operational agent.

---

# 2. Hackathon Context

This project is being built for **The Agent Harness Hackathon**, organized by WeMakeDevs in collaboration with TrueFoundry.

The hackathon's central idea is:

> Give AI models a license to act.

The challenge is explicitly about agents that can:

- reach real systems through tools/MCP,
- execute generated code safely,
- stop for human approval before irreversible actions,
- delegate work to subagents,
- maintain sessions through reconnects,
- work with different model providers,
- and use reusable skills.

TrueForge is the open-source agent harness used by the project.

The hackathon judges projects on:

1. Potential impact
2. Creativity and originality
3. Technical excellence
4. Use of TrueForge
5. Control and safety
6. Presentation

**Important:** OpsForge must use TrueForge as a central part of the product, not as a thin wrapper around an LLM.

---

# 3. Problem Statement

Modern production systems generate enormous amounts of operational information:

- application logs,
- infrastructure metrics,
- deployment history,
- Git commits,
- database activity,
- traces,
- alerts,
- configuration changes,
- service health signals.

When an incident occurs, engineers manually correlate these signals.

A typical incident-response process looks like:

```text
Alert
  ↓
Engineer opens monitoring dashboard
  ↓
Inspect logs
  ↓
Check recent deployments
  ↓
Inspect Git commits
  ↓
Run diagnostic queries/scripts
  ↓
Form root-cause hypothesis
  ↓
Test hypothesis
  ↓
Decide remediation
  ↓
Perform rollback/restart/configuration change
  ↓
Verify recovery
  ↓
Document incident
```

This is slow, repetitive, and cognitively expensive.

An LLM can help explain the data, but a normal chatbot cannot safely operate the environment.

OpsForge addresses this gap by combining:

```text
AI reasoning
+
Real operational tools
+
Safe execution
+
Human approval
+
Agent orchestration
+
Verification
```

---

# 4. Core Vision

## Vision

> Build an AI operations engineer that can investigate and resolve production incidents while remaining safe, observable, and human-controlled.

## Mission

Allow engineering teams to delegate operational investigation and controlled remediation to an AI agent without giving the AI unrestricted access to production.

## Design Principle

The agent should be:

**Autonomous during investigation.**

**Controlled during risky actions.**

That distinction is central to OpsForge.

---

# 5. What Makes OpsForge Different?

A normal AI application:

```text
User
 ↓
LLM
 ↓
Answer
```

OpsForge:

```text
User
 ↓
OpsForge Agent
 ↓
TrueForge Harness
 ├── MCP Tools
 ├── Sandbox
 ├── Human Approval
 ├── Subagents
 ├── Sessions
 └── Skills
 ↓
Real Engineering Systems
```

The important difference is that OpsForge can actually perform operational work.

---

# 6. Example Scenario

## Scenario: Checkout Service Incident

### Initial incident

Grafana reports:

```text
checkout-service error rate:
2% → 31%
```

The user asks:

> “Investigate the checkout incident and fix it if you can safely determine the cause.”

---

## Step 1 — Agent receives the task

OpsForge creates an incident session.

```text
Incident ID: INC-2026-001
Service: checkout-service
Severity: High
Status: Investigating
```

The agent begins reasoning about what evidence it needs.

---

## Step 2 — Inspect monitoring data

The agent uses an MCP-connected observability tool.

Example request:

```text
Get checkout-service error rate
for the last 60 minutes.
```

Result:

```text
Error rate:
10:00 → 2%
10:10 → 3%
10:20 → 4%
10:30 → 29%
10:40 → 31%
```

The agent identifies a sharp increase around 10:30.

---

## Step 3 — Inspect logs

The agent asks the logging system for errors around that timestamp.

Example findings:

```text
10:29:54 PaymentTimeoutException
10:30:01 PaymentTimeoutException
10:30:05 PaymentTimeoutException
...
```

The agent recognizes that payment timeouts increased at the same time as the incident.

---

## Step 4 — Inspect deployments

The agent queries deployment history.

```text
Recent deployments:

deploy-101
10:05
checkout-service
version 4.2.0

deploy-102
10:27
checkout-service
version 4.2.1
```

The timing suggests deploy-102 may be related.

---

## Step 5 — Inspect GitHub

Through GitHub MCP, OpsForge examines the relevant commit/PR.

It discovers:

```text
PR #8421
"Increase payment API timeout handling"
```

The agent now has a hypothesis:

> Deployment 102 introduced a change affecting payment timeout handling.

---

# 7. Safe Code Execution

The agent should not blindly execute generated code on production.

Instead, it can generate a diagnostic script.

Example:

```python
# Diagnostic script generated by the agent
# Analyze payment timeout frequency before and after deployment-102
```

TrueForge's sandbox executes this code in an isolated environment.

The sandbox returns:

```text
Before deploy-102:
Payment timeout rate: 1.8%

After deploy-102:
Payment timeout rate: 26.4%

Correlation: Strong
```

The agent updates its confidence.

---

# 8. Root Cause

OpsForge produces an investigation summary:

```text
Probable Root Cause
-------------------

Deployment: deploy-102
Version: 4.2.1

Evidence:
1. Error spike began within minutes of deployment.
2. PaymentTimeoutException increased sharply.
3. GitHub changes include payment timeout handling.
4. Sandbox analysis confirms the correlation.

Confidence: 91%
```

The agent does not immediately roll back.

---

# 9. Human Approval Gate

Rollback is potentially irreversible/high impact.

OpsForge pauses.

```text
┌─────────────────────────────────────────────┐
│             ACTION REQUIRES APPROVAL        │
├─────────────────────────────────────────────┤
│ Proposed action:                            │
│ Roll back checkout-service from 4.2.1       │
│ to 4.2.0                                    │
│                                             │
│ Reason:                                     │
│ Strong evidence that deployment 102 caused  │
│ the payment timeout spike.                  │
│                                             │
│ Risk: High                                  │
│                                             │
│ [ Reject ]                 [ Approve ]      │
└─────────────────────────────────────────────┘
```

The agent waits.

This is where **TrueForge's human approval capability** becomes a core part of the system.

---

# 10. Approved Action

The engineer clicks:

```text
APPROVE
```

OpsForge performs the rollback using the configured operational tool.

```text
Rollback started...
        ↓
Deployment 102 removed
        ↓
Version 4.2.0 restored
```

---

# 11. Verification

The agent does not stop after executing the action.

It checks:

```text
Error rate
Payment timeout rate
Service health
Latency
```

Example:

```text
Before rollback:
Error rate: 31%

5 minutes after rollback:
Error rate: 14%

10 minutes after rollback:
Error rate: 4%

15 minutes after rollback:
Error rate: 2.3%
```

OpsForge concludes:

```text
Incident Recovery Confirmed

Error rate recovered from 31% → 2.3%.

Rollback appears successful.

Incident status: Recovering
```

---

# 12. Complete Agent Loop

The entire workflow becomes:

```text
        INCIDENT
            ↓
        UNDERSTAND
            ↓
       COLLECT DATA
            ↓
     ┌──────┼───────┐
     ↓      ↓       ↓
   Logs   Metrics  GitHub
     │      │       │
     └──────┼───────┘
            ↓
      FORM HYPOTHESIS
            ↓
      GENERATE ANALYSIS
            ↓
      TRUEFORGE SANDBOX
            ↓
        TEST THEORY
            ↓
       ROOT CAUSE
            ↓
      PROPOSE REMEDIATION
            ↓
       RISK ASSESSMENT
            ↓
     ┌──────┴───────┐
     │              │
   Safe          Risky
     │              │
     │        HUMAN APPROVAL
     │              │
     │          ┌───┴───┐
     │        Reject  Approve
     │                  │
     └────────┬─────────┘
              ↓
        EXECUTE ACTION
              ↓
          VERIFY FIX
              ↓
        CLOSE INCIDENT
              ↓
        AUDIT SESSION
```

---

# 13. Technology Stack

## 13.1 Frontend

### Next.js

Used to build the OpsForge web application.

Responsibilities:

- agent chat/task interface,
- incident dashboard,
- execution timeline,
- approval interface,
- tool-call visualization,
- root-cause report,
- sandbox execution status,
- audit/session history.

### TypeScript

Used for frontend type safety.

### shadcn/ui

Used for operational UI components.

Potential components:

- buttons,
- cards,
- dialogs,
- badges,
- tabs,
- tables,
- timeline,
- alerts,
- approval dialogs.

---

# 14. Backend

## Python

Primary backend language.

Reasons:

- excellent AI/agent ecosystem,
- strong MCP ecosystem,
- FastAPI support,
- easy integration with APIs,
- good data-processing capabilities.

## FastAPI

Used as the application API layer.

Responsibilities:

```text
Frontend
   ↓
FastAPI
   ↓
OpsForge application services
   ↓
TrueForge
```

Potential endpoints:

```text
POST   /api/incidents
GET    /api/incidents/{id}
POST   /api/incidents/{id}/investigate
GET    /api/incidents/{id}/timeline
POST   /api/incidents/{id}/approve
POST   /api/incidents/{id}/reject
GET    /api/incidents/{id}/report
```

Exact endpoints may change during implementation.

---

# 15. AI Model

## Gemini API or Groq API

**We will NOT use OpenAI as the primary model provider.**

The initial implementation will use either:

- **Google Gemini API**, or
- **Groq API**

depending on latency, tool-calling reliability, pricing, and hackathon testing.

The architecture should keep the model provider configurable.

```text
                    OpsForge
                       │
                TrueForge Agent
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
        Gemini API           Groq API
```

The goal is to avoid tightly coupling the product to one provider.

TrueForge itself supports multiple model providers, which makes this architecture compatible with the hackathon's model-agnostic design.

---

# 16. TrueForge — Core Technology

TrueForge is the **most important technology in the project**.

It acts as the agent harness.

We will use TrueForge for the capabilities that make OpsForge an actual operational agent.

## TrueForge responsibilities

### Agent Runtime

Controls the agent execution loop.

```text
Task
 ↓
Reason
 ↓
Tool
 ↓
Observe
 ↓
Reason
 ↓
Action
```

### MCP Tool Access

Connects the agent to real systems.

### Sandbox

Runs generated code safely.

### Human Approval

Stops before sensitive operations.

### Subagents

Delegates specialized tasks.

### Sessions

Maintains ongoing agent execution.

### Skills

Provides reusable operational instructions.

---

# 17. MCP Architecture

MCP is the bridge between the agent and external tools.

Conceptually:

```text
                 TrueForge
                     │
             MCP Tool Layer
                     │
      ┌──────────────┼──────────────┐
      ▼              ▼              ▼
   GitHub          Grafana       PostgreSQL
      │              │              │
      ▼              ▼              ▼
Repositories       Metrics        Data
```

## Initial MCP integrations

We should prioritize:

### 1. GitHub MCP

Used for:

- repository inspection,
- commit history,
- pull requests,
- deployment-related code,
- issue investigation.

### 2. Observability / Grafana integration

Used for:

- metrics,
- dashboards,
- service health,
- latency,
- error rates.

### 3. PostgreSQL MCP

Used for:

- diagnostic queries,
- application data analysis,
- operational investigation.

Additional tools can be added if time permits.

---

# 18. Sandbox Architecture

Generated code must not automatically run with unrestricted access.

The execution model:

```text
Agent
 ↓
Generate code
 ↓
TrueForge Sandbox
 ↓
Isolated execution
 ↓
stdout / stderr / result
 ↓
Agent
```

Example generated task:

```text
Analyze the error logs and calculate
the frequency of timeout exceptions.
```

The agent generates Python.

The sandbox runs it.

The result is returned to the agent.

This allows OpsForge to perform dynamic analysis without giving generated code unrestricted access to the host environment.

---

# 19. Human-in-the-Loop Design

We classify actions into risk levels.

## Level 0 — Read

No approval.

Examples:

```text
Read metrics
Read logs
Read GitHub
Read database metadata
```

## Level 1 — Safe analysis

Normally no approval.

Examples:

```text
Run sandbox analysis
Generate SQL
Analyze deployment history
Run tests in isolated environment
```

## Level 2 — Potentially impactful

Approval may be required.

Examples:

```text
Create PR
Change configuration
Restart non-critical service
```

## Level 3 — High risk

Always require human approval.

Examples:

```text
Production rollback
Delete resource
Disable service
Modify production configuration
Restart critical service
```

---

# 20. Risk Engine

OpsForge should maintain an action classification layer.

Example:

```text
Action:
rollback deployment

Risk:
HIGH

Requires approval:
YES
```

Another example:

```text
Action:
read Grafana metric

Risk:
LOW

Requires approval:
NO
```

This gives the product a clear safety architecture.

---

# 21. Subagent Architecture

The main agent can delegate investigation tasks.

Example:

```text
                    Main Incident Agent
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
        Metrics Agent   Git Agent      Log Agent
             │              │              │
             ▼              ▼              ▼
         Grafana          GitHub          Logs
             │              │              │
             └──────────────┼──────────────┘
                            ▼
                    Main Agent
                            │
                            ▼
                     Root Cause
```

Possible specialized agents:

### Metrics Agent

Investigates:

- error rate,
- latency,
- traffic,
- saturation.

### Log Agent

Investigates:

- exceptions,
- stack traces,
- error frequency,
- timestamps.

### Git Agent

Investigates:

- recent commits,
- PRs,
- deployment changes.

### Database Agent

Investigates:

- slow queries,
- database errors,
- abnormal records.

### Remediation Agent

Prepares a safe remediation proposal.

The main agent remains responsible for final reasoning and approval.

---

# 22. PostgreSQL

PostgreSQL stores OpsForge application data.

Potential tables:

```text
users
incidents
incident_events
agent_sessions
tool_calls
approvals
actions
execution_results
incident_reports
```

Example:

```text
incidents
---------
id
title
service
severity
status
created_at
resolved_at
root_cause
confidence
```

---

# 23. Redis

Redis is optional for the first MVP but can be used for:

- temporary agent state,
- background jobs,
- event streaming,
- queues,
- caching.

If TrueForge already handles a required state mechanism, Redis should not be introduced unnecessarily.

The rule is:

> Do not add infrastructure just because it is available.

---

# 24. Docker

All application components should be containerized.

Conceptually:

```text
docker-compose
│
├── opsforge-frontend
├── opsforge-backend
├── postgres
└── redis
```

TrueForge may run according to its own supported deployment model rather than being forced into our application container.

---

# 25. Observability

OpsForge should itself be observable.

We can use:

- OpenTelemetry,
- logs,
- metrics,
- Grafana where useful.

Important agent metrics:

```text
agent_execution_time
tool_calls_count
sandbox_executions
approval_requests
approval_latency
successful_actions
failed_actions
incident_resolution_time
```

This creates a useful dogfooding story:

> We built an incident-response agent and use observability to observe the agent itself.

---

# 26. Frontend Screens

## 26.1 Overview Dashboard

Display:

```text
Active Incidents
Critical Incidents
Resolved Today
Average Resolution Time
Agent Actions
Pending Approvals
```

---

## 26.2 Incident List

Columns:

```text
Incident
Service
Severity
Status
Detected
Agent
Actions
```

---

## 26.3 Incident Investigation Page

Main screen:

```text
┌─────────────────────────────────────────────┐
│ INC-2026-001  Checkout Error Spike          │
│ HIGH        INVESTIGATING                   │
├─────────────────────────────────────────────┤
│                                             │
│ Agent Investigation                         │
│                                             │
│ ✓ Read Grafana metrics                      │
│ ✓ Analyzed logs                             │
│ ✓ Inspected deployment                      │
│ ✓ Analyzed GitHub commit                    │
│ ✓ Sandbox test completed                    │
│                                             │
│ Root Cause                                  │
│ Deployment 102 likely caused timeout spike. │
│ Confidence: 91%                             │
│                                             │
├─────────────────────────────────────────────┤
│ Proposed Action                             │
│ Rollback checkout-service to 4.2.0          │
│                                             │
│ ⚠ HUMAN APPROVAL REQUIRED                   │
│                                             │
│ [Reject]                       [Approve]     │
└─────────────────────────────────────────────┘
```

---

# 27. Agent Timeline

Every action should be visible.

Example:

```text
10:31:02  Incident received
10:31:04  Agent started investigation

10:31:07  MCP → Grafana
10:31:09  Metrics retrieved

10:31:13  MCP → Logs
10:31:17  1,482 errors found

10:31:20  MCP → GitHub
10:31:23  Deployment 102 identified

10:31:28  Sandbox execution started
10:31:31  Analysis completed

10:31:35  Root cause confidence: 91%

10:31:40  Rollback proposed

10:31:40  ⏸ Waiting for approval

10:32:12  Human approved

10:32:15  Rollback started
10:32:40  Rollback completed

10:33:10  Verification started
10:35:10  Error rate recovered

10:35:15  Incident resolved
```

This timeline will be extremely useful during the demo.

---

# 28. Approval UI

The approval screen should clearly communicate:

### What will happen?

```text
Rollback deployment-102
```

### Why?

```text
Strong evidence indicates deployment-102
caused the incident.
```

### Evidence

```text
Error spike: +29%
Timeout increase: +1,360%
Deployment correlation: Strong
Sandbox validation: Passed
```

### Risk

```text
HIGH
```

### Action

```text
[ Reject ] [ Approve ]
```

Never hide the action behind generic wording such as "Continue".

The user should understand exactly what the agent wants to do.

---

# 29. Incident Report

After resolution:

```text
Incident: INC-2026-001

Service:
checkout-service

Severity:
HIGH

Duration:
14 minutes

Root Cause:
Deployment 102 introduced a payment timeout issue.

Evidence:
- Error rate increased immediately after deployment.
- Logs showed payment timeout exceptions.
- GitHub showed relevant timeout changes.
- Sandbox analysis confirmed correlation.

Action:
Deployment 102 rolled back.

Approval:
Approved by human operator.

Verification:
Error rate returned to normal.

Status:
RESOLVED
```

---

# 30. Agent State Machine

A simple conceptual state machine:

```text
CREATED
   ↓
INVESTIGATING
   ↓
COLLECTING_EVIDENCE
   ↓
ANALYZING
   ↓
ROOT_CAUSE_FOUND
   ↓
PROPOSING_ACTION
   ↓
┌───────────────────────┐
│                       │
▼                       ▼
SAFE_ACTION          APPROVAL_REQUIRED
│                       │
│                  ┌────┴────┐
│                  ▼         ▼
│               APPROVED   REJECTED
│                  │         │
└──────────────────┘         │
           │                 │
           ▼                 ▼
        EXECUTING         STOPPED
           │
           ▼
       VERIFYING
           │
           ▼
        RESOLVED
```

---

# 31. Failure Handling

Agents fail.

OpsForge should assume failure is normal.

Possible failures:

### MCP unavailable

```text
Grafana unavailable
```

Agent should:

- report failure,
- retry if appropriate,
- use another evidence source,
- avoid making unsupported claims.

### Sandbox failure

```text
Generated script failed
```

Agent can:

- inspect error,
- modify script,
- retry,
- stop after a safe retry limit.

### Low confidence

```text
Root cause confidence: 42%
```

Agent should **not** perform remediation.

Instead:

```text
Insufficient evidence.

Human investigation required.
```

### Approval rejected

Agent stops the risky action and records the decision.

---

# 32. Safety Principles

## Principle 1 — Least privilege

The agent should only receive the tools it needs.

## Principle 2 — Read before write

Investigation should generally be read-only.

## Principle 3 — Sandbox generated code

Do not directly execute arbitrary generated code on production infrastructure.

## Principle 4 — Approval for irreversible actions

The agent should pause before dangerous operations.

## Principle 5 — Explain actions

Every action should have:

```text
What?
Why?
Evidence?
Risk?
```

## Principle 6 — Verify after action

Never assume an operation succeeded.

---

# 33. Example Scenario 2 — Database Incident

User:

> “The checkout database is slow. Investigate.”

Agent:

```text
Query database metrics
        ↓
Find slow queries
        ↓
Inspect query plans
        ↓
Analyze recent schema changes
        ↓
Generate optimization query
        ↓
Test in sandbox/staging context
        ↓
Recommend index
        ↓
Human approval
        ↓
Create index
        ↓
Verify query latency
```

---

# 34. Example Scenario 3 — Bad Deployment

User:

> “Investigate why the API started returning 500s after today's deployment.”

Agent:

```text
Alert
 ↓
Metrics
 ↓
Logs
 ↓
Deployment history
 ↓
GitHub PR
 ↓
Sandbox reproduction
 ↓
Root cause
 ↓
Rollback proposal
 ↓
Human approval
 ↓
Rollback
 ↓
Verify
```

---

# 35. Example Scenario 4 — No Action Required

User:

> “Investigate the increased latency.”

Agent discovers:

```text
Latency increased
BUT

No deployment correlation
No error increase
Traffic increased 3.2x
Infrastructure capacity is saturated
```

Instead of doing something dangerous, it says:

```text
No safe automated remediation identified.

Likely cause:
Traffic-driven capacity saturation.

Recommendation:
Scale service capacity.

Approval required before infrastructure change.
```

This is important.

**A good autonomous agent must know when NOT to act.**

---

# 36. Example Scenario 5 — Wrong Hypothesis

Agent initially suspects:

```text
Deployment 102
```

It runs sandbox analysis.

Result:

```text
No statistically meaningful relationship.
```

The agent changes direction.

It checks:

```text
Database latency
```

and finds:

```text
Database response time:
80ms → 1,200ms
```

It then identifies a database bottleneck.

This demonstrates that the agent is performing an actual investigation rather than following a fixed scripted workflow.

---

# 37. Why TrueForge Is Central

OpsForge should demonstrate TrueForge features directly.

| TrueForge capability | OpsForge usage |
|---|---|
| Agent runtime | Incident investigation loop |
| MCP | GitHub/Grafana/PostgreSQL |
| Sandbox | Diagnostic code execution |
| Human approval | Production remediation |
| Subagents | Parallel investigation |
| Sessions | Long-running incidents |
| Skills | Reusable incident-response procedures |
| Model flexibility | Gemini/Groq integration |

The goal is that removing TrueForge would significantly reduce OpsForge's capabilities.

That is how we demonstrate genuine harness usage.

---

# 38. Why Gemini/Groq Instead of OpenAI

The product should not be dependent on OpenAI.

We will initially evaluate:

## Gemini

Strengths to evaluate:

- tool calling,
- context handling,
- reasoning quality,
- API reliability.

## Groq

Strengths to evaluate:

- low latency,
- fast inference,
- rapid agent loops.

The final provider can be selected after testing.

The application should expose a model configuration layer:

```text
MODEL_PROVIDER=gemini
MODEL_NAME=<configured-model>
```

or:

```text
MODEL_PROVIDER=groq
MODEL_NAME=<configured-model>
```

The exact model name should be chosen based on current availability and TrueForge compatibility during implementation.

---

# 39. Repository Structure

Proposed structure:

```text
opsforge/
│
├── apps/
│   ├── web/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── lib/
│   │   └── types/
│   │
│   └── api/
│       ├── app/
│       │   ├── api/
│       │   ├── core/
│       │   ├── models/
│       │   ├── schemas/
│       │   ├── services/
│       │   └── main.py
│       └── tests/
│
├── agents/
│   ├── incident_agent/
│   ├── subagents/
│   │   ├── metrics_agent/
│   │   ├── log_agent/
│   │   ├── git_agent/
│   │   └── database_agent/
│   ├── skills/
│   ├── prompts/
│   └── policies/
│
├── integrations/
│   ├── mcp/
│   │   ├── github/
│   │   ├── grafana/
│   │   └── postgres/
│   └── model_providers/
│       ├── gemini/
│       └── groq/
│
├── sandbox/
│   ├── scripts/
│   └── tests/
│
├── database/
│   ├── migrations/
│   └── seeds/
│
├── infrastructure/
│   ├── docker/
│   └── compose/
│
├── docs/
│   ├── architecture/
│   ├── scenarios/
│   ├── api/
│   └── demo/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── agent/
│   └── safety/
│
├── .env.example
├── docker-compose.yml
├── README.md
└── LICENSE
```

The exact structure can evolve as the implementation becomes clearer.

---

# 40. Development Phases

## Phase 1 — TrueForge Exploration

Goal:

```text
Run a basic TrueForge agent
        ↓
Connect one tool
        ↓
Execute one task
```

Deliverable:

Working minimal agent.

---

## Phase 2 — MCP Integration

Connect:

```text
GitHub
Grafana/observability
PostgreSQL
```

Deliverable:

Agent can gather real evidence.

---

## Phase 3 — Sandbox

Agent generates a diagnostic script.

TrueForge executes it safely.

Deliverable:

Agent can perform dynamic analysis.

---

## Phase 4 — Incident Workflow

Implement:

```text
Incident
 ↓
Investigation
 ↓
Evidence
 ↓
Root Cause
```

Deliverable:

Complete investigation loop.

---

## Phase 5 — Approval System

Implement:

```text
Risky Action
 ↓
Pause
 ↓
Human Approval
 ↓
Execute
```

Deliverable:

Safe remediation.

---

## Phase 6 — Verification

After remediation:

```text
Action
 ↓
Observe
 ↓
Compare
 ↓
Confirm recovery
```

Deliverable:

Closed-loop agent.

---

## Phase 7 — Subagents

Add specialized investigators.

Deliverable:

Parallel investigation.

---

## Phase 8 — UI

Build polished dashboard.

Deliverable:

Demo-ready product.

---

## Phase 9 — Safety Testing

Test:

- tool failure,
- sandbox failure,
- wrong hypothesis,
- low confidence,
- approval rejection,
- destructive action,
- timeout,
- reconnect,
- partial data.

Deliverable:

Reliable agent.

---

## Phase 10 — Demo

Prepare one compelling incident scenario.

The demo should show:

```text
Alert
 ↓
Agent investigates
 ↓
Real tool calls
 ↓
Sandbox execution
 ↓
Root cause
 ↓
Approval request
 ↓
Human approves
 ↓
Remediation
 ↓
Verification
 ↓
Resolution
```

---

# 41. MVP Definition

Do NOT attempt to build an entire enterprise AIOps platform.

The MVP should prove one complete loop.

### MVP:

```text
1 service
+
1 incident type
+
GitHub
+
1 observability source
+
TrueForge sandbox
+
Human approval
+
1 remediation action
+
Verification
```

For example:

> **Detect → investigate → identify bad deployment → sandbox validate → approve rollback → rollback → verify recovery.**

That is enough for a powerful hackathon demo.

---

# 42. Stretch Goals

If the MVP works early, add:

### Multi-agent investigation

```text
Metrics Agent
Log Agent
Git Agent
```

### More remediation actions

```text
Rollback
Restart
Scale
Configuration change
```

### Incident memory

Learn from previous incidents.

### Automated incident report

Generate postmortem.

### Slack integration

Allow:

```text
@OpsForge investigate checkout incident
```

### Natural-language operational commands

```text
“Why is API latency high?”
```

### Cost/risk estimation

Before an action:

```text
Risk: HIGH
Expected downtime: <2 min
Rollback available: YES
Confidence: 91%
```

---

# 43. Security Model

Never put production secrets into prompts.

Use:

```text
Environment secrets
Secret manager
Scoped credentials
MCP authentication
```

The agent should receive capabilities, not unrestricted credentials.

Bad:

```text
Agent has root credentials.
```

Better:

```text
Agent
 ↓
MCP tool
 ↓
Scoped operation
```

---

# 44. Demo Strategy

The demo should not start by explaining the architecture.

Start with the problem.

Example:

> “Our checkout service is failing. Instead of calling an engineer immediately, we're giving the incident to OpsForge.”

Then show the agent.

```text
31% error rate
```

Agent begins investigating.

Show real tool calls.

Then:

```text
Root cause confidence: 91%
```

Then:

```text
⚠ Rollback requires approval.
```

Click:

```text
APPROVE
```

Then show recovery:

```text
31% → 14% → 4% → 2%
```

Finally:

> “OpsForge didn't just tell us what happened. It investigated, tested its hypothesis, asked for permission before the dangerous action, executed the remediation, and verified the recovery.”

That is the story we want judges to remember.

---

# 45. What We Are NOT Building

OpsForge is NOT:

- a generic chatbot,
- a simple RAG application,
- a static dashboard,
- a monitoring dashboard,
- an LLM wrapper,
- a fully autonomous unrestricted production bot,
- a replacement for engineers.

It is:

> **A controlled autonomous incident-response agent.**

---

# 46. Key Product Principles

### Autonomous investigation

The agent should gather evidence without requiring humans to manually guide every step.

### Controlled execution

Generated code runs through the sandbox.

### Human authority

Humans remain the final authority for high-risk actions.

### Evidence-driven decisions

The agent should explain why it believes something is wrong.

### Closed-loop operation

The agent should verify whether its action actually solved the problem.

### Auditable actions

Every important decision should be recorded.

---

# 47. Team Explanation — 30 Second Version

If someone asks:

> “What is OpsForge?”

Say:

> **“OpsForge is an AI incident-response engineer built on the TrueForge agent harness. You give it a production incident, and it investigates the problem by connecting to real tools through MCP, analyzes data and runs diagnostic code safely in a sandbox, and identifies the probable root cause. If it needs to perform a risky action like rolling back a deployment, TrueForge pauses the agent and asks a human for approval. Once approved, the agent executes the action and verifies that the system recovered.”**

---

# 48. Team Explanation — 1 Minute Version

> **“The problem we're solving is that production incident response requires engineers to manually correlate logs, metrics, deployments, GitHub changes, and database information. OpsForge turns that workflow into a controlled AI agent. The agent uses TrueForge as its harness, so it can access real systems through MCP, execute generated diagnostic code inside a sandbox, delegate investigation to subagents, and maintain the incident session. It can investigate autonomously, but it cannot perform high-risk actions without human approval. For example, if checkout errors spike after a deployment, OpsForge can inspect Grafana, logs, and GitHub, reproduce the issue in the sandbox, identify the deployment as the likely cause, request approval for a rollback, execute it after approval, and verify that the error rate returns to normal. So the key idea is not just AI that tells you what to do; it's AI that can safely do the operational work.”**

---

# 49. One-Line Architecture Explanation

> **“Next.js provides the operational UI, FastAPI provides the application API, TrueForge runs the agent, MCP connects it to real systems, the TrueForge sandbox safely executes generated code, Gemini or Groq provides the model intelligence, PostgreSQL stores application/audit data, and human approval gates control risky production actions.”**

---

# 50. Final Technology Summary

```text
Frontend
    Next.js
    TypeScript
    shadcn/ui

Backend
    Python
    FastAPI

Agent Harness
    TrueForge

AI Model
    Gemini API / Groq API

Tool Protocol
    MCP

External Tools
    GitHub
    Grafana / Observability
    PostgreSQL

Safe Execution
    TrueForge Sandbox

Agent Architecture
    Main Agent
    Specialized Subagents
    Skills
    Risk Policies

Database
    PostgreSQL

Optional Infrastructure
    Redis

Deployment
    Docker
    Cloud/VPS

Observability
    OpenTelemetry
    Grafana
```

---

# 51. Final Product Definition

## OpsForge

**Autonomous AI Incident Response Engineer**

### Input

```text
Production incident / operational task
```

### Processing

```text
Understand
→ Investigate
→ Gather evidence
→ Analyze
→ Test
→ Diagnose
→ Assess risk
```

### Action

```text
Safe → Execute
Risky → Ask human → Execute if approved
```

### Output

```text
Root cause
+
Evidence
+
Action taken
+
Verification
+
Audit trail
```

### Core differentiator

> **OpsForge gives an AI agent the ability to act on real engineering systems without giving it unrestricted control.**

That is the central product idea.
