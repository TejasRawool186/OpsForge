# Safety Design

## Overview

Safety is central to OpsForge. The system must balance autonomous investigation with controlled execution, ensuring the agent cannot perform high-risk operations without human approval.

## Core Safety Principles

### Principle 1: Least Privilege
The agent receives only the tools and permissions it needs for its task.

**Implementation:**
- Each MCP tool defines required permissions
- Agent receives scoped credentials
- Tools implement capability restrictions
- No shared "root" credentials

### Principle 2: Read Before Write
Investigation is generally read-only. Data collection precedes action.

**Implementation:**
- MCP tools prioritize read operations
- Write operations require explicit approval
- Diagnostic sandbox cannot modify production
- Logging/audit trails track all operations

### Principle 3: Sandbox Generated Code
Generated code does not execute with unrestricted access.

**Implementation:**
- All code executes in TrueForge sandbox
- Sandbox enforces:
  - Read-only database access
  - No direct network access outside MCP
  - Resource limits (CPU, memory, time)
  - Timeout enforcement
- Results returned safely to agent

### Principle 4: Approval for Irreversible Actions
High-risk operations require human approval.

**Implementation:**
- Risk classification system
- Automatic approval requirement for Level 3
- Clear explanation of action to human
- Human must explicitly approve
- Approval reasons logged

### Principle 5: Explain Actions
Every action has clear rationale and supporting evidence.

**Implementation:**
- Risk assessment document
- Evidence list for hypothesis
- Confidence scores
- Why this action (not alternatives)
- Potential consequences

### Principle 6: Verify After Action
Never assume an operation succeeded.

**Implementation:**
- Post-action verification queries
- Before/after metric comparison
- Success criteria per action type
- Incomplete verification alerts
- Rollback capability if issues detected

---

## Risk Classification System

### Level 0: Read Operations
**Risk:** None  
**Approval:** Not required  
**Human Override:** Optional

**Examples:**
- Read Grafana metrics
- Inspect GitHub repository
- Query database metadata
- Parse logs
- Check service health

**Agent Authority:** Autonomous

### Level 1: Safe Analysis
**Risk:** Very low  
**Approval:** Not required  
**Human Override:** Optional

**Examples:**
- Run analysis in TrueForge sandbox
- Generate diagnostic scripts
- Analyze deployment history
- Test hypotheses
- Generate SQL queries

**Agent Authority:** Autonomous

**Constraints:**
- Sandbox read-only by default
- Resource limits enforced
- Timeout enforcement
- No production data modification

### Level 2: Potentially Impactful
**Risk:** Medium  
**Approval:** Sometimes required (context-dependent)  
**Human Override:** Recommended

**Examples:**
- Create pull request with proposed fix
- Change application configuration
- Restart non-critical service
- Modify logging levels
- Trigger diagnostic mode

**Agent Authority:** Limited autonomy

**Constraints:**
- Risk assessment required
- Human review recommended
- Reversibility check
- Scope limitation

**Approval Triggers:**
- High business impact
- Affects multiple services
- Non-standard change
- First occurrence

### Level 3: High Risk
**Risk:** High  
**Approval:** Always required  
**Human Override:** Required

**Examples:**
- Production deployment rollback
- Delete critical resource
- Disable production service
- Modify production database schema
- Restart critical service
- Change security settings

**Agent Authority:** None (must wait for approval)

**Constraints:**
- Detailed explanation required
- Multiple evidence sources
- Risk/benefit analysis
- Clear approval flow
- Audit trail mandatory
- Undo capability checked

**Approval Requirements:**
- What will happen (clear, specific)
- Why this action (evidence-based)
- Supporting evidence (data/analysis)
- Risk level (quantified)
- Alternatives considered (if any)
- Estimated impact
- Rollback plan

---

## Risk Assessment Framework

### Action Risk Evaluation

Before proposing any Level 2 or Level 3 action, agent performs:

```python
risk_assessment = {
    "action": "...",
    "risk_level": "HIGH|MEDIUM|LOW",
    "confidence_in_hypothesis": 0.91,  # percentage
    "evidence_quality": "STRONG|MODERATE|WEAK",
    "reversibility": "FULLY_REVERSIBLE|PARTIALLY_REVERSIBLE|IRREVERSIBLE",
    "affected_systems": ["checkout-service"],
    "estimated_impact": {
        "best_case": "Error rate returns to normal",
        "worst_case": "Service becomes unavailable",
        "probability": 0.001  # worst case probability
    },
    "approval_required": True,
    "requires_verification": True,
    "alternatives": [
        {
            "action": "Scale service capacity",
            "feasibility": "POSSIBLE",
            "timeline": "15 minutes"
        }
    ]
}
```

### Confidence Threshold

- **High Confidence (>85%):** Action-ready
- **Medium Confidence (60-85%):** Proceed with caution, consider alternatives
- **Low Confidence (<60%):** Cannot recommend action, human investigation needed

---

## Action Approval Gate

### Approval Request

When agent needs approval, it sends:

```json
{
    "incident_id": "INC-2026-001",
    "action": "Rollback deployment-102",
    "risk_level": "HIGH",
    "summary": "Strong evidence indicates deployment-102 caused payment timeout spike",
    "evidence": [
        {
            "type": "METRIC",
            "description": "Error rate increased within 2 min of deployment",
            "data": "2% → 31%"
        },
        {
            "type": "LOG",
            "description": "PaymentTimeoutException increased 1,360%",
            "data": "12 per min → 175 per min"
        },
        {
            "type": "CODE",
            "description": "PR #8421 modified payment timeout handling",
            "link": "https://github.com/checkout/..."
        },
        {
            "type": "SANDBOX",
            "description": "Simulation confirms causation",
            "result": "91% correlation"
        }
    ],
    "confidence": 0.91,
    "reversibility": "FULLY_REVERSIBLE",
    "estimated_downtime": "< 2 minutes",
    "verification_plan": "Monitor error rate for 10 minutes post-rollback",
    "alternatives_considered": [
        "Scale service (15 min delay, may not help)",
        "Disable payment timeout (may hide real issue)"
    ],
    "requested_at": "2026-08-16T10:31:40Z",
    "approval_deadline": "2026-08-16T10:33:40Z"
}
```

### Approval UI

Frontend displays approval clearly:

```
┌─────────────────────────────────────────┐
│         ACTION REQUIRES APPROVAL        │
├─────────────────────────────────────────┤
│                                         │
│ What will happen?                       │
│ Rollback checkout-service from 4.2.1   │
│ to 4.2.0                                │
│                                         │
│ Why?                                    │
│ Strong evidence that deployment-102     │
│ caused payment timeouts.                │
│                                         │
│ Evidence                                │
│ • Error rate: 2% → 31%                 │
│ • Timeout exceptions: ↑ 1,360%         │
│ • Code change: Payment timeout logic    │
│ • Sandbox test: 91% correlation        │
│                                         │
│ Risk Level                              │
│ HIGH                                    │
│                                         │
│ Estimated Impact                        │
│ • Downtime: < 2 minutes                │
│ • Reversibility: Fully reversible      │
│ • Confidence: 91%                       │
│                                         │
│ Verification Plan                       │
│ Error rate will be monitored for 10 min │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  [ Reject ]            [ Approve ]     │
│                                         │
│  Approval expires in: 1m 59s            │
│                                         │
└─────────────────────────────────────────┘
```

### Approval Processing

```
Human reviews → Makes decision → Submits
        ↓
FastAPI validates approval signature
        ↓
Agent receives decision
        ↓
If APPROVED:
├── Execute action
├── Monitor execution
├── Collect results
└── Verify outcome
        ↓
If REJECTED:
├── Log rejection reason
├── Stop action
├── Suggest alternatives
└── Await further instruction
```

---

## Failure Handling

### MCP Tool Failure

If a tool (GitHub, Grafana, PostgreSQL) is unavailable:

1. **Graceful Degradation**
   - Use alternative evidence sources
   - Adjust confidence score downward
   - Continue investigation if possible

2. **Fallback Strategy**
   ```
   If Grafana unavailable:
   ├── Try PostgreSQL metrics table
   ├── Check application logs
   └── Lower confidence accordingly
   ```

3. **Retry Logic**
   - Retry after 5 seconds
   - Give up after 3 attempts
   - Document failure
   - Inform user

### Sandbox Failure

If generated code fails to execute:

1. **Error Analysis**
   - Inspect error message
   - Identify failure cause
   - Propose fix

2. **Recovery**
   - Regenerate code with constraints
   - Retry in sandbox
   - Limit retry attempts (max 3)

3. **Fallback**
   - Use alternative analysis method
   - Request manual review if critical

### Low Confidence

If agent cannot achieve required confidence (>85%):

```
Status: INSUFFICIENT_EVIDENCE

The agent has found:
- Possible correlation with deployment
- But not enough evidence to recommend action

Recommendation: Human engineer should investigate:
1. Check service logs directly
2. Review deployment details
3. Consider other recent changes
4. Test hypothesis manually
```

### Approval Rejection

If human rejects proposed action:

1. **Record Rejection**
   - Store rejection reason
   - Log approver identity
   - Timestamp

2. **Next Steps**
   - Ask agent for alternatives
   - Agent proposes different action
   - Or conclude investigation without action

3. **Documentation**
   - Include in incident report
   - Note why action was rejected

---

## Audit and Logging

### Audit Trail

Every significant action is logged:

```
AUDIT_LOG {
    timestamp: "2026-08-16T10:31:40Z",
    incident_id: "INC-2026-001",
    event_type: "APPROVAL_REQUESTED",
    agent_id: "incident-agent-001",
    action: "Rollback deployment-102",
    risk_level: "HIGH",
    approver_identity: "user@company.com",
    decision: "APPROVED",
    reasoning: "Strong evidence supports hypothesis"
}
```

### Event Capture

Captured events:
- Investigation started
- Evidence collected (per source)
- Hypothesis formed
- Confidence assessed
- Action proposed
- Approval requested
- Approval received/rejected
- Action executed
- Verification performed
- Incident closed

### Session Preservation

All agent sessions are preserved:
- Complete execution history
- Tool call logs with inputs/outputs
- Reasoning steps
- Evidence list
- Final report

---

## Exception Handling Policy

### When Agent Should Stop

Agent must stop and report to human if:
- Confidence falls below 60%
- Multiple critical tools unavailable
- Conflicting evidence sources
- Approval rejected
- Verification fails
- Resource limits exceeded
- Unexpected error occurs

### Human Investigation Scenarios

Escalate to human if:
```
Agent cannot identify root cause
        ↓
Agent confidence too low
        ↓
Multiple hypotheses equally likely
        ↓
Evidence contradictory
        ↓
Proposed action carries unacceptable risk
```

---

## Security Considerations

### Secret Management

Never include production secrets in prompts.

**Pattern:**
```
Agent → MCP Tool → Credential Manager → Scoped Token → Real System
```

**Implementation:**
- Credentials stored in environment/secret manager
- MCP tools handle authentication
- Agent never sees raw credentials
- Audit log shows tool access, not credentials

### Access Control

Agent capabilities determined by:
- Its defined MCP tools
- Tool-level permissions
- Scoped credentials
- Resource quotas

**Example:**
```
Agent has: GitHub read, Grafana read, PostgreSQL read-limited
Agent does NOT have: Write, delete, admin commands
```

### Data Sensitivity

Handle sensitive data safely:
- PII in logs — redacted in UI
- Customer data — never logged
- Credentials — never logged
- Personally identifying info — filtered
- Financial data — aggregated only

---

## Testing Safety

### Test Scenarios

1. **Tool Failure** — Agent handles gracefully
2. **Sandbox Failure** — Agent recovers
3. **Wrong Hypothesis** — Agent changes direction
4. **Low Confidence** — Agent stops, recommends human review
5. **Approval Rejection** — Agent doesn't perform action
6. **Verification Failure** — Agent alerts, doesn't claim success
7. **Timeout** — Agent gracefully stops
8. **Partial Data** — Agent acknowledges limitations
9. **Contradictory Evidence** — Agent notes conflict, lowers confidence
10. **Resource Exhaustion** — Agent terminates safely

---

## Safety Metrics

| Metric | Target | Monitoring |
|--------|--------|-----------|
| Unauthorized actions | 0 per million | Audit trail |
| Approval compliance | 100% | Action log |
| Verification success | >95% | Post-action metrics |
| False positive hypotheses | <5% | Verification results |
| Agent-caused incidents | 0 | Incident analysis |
| Confidence calibration | Within 10% | Post-mortem review |

---

**Version:** 1.0  
**Last Updated:** 2026-08-16
