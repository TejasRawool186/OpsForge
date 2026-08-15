# Agent Capabilities & Subagent Architecture

## Overview

OpsForge uses a multi-agent system coordinated by TrueForge:
- **Main Incident Agent** — Central reasoning and orchestration
- **Specialized Subagents** — Parallel investigation of specific domains

## Main Incident Agent

### Purpose
Central authority for incident investigation and remediation decision-making.

### Responsibilities

1. **Receive Incident Task**
   - Parse incident description
   - Extract key information
   - Set initial context

2. **Plan Investigation**
   - Determine what evidence is needed
   - Prioritize evidence sources
   - Plan subagent delegation

3. **Collect Evidence**
   - Query tools directly
   - Delegate to subagents
   - Aggregate results
   - Identify gaps

4. **Analyze Findings**
   - Correlate evidence across sources
   - Identify patterns
   - Assess significance

5. **Form Hypothesis**
   - Propose root cause
   - Calculate confidence score
   - Identify supporting/contradicting evidence

6. **Test Hypothesis**
   - Generate diagnostic script
   - Submit to sandbox
   - Analyze results
   - Update confidence

7. **Make Remediation Decision**
   - Identify safe remediation action
   - Assess risk level
   - Prepare approval request
   - Or determine human investigation needed

8. **Coordinate Verification**
   - After approval and execution
   - Verify metrics improved
   - Confirm incident resolution
   - Generate report

### Skills

The main agent has access to reusable skills:

#### Incident Investigation Skills

1. **Investigate Error Spike**
   - Query error rates over time
   - Find correlation with deployments
   - Check for code changes
   - Identify likely cause

2. **Analyze Deployment Impact**
   - Get recent deployments
   - Check commit details
   - Compare metrics before/after
   - Identify risky changes

3. **Identify Timeout Issues**
   - Query timeout exception rates
   - Correlate with recent changes
   - Check service dependencies
   - Analyze timeout configuration

4. **Database Performance Diagnosis**
   - Query slow query logs
   - Check recent schema changes
   - Identify missing indexes
   - Suggest optimization

5. **Configuration Change Analysis**
   - Get recent config changes
   - Correlate with incident timing
   - Check rollback feasibility
   - Propose revert if needed

---

## Subagent Architecture

### System Design

```
                Main Incident Agent
                        │
        ┌───────────────┼───────────────┐
        ↓               ↓               ↓
   Metrics Agent   Log Agent      Git Agent
        │               │               │
        ↓               ↓               ↓
    Grafana         Logs          GitHub
        │               │               │
        └───────────────┼───────────────┘
                        ↓
                Main Agent Synthesis
                        ↓
                   Root Cause
```

### Communication Pattern

1. **Main Agent Delegates**
   ```
   Task: "Analyze error rate trend for checkout-service"
   Subagent: metrics_agent
   Parameters: {
       "metric": "error_rate",
       "service": "checkout-service",
       "time_range": "last_60_min",
       "resolution": "1_min"
   }
   ```

2. **Subagent Investigates**
   - Uses specialized tools
   - Performs domain analysis
   - Returns structured findings

3. **Main Agent Receives Results**
   - Incorporates into context
   - Updates confidence
   - Asks follow-up questions

4. **Parallel Execution**
   - Multiple subagents run simultaneously
   - Main agent waits for all results
   - Processes independently

---

## Specialized Subagents

### 1. Metrics Agent

**Purpose:** Analyze operational metrics and signals

**Domain:** Grafana, time-series data, performance metrics

**Capabilities:**
- Query error rates
- Analyze latency trends
- Check CPU/memory utilization
- Monitor traffic patterns
- Correlate metrics across services
- Identify anomalies
- Compare before/after metrics

**Tools Available:**
```
• grafana.query_metrics(query, time_range)
• grafana.get_dashboard(name)
• grafana.get_alert_history(service)
• grafana.compare_metrics(before_window, after_window)
```

**Example Investigation:**
```
Main Agent: "Analyze error rate around deployment time"
        ↓
Metrics Agent:
├── Query error rate 1 hour before deployment
├── Query error rate 1 hour after deployment
├── Calculate percentage change
├── Assess statistical significance
└── Report: "Error rate increased 1,450% post-deployment"
        ↓
Main Agent: Incorporates into hypothesis
```

**Confidence Contribution:** High (data-driven)

---

### 2. Log Agent

**Purpose:** Analyze application logs and events

**Domain:** Log data, exceptions, error messages, event correlation

**Capabilities:**
- Parse and search logs
- Identify exceptions
- Count error frequencies
- Trace error patterns
- Extract stack traces
- Correlate errors across services
- Find related log entries
- Detect cascading failures

**Tools Available:**
```
• postgres.execute_query(sql)
  (for logs stored in database)
• grafana.query_logs(filter, time_range)
• log_parser.extract_errors()
• log_parser.correlation_analysis()
```

**Example Investigation:**
```
Main Agent: "Find exceptions around deployment time"
        ↓
Log Agent:
├── Query logs from 10:25 to 10:35 UTC
├── Filter for ERROR level
├── Extract exception types
├── Count PaymentTimeoutException: 0 → 175/min
├── Get stack traces
└── Report: "PaymentTimeoutException increased 1,360%"
        ↓
Main Agent: Strong evidence of specific issue type
```

**Confidence Contribution:** Very High (direct evidence)

---

### 3. Git Agent

**Purpose:** Analyze code changes and deployment history

**Domain:** GitHub, commits, pull requests, deployment metadata

**Capabilities:**
- List recent commits
- Get PR details
- Analyze code changes
- Identify risky changes
- Check deployment history
- Correlate code with incidents
- Review change scope
- Extract commit messages

**Tools Available:**
```
• github.get_recent_commits(repo, limit)
• github.get_pull_request(repo, pr_number)
• github.search_commits(query)
• github.get_deployment_history(repo)
• github.get_diff(commit)
```

**Example Investigation:**
```
Main Agent: "Find deployments near error spike time"
        ↓
Git Agent:
├── Get deployments last 30 minutes
├── Found: deployment-102 at 10:27 UTC
├── Get associated PR #8421
├── Review changes: Modified timeout handling
├── Extract commit message: "Improve payment timeout logic"
└── Report: "Deployment #102 changed payment timeout code"
        ↓
Main Agent: Deployment-error correlation identified
```

**Confidence Contribution:** Medium-High (establishes correlation)

---

### 4. Database Agent (Optional)

**Purpose:** Analyze database performance and application data

**Domain:** PostgreSQL, queries, schema, application state

**Capabilities:**
- Execute analytical queries
- Identify slow queries
- Check recent schema changes
- Analyze table statistics
- Find anomalous data patterns
- Check connection counts
- Monitor transaction locks

**Tools Available:**
```
• postgres.execute_query(sql)
• postgres.get_table_schema(table)
• postgres.get_slow_queries()
• postgres.analyze_table_stats(table)
```

**Use Cases:**
- Database performance incidents
- Data anomaly investigation
- Connection pool exhaustion
- Transaction lock analysis

---

## Subagent Coordination Protocol

### 1. Delegation Phase

Main agent determines needed investigations:

```python
subagent_tasks = [
    {
        "agent": "metrics_agent",
        "task": "analyze_error_spike",
        "parameters": {...}
    },
    {
        "agent": "log_agent",
        "task": "find_exceptions",
        "parameters": {...}
    },
    {
        "agent": "git_agent",
        "task": "find_deployments",
        "parameters": {...}
    }
]
```

### 2. Parallel Execution

All subagents start simultaneously:

```
Time →
Metrics Agent:  [████████] (2 seconds)
Log Agent:      [█████████████] (4 seconds)
Git Agent:      [██████] (1.5 seconds)
Main Agent:     waiting...
```

### 3. Result Collection

Main agent waits for all subagents:

```python
results = {
    "metrics": {
        "error_rate_before": "2%",
        "error_rate_after": "31%",
        "correlation": "STRONG"
    },
    "logs": {
        "timeout_exceptions_before": 12,
        "timeout_exceptions_after": 175,
        "spike_timing": "Within 2 minutes of deployment"
    },
    "git": {
        "deployment_id": "deploy-102",
        "deployment_time": "10:27 UTC",
        "pr_number": 8421,
        "changed_component": "payment_timeout_handler"
    }
}
```

### 4. Synthesis

Main agent correlates findings:

```
Error rate spike + Timeout exception spike + 
Code change to timeout handling + Deployment timing =
HIGH CONFIDENCE: Deployment caused issue
```

### 5. Confidence Calculation

```python
confidence = aggregate_confidence([
    metrics_confidence: 0.95,      # Data-driven, clear correlation
    log_confidence: 0.98,           # Direct exception evidence
    git_confidence: 0.85,           # Establishes causation candidate
    timing_correlation: 0.92        # Temporal alignment
])
# Result: ~0.91 (91%)
```

---

## Subagent Error Handling

### If Subagent Fails

```
Subagent fails to retrieve data
        ↓
Main agent notifies user
        ↓
Main agent attempts alternative approach
        ↓
Reduces confidence score
        ↓
Continues with available evidence
        ↓
If confidence too low: "Human investigation needed"
```

### If Subagent Contradicts Others

```
Metrics Agent: "Error spike at 10:30"
Git Agent: "No deployment at that time"
        ↓
Main Agent:
├── Check timestamps again
├── Query for deployment within 5 min
├── Reconcile timing
└── Adjust confidence accordingly
```

---

## Agent State Machine

### Main Agent States

```
                    CREATED
                       ↓
                  INVESTIGATING
                       ↓
              DELEGATING_SUBAGENTS
                       ↓
            COLLECTING_EVIDENCE
                       ↓
                  ANALYZING
                       ↓
              ROOT_CAUSE_FOUND
                       ↓
              PROPOSING_ACTION
                       ↓
            ┌─────────────────────┐
            ↓                     ↓
    SAFE_ACTION          APPROVAL_REQUIRED
            │                     │
            │                ┌────┴────┐
            │                ↓         ↓
            │            APPROVED  REJECTED
            │                │         │
            └────────────────┘         │
                    │                  │
                    ↓                  ↓
                EXECUTING         INVESTIGATION_STOPPED
                    │
                    ↓
               VERIFYING
                    │
                    ↓
               RESOLVED
```

### Subagent States

```
IDLE → ACTIVE → PROCESSING → COMPLETE
           ↓         ↓          ↓
        (delegated) (analyzing) (results ready)
                    
           ↓
         ERROR → FAILED
        (timeout, unavailable)
```

---

## Communication Between Agents

### Message Format

```json
{
    "from": "main_agent",
    "to": "metrics_agent",
    "message_type": "TASK_DELEGATION",
    "task_id": "task_123",
    "task": "analyze_error_spike",
    "context": {
        "service": "checkout-service",
        "time_range": "2026-08-16T10:25:00Z to 2026-08-16T10:35:00Z",
        "metric": "error_rate"
    },
    "deadline": "2026-08-16T10:31:30Z"
}
```

### Response Format

```json
{
    "from": "metrics_agent",
    "to": "main_agent",
    "message_type": "TASK_RESULT",
    "task_id": "task_123",
    "status": "COMPLETE",
    "result": {
        "error_rate_before_deployment": "2%",
        "error_rate_after_deployment": "31%",
        "change_percentage": "1450%",
        "statistical_significance": "p < 0.001",
        "confidence": 0.95
    },
    "processing_time_ms": 2000
}
```

---

## Performance Optimization

### Parallel Investigation

By using subagents:
- Investigation time: **4 seconds** (parallel)
- vs. Sequential: **7 seconds**
- Speedup: **43% faster**

### Load Distribution

- Main agent: Coordination, synthesis
- Subagents: Specialized domain work
- Tools: Distributed queries

### Caching

- Metrics queries: Cache 30 seconds
- Logs: No caching (always fresh)
- Git data: Cache 5 minutes

---

## Extensibility

### Adding a New Subagent

To add a new specialized agent (e.g., Security Agent):

1. **Define Agent**
   ```python
   class SecurityAgent(TrueForgeAgent):
       def investigate_access_patterns(self, ...):
           # Security-specific investigation
       
       def check_recent_auth_changes(self, ...):
           # Authentication changes
   ```

2. **Register Tools**
   - Connect to security audit logs
   - Integration with IAM systems
   - Permission check capabilities

3. **Update Main Agent**
   - Add delegation logic
   - Include in parallel task list

4. **Update Coordination**
   - Add result synthesis for security
   - Adjust confidence calculation

---

## Example: Complete Investigation

### Scenario
Checkout error spike after deployment

### Flow

```
User: "Investigate checkout error spike"
        ↓
Main Agent receives task
        ↓
Main Agent: "I need evidence from 3 areas"
        ├─ Subagent 1: Query error metrics
        ├─ Subagent 2: Find exceptions
        └─ Subagent 3: Get deployments
        ↓
[All subagents run in parallel for 4 seconds]
        ↓
Main Agent receives results:
├─ Error rate: 2% → 31% ✓
├─ PaymentTimeoutException: 0 → 175/min ✓
├─ Deployment #102 at 10:27 ✓
        ↓
Main Agent: "Strong correlation with deployment"
        ↓
Main Agent generates diagnostic script
        ↓
Sandbox executes script
        ↓
Main Agent: "91% confidence deployment caused issue"
        ↓
Main Agent proposes: "Rollback deployment-102"
        ↓
Approval system engages
        ↓
Human approves
        ↓
Agent executes rollback
        ↓
Agent verifies: Error rate returns to 2.3%
        ↓
Incident resolved
```

---

**Version:** 1.0  
**Last Updated:** 2026-08-16
