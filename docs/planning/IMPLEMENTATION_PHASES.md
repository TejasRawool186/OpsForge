# Implementation Phases

## Overview

OpsForge development is organized into 10 sequential phases, progressing from TrueForge exploration through demo-ready product.

Each phase builds on previous work and produces specific deliverables.

## Phase 1: TrueForge Exploration

**Goal:** Run a basic TrueForge agent and connect one tool

**Duration:** 3-5 days

**Objectives:**
- Set up TrueForge development environment
- Understand TrueForge API and concepts
- Implement minimal agent
- Connect first MCP tool (GitHub)
- Verify basic tool calling works

**Deliverables:**
- Working TrueForge agent
- Basic GitHub MCP integration
- Simple tool call execution
- Development environment documentation

**Success Criteria:**
- Agent successfully calls GitHub API
- Tool results returned to agent
- Can demonstrate: ask agent for GitHub info, receives accurate response

**Key Decisions:**
- TrueForge version selection
- Model provider choice (initial)
- Development environment setup

---

## Phase 2: MCP Integration

**Goal:** Connect all primary data sources via MCP

**Duration:** 1 week

**Objectives:**
- Implement GitHub MCP tool
- Implement Grafana/observability MCP tool
- Implement PostgreSQL MCP tool
- Test multi-tool coordination
- Handle tool failures gracefully

**Deliverables:**
- GitHub MCP (commits, PRs, deployments)
- Grafana MCP (metrics, alerts, dashboards)
- PostgreSQL MCP (data queries)
- Tool orchestration layer
- Error handling framework

**Success Criteria:**
- Agent can query all three tool sources
- Results properly integrated into context
- Tool failures don't crash agent
- Can correlate data across sources

**Key Decisions:**
- MCP credential management
- Query limits and timeouts
- Result caching strategy
- Error recovery approach

---

## Phase 3: Sandbox

**Goal:** Safely execute generated diagnostic code

**Duration:** 5-7 days

**Objectives:**
- Set up TrueForge sandbox
- Agent generates diagnostic Python scripts
- Sandbox executes with safety constraints
- Return results to agent
- Test with real incident data

**Deliverables:**
- Working sandbox environment
- Code generation patterns
- Execution framework
- Result parsing
- Safety enforcement (timeouts, limits)

**Success Criteria:**
- Agent generates valid Python code
- Sandbox executes without errors
- Code has read-only access to data
- Results returned successfully
- Timeout enforcement works

**Key Decisions:**
- Python version and libraries available
- Sandbox resource limits
- Result size limits
- Error message handling

---

## Phase 4: Incident Workflow

**Goal:** Complete investigation loop

**Duration:** 1 week

**Objectives:**
- Implement incident creation API
- Agent receives incident task
- Implement investigation state machine
- Collect evidence from all sources
- Form root cause hypothesis
- Generate investigation report

**Deliverables:**
- Incident API endpoints
- Investigation state machine
- Evidence collection workflow
- Hypothesis formation logic
- Report generation
- Event logging

**Success Criteria:**
- Create incident → agent investigates automatically
- Agent collects evidence from multiple sources
- Forms reasonable hypothesis
- Generates readable investigation report
- Timeline of all agent actions captured

**Key Decisions:**
- Investigation timeout (max duration)
- Evidence collection order
- Hypothesis confidence threshold
- Report format/template

---

## Phase 5: Approval System

**Goal:** Human-in-the-loop gates for high-risk actions

**Duration:** 5-7 days

**Objectives:**
- Classify actions by risk level
- Identify high-risk operations
- Create approval request API
- Build approval UI dialog
- Implement approval workflow
- Handle approval timeouts
- Document approval reasons

**Deliverables:**
- Risk classification system
- Action approval framework
- Approval API endpoints
- Frontend approval dialog
- Approval persistence
- Audit trail for approvals

**Success Criteria:**
- Agent pauses before high-risk action
- Sends approval request with clear explanation
- UI displays action details and evidence
- Human can approve/reject
- Agent receives and acts on decision
- Approval recorded in audit trail

**Key Decisions:**
- Risk level definitions
- Approval timeout duration
- Required approval details
- Escalation procedures

---

## Phase 6: Verification

**Goal:** Confirm remediation success

**Duration:** 3-5 days

**Objectives:**
- After action execution, verify results
- Query metrics for improvement
- Compare before/after state
- Confirm problem resolution
- Update incident status
- Document verification results

**Deliverables:**
- Verification framework
- Post-action metric queries
- Before/after comparison
- Verification report
- Status update logic
- Closure criteria

**Success Criteria:**
- After remediation, agent checks relevant metrics
- Compares to baseline
- Confirms improvement or identifies failure
- Updates incident status appropriately
- Verification results included in report

**Key Decisions:**
- Which metrics to verify (action-dependent)
- Verification delay (wait before checking)
- Success criteria per action type
- Incomplete verification handling

---

## Phase 7: Subagents

**Goal:** Parallel specialized investigation

**Duration:** 1 week

**Objectives:**
- Implement subagent framework
- Create Metrics Agent
- Create Log Agent
- Create Git Agent
- Coordinate subagent execution
- Synthesize findings

**Deliverables:**
- Subagent framework in TrueForge
- Three specialized agents
- Agent communication protocol
- Result synthesis logic
- Parallel execution capability
- Subagent error handling

**Success Criteria:**
- Main agent delegates to subagents
- Subagents operate in parallel
- Main agent waits for all results
- Findings properly integrated
- Improved investigation speed
- No information loss

**Key Decisions:**
- Which tasks each subagent handles
- Communication mechanism
- Timeout per subagent
- Fallback if subagent fails

---

## Phase 8: UI

**Goal:** Polished demo-ready dashboard

**Duration:** 1-2 weeks

**Objectives:**
- Design incident dashboard
- Implement incident list view
- Implement investigation detail view
- Create real-time timeline visualization
- Build approval dialog
- Create incident report view
- Add session history view

**Deliverables:**
- Incident list screen
- Investigation dashboard
- Execution timeline (real-time)
- Approval request dialog
- Incident report screen
- Session history view
- Responsive design

**Success Criteria:**
- All major workflows have UI
- Real-time updates work
- Timeline shows clear progression
- Approval dialog is clear and actionable
- Report is readable and professional-looking
- Mobile responsive

**Key Decisions:**
- UI framework (shadcn/ui chosen)
- Color scheme and styling
- Timeline update frequency
- Real-time notification approach

---

## Phase 9: Safety Testing

**Goal:** Reliable, robust agent behavior

**Duration:** 1-2 weeks

**Objectives:**
- Test tool failure scenarios
- Test sandbox failures
- Test incorrect hypotheses
- Test low-confidence cases
- Test approval rejection
- Test timeout/reconnection
- Test partial data
- Test edge cases

**Deliverables:**
- Test suite for agent edge cases
- Failure mode documentation
- Recovery procedures
- Safety validation report
- Known limitations document

**Success Criteria:**
- Agent handles all failure modes gracefully
- Doesn't make unsupported claims
- Stops when confidence is low
- Respects approval rejections
- Recovers from timeouts
- Never performs unauthorized actions

**Key Decisions:**
- Test data sources
- Failure simulation methods
- Success criteria for each test
- How to handle unforeseen failures

---

## Phase 10: Demo

**Goal:** Production-ready demonstration

**Duration:** 3-5 days

**Objectives:**
- Select compelling incident scenario
- Prepare demo environment
- Create demo scripts/data
- Prepare presentation
- Practice demo flow
- Set up stage (if in-person)

**Deliverables:**
- Working demo environment
- Demo scripts
- Sample incident data
- Presentation slides
- Backup scenarios
- Troubleshooting guide

**Demo Scenario:**
```
Checkout service error rate spikes from 2% to 31%
        ↓
User gives incident to OpsForge
        ↓
Agent investigates (show real tool calls)
        ↓
Agent finds bad deployment (GitHub)
        ↓
Sandbox analyzes correlation
        ↓
Agent requests approval for rollback
        ↓
Human approves
        ↓
Agent executes rollback
        ↓
Error rate recovers (31% → 2.3%)
        ↓
Incident closed
```

**Success Criteria:**
- Complete scenario runs without errors
- Tool calls are visible
- Approval gate works
- Recovery is clear
- Demo tells compelling story

---

## Phase Dependencies

```
Phase 1 (TrueForge)
        ↓
Phase 2 (MCP Tools)
        ↓
Phase 3 (Sandbox)
        ↓
Phase 4 (Investigation)
        ↓
Phase 5 (Approval)
        ↓
Phase 6 (Verification)
        ↓
    ┌───┴───┐
    ↓       ↓
Phase 7  Phase 8
(Subagents) (UI)
    ↓       ↓
    └───┬───┘
        ↓
    Phase 9
   (Testing)
        ↓
   Phase 10
     (Demo)
```

## Parallel Work Opportunities

Some phases can overlap:
- **Phase 7 & 8** can happen in parallel (UI doesn't block subagents)
- **Phase 2** can begin detailed planning while Phase 1 is in progress
- **Database** schema work can happen alongside early phases

## Timeline Estimation

| Phase | Duration | Cumulative |
|-------|----------|-----------|
| 1 | 3-5 days | 3-5 days |
| 2 | 1 week | 1.5 weeks |
| 3 | 5-7 days | 2.5 weeks |
| 4 | 1 week | 3.5 weeks |
| 5 | 5-7 days | 4.5 weeks |
| 6 | 3-5 days | 5 weeks |
| 7 | 1 week | 6 weeks |
| 8 | 1-2 weeks | 7-8 weeks |
| 9 | 1-2 weeks | 8-10 weeks |
| 10 | 3-5 days | 8.5-11 weeks |

**Estimated Total:** 8.5-11 weeks (2-2.5 months)

## MVP Completion

A functional MVP is complete after **Phase 6** (Verification):
- ✓ Agent can investigate
- ✓ Agent connects to real tools
- ✓ Agent generates and tests hypotheses
- ✓ Agent can propose remediation
- ✓ Human approval gate works
- ✓ Agent executes and verifies

Phases 7-10 add polish, performance, and demo readiness.

## Checkpoints

### After Phase 2
- Verify: Agent can query all three tool sources
- Decision: Proceed to Phase 3 or iterate on tools

### After Phase 4
- Verify: Complete investigation loop works
- Decision: Proceed to approval system

### After Phase 6
- Verify: MVP scenarios work end-to-end
- Decision: Proceed to polish or extend

### After Phase 8
- Verify: UI is production-ready
- Decision: Proceed to safety testing

### Before Demo
- Verify: All components working together
- Decision: Ready for presentation

---

**Version:** 1.0  
**Last Updated:** 2026-08-16
