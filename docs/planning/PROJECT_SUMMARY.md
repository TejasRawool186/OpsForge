# Project Summary

## Executive Summary

**OpsForge** is an AI-powered autonomous incident-response engineer designed to investigate production incidents, identify root causes, execute diagnostic code safely, and perform approved remediation actions. Built on the TrueForge agent harness, OpsForge bridges the gap between AI reasoning and real operational control.

## Problem Statement

Modern production systems generate enormous operational data:
- Application logs
- Infrastructure metrics
- Deployment history
- Git commits
- Database activity
- Traces and alerts

When incidents occur, engineers must manually correlate these signals—a slow, repetitive, and cognitively expensive process.

**Solution:** An AI incident-response agent that can autonomously investigate, safely execute diagnostic code, propose actions, wait for human approval on high-risk operations, execute remediation, and verify recovery.

## Core Value Proposition

```text
AI Reasoning + Real Tools + Safe Execution + Human Control + Verified Outcomes
```

## Vision, Mission, and Design Principle

### Vision
> Build an AI operations engineer that can investigate and resolve production incidents while remaining safe, observable, and human-controlled.

### Mission
Allow engineering teams to delegate operational investigation and controlled remediation to an AI agent without giving the AI unrestricted access to production.

### Design Principle
> The agent should be **autonomous during investigation** and **controlled during risky actions**.

## What Makes OpsForge Different

### Traditional AI Application
```
User → LLM → Answer
```

### OpsForge
```
User → OpsForge Agent → TrueForge Harness
                            ├── MCP Tools
                            ├── Sandbox
                            ├── Human Approval
                            ├── Subagents
                            ├── Sessions
                            └── Skills
                                    ↓
                            Real Engineering Systems
```

The difference: **OpsForge actually performs operational work**, not just providing advice.

## Example Scenario: Checkout Service Incident

**Alert:** Checkout service error rate: 2% → 31%

**User:** "Investigate the checkout incident and fix it if you can safely determine the cause."

### Agent Steps

1. **Understand** — Create incident session
2. **Collect Evidence** — Query Grafana for error rate timeline
3. **Correlate Signals** — Check logs for PaymentTimeoutException
4. **Inspect Deployments** — Find recent deployment-102 at 10:27
5. **Check Code** — Query GitHub for changes in payment timeout handling
6. **Test Hypothesis** — Generate diagnostic script, run in sandbox
7. **Analyze Results** — Confirm 26.4% timeout rate after deployment
8. **Form Conclusion** — 91% confidence in root cause
9. **Propose Action** — Recommend rollback to version 4.2.0
10. **Request Approval** — Pause and wait for human approval
11. **Execute** — Perform rollback after approval
12. **Verify** — Monitor error rate recovery (31% → 2.3%)
13. **Report** — Document incident with full audit trail

## Key Capabilities

### 1. Autonomous Investigation
- Gathers evidence without manual guidance
- Correlates data from multiple sources
- Forms hypotheses and tests them

### 2. Safe Code Execution
- Generates diagnostic scripts
- Executes in isolated sandbox
- No direct access to production systems

### 3. Human-in-the-Loop
- Autonomous investigation by default
- Requires approval for risky actions
- Human remains the final authority

### 4. Multi-Source Integration
- **GitHub** — Recent code changes, deployment history
- **Grafana/Observability** — Metrics, error rates, latency
- **PostgreSQL** — Application data analysis
- Additional tools via MCP protocol

### 5. Subagent Delegation
- Specialized agents for metrics, logs, git, database
- Parallel investigation
- Central agent coordinates findings

### 6. Session Persistence
- Maintains incident context
- Allows reconnection
- Enables long-running investigations

### 7. Verification Loop
- Does not assume actions succeed
- Verifies metrics after remediation
- Confirms problem resolution

## Safety Model

### Risk Classification

| Level | Category | Approval | Examples |
|-------|----------|----------|----------|
| 0 | Read | None | Read metrics, logs, code |
| 1 | Safe Analysis | Usually None | Sandbox scripts, queries |
| 2 | Potentially Impactful | May be needed | Config changes, service restart |
| 3 | High Risk | Always Required | Rollback, delete, disable, prod changes |

### Safety Principles

1. **Least Privilege** — Agent only gets needed tools
2. **Read Before Write** — Investigation is generally read-only
3. **Sandbox Generated Code** — No direct execution on production
4. **Approval for Risky Actions** — Agent pauses before dangerous operations
5. **Explain Actions** — Every action includes What/Why/Evidence/Risk
6. **Verify After Action** — Never assume operations succeeded

## Hackathon Context

**Hackathon:** The Agent Harness Hackathon (WeMakeDevs × TrueFoundry)

**Challenge:** Give AI models a license to act safely and controllably.

**Judging Criteria:**
1. Potential impact
2. Creativity and originality
3. Technical excellence
4. Use of TrueForge
5. Control and safety
6. Presentation

**Requirement:** OpsForge must use TrueForge as a central part of the product, not as a thin wrapper.

## Technology Stack

### Frontend
- **Next.js** — Web application framework
- **TypeScript** — Type safety
- **shadcn/ui** — UI components

### Backend
- **Python** — Primary language
- **FastAPI** — API framework
- **PostgreSQL** — Application and audit data

### Agent & Integration
- **TrueForge** — Agent harness (core technology)
- **MCP** — Model Context Protocol for tool integration
- **Gemini API / Groq API** — AI model provider

### Execution & Safety
- **TrueForge Sandbox** — Safe code execution

### Infrastructure
- **Docker/Compose** — Containerization
- **Redis** — Optional state/caching

## MVP Scope

Focus on one complete incident loop:

✓ 1 service  
✓ 1 incident type  
✓ GitHub integration  
✓ 1 observability source  
✓ TrueForge sandbox  
✓ Human approval  
✓ 1 remediation action (rollback)  
✓ Verification  

**Concrete Example:**
> Detect → investigate → identify bad deployment → sandbox validate → approve rollback → rollback → verify recovery

## Stretch Goals

If MVP completes early:
- Multi-agent investigation (parallel agents)
- Additional remediation actions (restart, scale, config)
- Incident memory and learning
- Automated postmortem generation
- Slack integration
- Natural-language operational commands
- Cost/risk estimation

## Demo Story

**Opening:** "Our checkout service is failing. Instead of calling an engineer, we're giving the incident to OpsForge."

**Show:**
1. 31% error rate alert
2. Agent investigating in real time
3. Tool calls to Grafana, GitHub
4. Sandbox analysis executing
5. Root cause identified (91% confidence)
6. Rollback proposal requires approval
7. Human approves
8. Rollback executes
9. Error rate recovers: 31% → 14% → 4% → 2%

**Closing:** "OpsForge didn't just tell us what happened. It investigated, tested its hypothesis, asked for permission, executed the remediation, and verified recovery."

## What OpsForge Is NOT

- A generic chatbot
- A simple RAG application
- A static dashboard
- An LLM wrapper
- A fully autonomous unrestricted bot
- A replacement for engineers

## Success Metrics

### For Investigation
- Average time to identify root cause
- Accuracy of identified causes
- Evidence quality and thoroughness

### For Remediation
- Approval rate for proposed actions
- Remediation success rate
- Mean time to recovery

### For Safety
- False positive rate (incorrect causes)
- Approved action success rate
- Zero unauthorized production changes

### For Operations
- Incident resolution time
- System uptime improvement
- Engineer cognitive load reduction

## Team Elevator Pitch (30 seconds)

> OpsForge is an AI incident-response engineer built on TrueForge. You give it a production incident, and it investigates by connecting to real tools through MCP, analyzes data and runs diagnostic code safely in a sandbox, identifies the probable root cause, and if it needs to perform risky actions like rolling back, TrueForge pauses and asks a human for approval. Once approved, the agent executes and verifies recovery.

## Repository Structure

```
opsforge/
├── apps/web/              # Next.js frontend
├── apps/api/              # FastAPI backend
├── agents/                # Agent implementations
│   ├── incident_agent/
│   ├── subagents/
│   ├── skills/
│   └── policies/
├── integrations/          # MCP and model integrations
├── sandbox/               # Safe execution environment
├── database/              # PostgreSQL schema
├── infrastructure/        # Docker, deployment
└── docs/                  # Documentation
```

## Key Statistics

- **10 Development Phases** — From TrueForge exploration to demo-ready product
- **3 Specialized Subagents** — Metrics, logs, git agents
- **5+ Scenario Types** — Deployment issues, database incidents, etc.
- **100% Approval-Gated** — All high-risk actions require human approval
- **Real Tool Integration** — GitHub, Grafana, PostgreSQL via MCP

---

**Status:** Project Specification  
**Version:** 1.0  
**Last Updated:** 2026-08-16
