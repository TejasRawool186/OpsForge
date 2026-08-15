# MCP Integrations & Tool Specifications

## Overview

Model Context Protocol (MCP) serves as the bridge between OpsForge agents and external systems. Each integration provides specific capabilities for incident investigation.

**Architecture:**
```
Agent ↔ MCP Client ↔ MCP Server ↔ External System
```

---

## 1. GitHub MCP Integration

### Purpose
Access repository information, deployment history, commit details, and pull request data.

### System Connection
```
TrueForge Agent
       ↓
GitHub MCP Client
       ↓
GitHub MCP Server
       ↓
GitHub API (REST/GraphQL)
       ↓
GitHub Repository Data
```

### Available Functions

#### `get_repository_info(owner, repository)`
Retrieve repository metadata and configuration.

**Parameters:**
- `owner` (string) — Repository owner
- `repository` (string) — Repository name

**Returns:**
```json
{
    "id": "repo-123",
    "name": "checkout-service",
    "owner": "engineering-team",
    "url": "https://github.com/engineering-team/checkout-service",
    "description": "Checkout microservice",
    "language": "Python",
    "visibility": "PRIVATE",
    "created_at": "2024-01-15",
    "last_push": "2026-08-16T10:27:00Z",
    "default_branch": "main",
    "branches": ["main", "develop", "staging"],
    "protection_rules": ["main": "requires_reviews"]
}
```

**Use Cases:**
- Get repository details
- Understand repository structure
- Check default branch

---

#### `get_recent_commits(owner, repository, limit=20, branch=null)`
Retrieve recent commits.

**Parameters:**
- `owner` (string)
- `repository` (string)
- `limit` (integer, default 20)
- `branch` (string, optional)

**Returns:**
```json
{
    "commits": [
        {
            "sha": "abc1234def5678",
            "message": "Increase payment timeout handling",
            "author": "dev@engineering.com",
            "timestamp": "2026-08-16T10:27:00Z",
            "pr_number": 8421,
            "url": "https://github.com/.../commit/abc1234def5678"
        },
        {
            "sha": "xyz9876abc1234",
            "message": "Add metrics to payment service",
            "author": "dev@engineering.com",
            "timestamp": "2026-08-16T10:15:00Z",
            "pr_number": 8420,
            "url": "https://github.com/.../commit/xyz9876abc1234"
        }
    ]
}
```

**Use Cases:**
- Identify recent deployments
- Find related code changes
- Correlate commits with incidents

---

#### `get_pull_request(owner, repository, pr_number)`
Get detailed pull request information.

**Parameters:**
- `owner` (string)
- `repository` (string)
- `pr_number` (integer)

**Returns:**
```json
{
    "number": 8421,
    "title": "Increase payment API timeout handling",
    "description": "Addresses timeout issues with payment API",
    "author": "dev@engineering.com",
    "status": "MERGED",
    "created_at": "2026-08-15T14:30:00Z",
    "merged_at": "2026-08-16T10:27:00Z",
    "merged_by": "reviewer@engineering.com",
    "target_branch": "main",
    "files_changed": 3,
    "additions": 47,
    "deletions": 12,
    "commits": 2,
    "reviews": 2,
    "comments": [
        {
            "author": "reviewer1@engineering.com",
            "comment": "Looks good, approved",
            "created_at": "2026-08-16T09:00:00Z"
        }
    ],
    "url": "https://github.com/.../pull/8421"
}
```

**Use Cases:**
- Review code changes associated with deployment
- Understand intent of changes
- Identify risky modifications

---

#### `get_diff(owner, repository, commit_sha)`
Get detailed diff for a commit.

**Parameters:**
- `owner` (string)
- `repository` (string)
- `commit_sha` (string)

**Returns:**
```json
{
    "commit": "abc1234def5678",
    "files": [
        {
            "filename": "src/payment_handler.py",
            "status": "MODIFIED",
            "additions": 25,
            "deletions": 8,
            "patch": "[unified diff format]",
            "changes": [
                {
                    "type": "MODIFIED",
                    "line": 145,
                    "old": "timeout=5",
                    "new": "timeout=10"
                },
                {
                    "type": "ADDED",
                    "line": 148,
                    "content": "retry_count=3"
                }
            ]
        }
    ]
}
```

**Use Cases:**
- Analyze what changed
- Identify risky code patterns
- Correlate code change with incident

---

#### `search_commits(query, repository=null, since=null, until=null)`
Search commits by message or author.

**Parameters:**
- `query` (string) — Search query
- `repository` (string, optional)
- `since` (ISO datetime, optional)
- `until` (ISO datetime, optional)

**Returns:**
```json
{
    "total_count": 3,
    "commits": [
        {
            "sha": "abc1234",
            "message": "Fix timeout issue",
            "author": "dev@engineering.com",
            "timestamp": "2026-08-16T10:00:00Z",
            "repository": "checkout-service"
        }
    ]
}
```

**Use Cases:**
- Find commits related to timeout handling
- Search for specific fix patterns
- Historical incident correlation

---

#### `get_deployment_history(owner, repository, limit=50)`
Get deployment history.

**Parameters:**
- `owner` (string)
- `repository` (string)
- `limit` (integer, default 50)

**Returns:**
```json
{
    "deployments": [
        {
            "id": "deploy-102",
            "version": "4.2.1",
            "environment": "production",
            "deployed_at": "2026-08-16T10:27:00Z",
            "deployed_by": "ci-automation",
            "commit_sha": "abc1234def5678",
            "pr_number": 8421,
            "status": "ACTIVE",
            "previous_version": "4.2.0"
        },
        {
            "id": "deploy-101",
            "version": "4.2.0",
            "environment": "production",
            "deployed_at": "2026-08-16T10:05:00Z",
            "deployed_by": "ci-automation",
            "commit_sha": "prev1234def5678",
            "pr_number": 8420,
            "status": "REPLACED",
            "previous_version": "4.1.9"
        }
    ]
}
```

**Use Cases:**
- Timeline of production deployments
- Identify deployment coinciding with incident
- Check rollback status

---

### Configuration

**Environment Variables:**
```bash
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_API_URL=https://api.github.com    # or https://github.enterprise.com/api/v3
GITHUB_ORG=engineering-team
GITHUB_RATE_LIMIT=60 requests/minute
```

**MCP Server Configuration:**
```json
{
    "github": {
        "enabled": true,
        "type": "github",
        "config": {
            "token": "${GITHUB_TOKEN}",
            "base_url": "${GITHUB_API_URL}",
            "timeout_seconds": 30,
            "cache_ttl_seconds": 300
        }
    }
}
```

---

## 2. Grafana/Observability MCP Integration

### Purpose
Query metrics, logs, dashboards, and alerts for incident analysis.

### System Connection
```
TrueForge Agent
       ↓
Grafana MCP Client
       ↓
Grafana MCP Server
       ↓
Grafana API + Prometheus/Loki
       ↓
Metrics & Logs Data
```

### Available Functions

#### `query_metrics(query, time_range, resolution=null)`
Query time-series metrics.

**Parameters:**
- `query` (string) — Prometheus or custom query
- `time_range` (object) — `{start: ISO datetime, end: ISO datetime}`
- `resolution` (string, optional) — e.g., "1m", "5m", "1h"

**Returns:**
```json
{
    "query": "rate(requests_total[5m])",
    "time_range": {
        "start": "2026-08-16T10:25:00Z",
        "end": "2026-08-16T10:35:00Z"
    },
    "data": [
        {
            "timestamp": "2026-08-16T10:25:00Z",
            "value": 0.02,
            "labels": {"service": "checkout-service"}
        },
        {
            "timestamp": "2026-08-16T10:30:00Z",
            "value": 0.31,
            "labels": {"service": "checkout-service"}
        }
    ]
}
```

**Use Cases:**
- Query error rates
- Get latency metrics
- Monitor resource utilization

---

#### `get_dashboard(name)`
Retrieve dashboard configuration.

**Parameters:**
- `name` (string) — Dashboard name or ID

**Returns:**
```json
{
    "id": "dash-123",
    "name": "Checkout Service Overview",
    "description": "Real-time monitoring dashboard",
    "panels": [
        {
            "id": "panel-1",
            "title": "Error Rate",
            "type": "graph",
            "query": "rate(errors_total[5m])",
            "alert_threshold": 0.05
        },
        {
            "id": "panel-2",
            "title": "Latency P99",
            "type": "graph",
            "query": "histogram_quantile(0.99, ...)"
        }
    ],
    "url": "https://grafana.example.com/d/dash-123"
}
```

**Use Cases:**
- Get preconfigured dashboard
- Understand important metrics
- Find relevant queries

---

#### `query_logs(filter, time_range, limit=100)`
Query logs (via Loki or similar).

**Parameters:**
- `filter` (string) — Log filter expression
- `time_range` (object) — `{start: ISO datetime, end: ISO datetime}`
- `limit` (integer, default 100)

**Returns:**
```json
{
    "filter": "{job=\"checkout-service\"} |= \"PaymentTimeoutException\"",
    "time_range": {
        "start": "2026-08-16T10:25:00Z",
        "end": "2026-08-16T10:35:00Z"
    },
    "total_logs": 847,
    "logs": [
        {
            "timestamp": "2026-08-16T10:30:05Z",
            "level": "ERROR",
            "message": "PaymentTimeoutException: Payment API timeout after 5000ms",
            "service": "checkout-service",
            "trace_id": "trace-123",
            "stack_trace": "[...]"
        }
    ]
}
```

**Use Cases:**
- Find exceptions
- Analyze error patterns
- Get stack traces

---

#### `get_alert_history(service, time_range=null)`
Retrieve alert history.

**Parameters:**
- `service` (string) — Service name
- `time_range` (object, optional)

**Returns:**
```json
{
    "service": "checkout-service",
    "alerts": [
        {
            "alert_name": "HighErrorRate",
            "state": "FIRING",
            "started_at": "2026-08-16T10:30:00Z",
            "ended_at": null,
            "value": 0.31,
            "threshold": 0.05,
            "duration_minutes": 4,
            "rule": "error_rate > 0.05 for 1m"
        }
    ]
}
```

**Use Cases:**
- Understand alert patterns
- Trace alert history
- Identify multi-service incidents

---

#### `compare_metrics(metric, before_window, after_window)`
Compare metrics before and after an event.

**Parameters:**
- `metric` (string) — Metric to compare
- `before_window` (object) — `{start, end}` before deployment
- `after_window` (object) — `{start, end}` after deployment

**Returns:**
```json
{
    "metric": "error_rate",
    "before": {
        "average": 0.02,
        "min": 0.01,
        "max": 0.03,
        "percentile_99": 0.025
    },
    "after": {
        "average": 0.31,
        "min": 0.14,
        "max": 0.35,
        "percentile_99": 0.34
    },
    "change": {
        "absolute_change": 0.29,
        "percentage_change": "1450%",
        "statistical_significance": "p < 0.001"
    }
}
```

**Use Cases:**
- Verify remediation effectiveness
- Quantify incident impact
- Statistical correlation analysis

---

### Configuration

**Environment Variables:**
```bash
GRAFANA_URL=https://grafana.example.com
GRAFANA_API_KEY=eyJrIjoiYXBpa2V5aGVyZSIsIm4iOiJPcHNGb3JnZSIsImlkIjoxMjM0fQ==
GRAFANA_ORG_ID=1
GRAFANA_TIMEOUT_SECONDS=30
```

**MCP Server Configuration:**
```json
{
    "grafana": {
        "enabled": true,
        "type": "grafana",
        "config": {
            "url": "${GRAFANA_URL}",
            "api_key": "${GRAFANA_API_KEY}",
            "org_id": "${GRAFANA_ORG_ID}",
            "timeout_seconds": 30
        }
    }
}
```

---

## 3. PostgreSQL MCP Integration

### Purpose
Execute queries on application database for investigation and diagnostics.

### System Connection
```
TrueForge Agent
       ↓
PostgreSQL MCP Client
       ↓
PostgreSQL MCP Server
       ↓
PostgreSQL Database
       ↓
Application Data
```

### Available Functions

#### `execute_query(sql)`
Execute SQL query (read-only by default).

**Parameters:**
- `sql` (string) — SQL query

**Returns:**
```json
{
    "query": "SELECT COUNT(*) as error_count FROM logs WHERE level='ERROR' AND timestamp > '2026-08-16T10:30:00Z'",
    "rows_returned": 1,
    "execution_time_ms": 145,
    "data": [
        {
            "error_count": 847
        }
    ]
}
```

**Use Cases:**
- Query application data
- Count errors/transactions
- Analyze anomalies

**Security:**
- Read-only queries only
- Query timeout: 30 seconds
- Result size limit: 10,000 rows
- Sensitive column filtering (credit cards, SSNs)

---

#### `get_table_schema(table_name)`
Retrieve table structure.

**Parameters:**
- `table_name` (string)

**Returns:**
```json
{
    "table_name": "events",
    "columns": [
        {
            "name": "id",
            "type": "bigint",
            "nullable": false,
            "primary_key": true
        },
        {
            "name": "event_type",
            "type": "varchar(50)",
            "nullable": false
        },
        {
            "name": "timestamp",
            "type": "timestamp",
            "nullable": false,
            "indexed": true
        }
    ],
    "indexes": [
        {
            "name": "idx_events_timestamp",
            "columns": ["timestamp"]
        }
    ],
    "row_count": 15234567
}
```

**Use Cases:**
- Understand data schema
- Identify relevant tables
- Plan queries

---

#### `get_slow_queries(limit=10)`
Get recent slow queries (from `pg_stat_statements`).

**Parameters:**
- `limit` (integer, default 10)

**Returns:**
```json
{
    "queries": [
        {
            "query": "SELECT * FROM transactions WHERE status='PENDING' ORDER BY timestamp DESC",
            "total_time_ms": 45320,
            "calls": 1234,
            "mean_time_ms": 36.75,
            "max_time_ms": 2340,
            "min_time_ms": 5
        }
    ]
}
```

**Use Cases:**
- Database performance diagnosis
- Identify query bottlenecks
- Find inefficient queries

---

#### `analyze_data(table_name, analysis_type, time_range=null)`
Perform statistical analysis on table data.

**Parameters:**
- `table_name` (string)
- `analysis_type` (string) — "DISTRIBUTION", "ANOMALY", "GROWTH", "CARDINALITY"
- `time_range` (object, optional)

**Returns:**
```json
{
    "table": "transactions",
    "analysis_type": "ANOMALY",
    "time_range": {
        "start": "2026-08-16T10:00:00Z",
        "end": "2026-08-16T10:35:00Z"
    },
    "results": {
        "baseline_transactions_per_min": 450,
        "anomaly_detected": true,
        "transactions_per_min_at_anomaly": 180,
        "change_percentage": "-60%",
        "anomaly_start": "2026-08-16T10:30:00Z",
        "likely_cause": "Payment processing timeout"
    }
}
```

**Use Cases:**
- Detect data anomalies
- Analyze growth patterns
- Track cardinality changes

---

### Configuration

**Environment Variables:**
```bash
DATABASE_URL=postgresql://opsforge_user:password@db.example.com:5432/opsforge_prod
DATABASE_TIMEOUT_SECONDS=30
DATABASE_POOL_SIZE=5
DATABASE_READONLY=true
```

**MCP Server Configuration:**
```json
{
    "postgres": {
        "enabled": true,
        "type": "postgres",
        "config": {
            "connection_url": "${DATABASE_URL}",
            "timeout_seconds": 30,
            "read_only": true,
            "max_rows_returned": 10000,
            "query_timeout_seconds": 30,
            "sensitive_columns": ["credit_card", "ssn", "password"]
        }
    }
}
```

---

## MCP Tool Orchestration

### Tool Selection Logic

Agent chooses tools based on investigation need:

```python
if investigating_error_spike:
    # Get error rate timeline
    use_tool("grafana.query_metrics", query="error_rate")
    
    # Find exceptions
    use_tool("postgres.execute_query", sql="SELECT * FROM logs WHERE level='ERROR'")
    
    # Check recent deployments
    use_tool("github.get_deployment_history")

if analyzing_performance:
    # Get slow queries
    use_tool("postgres.get_slow_queries")
    
    # Compare metrics
    use_tool("grafana.compare_metrics")

if need_code_context:
    # Get recent commits
    use_tool("github.get_recent_commits")
    
    # Get PR details
    use_tool("github.get_pull_request")
```

### Error Handling

**Tool Unavailable:**
```
Try tool → Tool unavailable
    ↓
Retry after 2 seconds
    ↓
Give up after 3 attempts
    ↓
Use alternative data source
    ↓
Reduce confidence score
```

**Rate Limits:**
```
GitHub: 60 requests/minute
Grafana: 100 requests/minute
PostgreSQL: Query timeout 30 seconds
    ↓
Agent respects limits
    ↓
Batch queries when possible
    ↓
Queue requests if needed
```

---

## Security & Access Control

### Credential Management

Never expose raw credentials to agents.

**Pattern:**
```
Agent → Tool Call
   ↓
MCP Server receives call
   ↓
MCP Server retrieves credentials (from environment)
   ↓
MCP Server authenticates with external system
   ↓
MCP Server returns results (no credentials)
   ↓
Agent processes results
```

### Read-Only Access

By default, agent tools are read-only:
- **GitHub:** Read repos, commits, PRs (no write)
- **Grafana:** Query metrics/logs (no delete)
- **PostgreSQL:** SELECT only (no INSERT, UPDATE, DELETE)

### Audit Trail

All tool calls are logged:
```json
{
    "timestamp": "2026-08-16T10:31:07Z",
    "agent": "incident-agent-001",
    "incident": "INC-2026-001",
    "tool": "grafana",
    "function": "query_metrics",
    "parameters": {"query": "error_rate", "time_range": "..."},
    "result_size_bytes": 1250,
    "execution_time_ms": 145,
    "status": "SUCCESS"
}
```

---

## Tool Integration Checklist

- [ ] GitHub MCP server running and accessible
- [ ] GitHub API token configured and valid
- [ ] Grafana MCP server running and accessible
- [ ] Grafana API key configured and valid
- [ ] PostgreSQL MCP server running and accessible
- [ ] Database credentials configured securely
- [ ] All tools return expected data formats
- [ ] Error handling tested for all tools
- [ ] Rate limits respected
- [ ] Timeout values appropriate
- [ ] Audit logging configured

---

**Version:** 1.0  
**Last Updated:** 2026-08-16
