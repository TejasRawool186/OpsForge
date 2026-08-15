# FastAPI Endpoints Specification

## Overview

OpsForge API is built with FastAPI and provides endpoints for incident management, investigation, approvals, and operational control.

**Base URL:** `http://localhost:8000`  
**API Version:** v1  
**Authentication:** JWT Bearer Token (TBD)

---

## Core Endpoints

### Incidents

#### POST /api/incidents
Create a new incident

**Request:**
```json
{
    "title": "Checkout service error spike",
    "service": "checkout-service",
    "severity": "HIGH",
    "description": "Error rate increased from 2% to 31% starting at 10:30 UTC",
    "alert_source": "grafana",
    "alert_id": "alert-12345"
}
```

**Response (201 Created):**
```json
{
    "id": "INC-2026-001",
    "title": "Checkout service error spike",
    "service": "checkout-service",
    "severity": "HIGH",
    "status": "CREATED",
    "created_at": "2026-08-16T10:31:00Z",
    "created_by": "grafana-alerting"
}
```

**Status Codes:**
- 201: Created
- 400: Invalid request
- 401: Unauthorized

---

#### GET /api/incidents
List all incidents

**Query Parameters:**
```
?status=CREATED|INVESTIGATING|ROOT_CAUSE_FOUND|PROPOSING_ACTION|APPROVAL_REQUIRED|EXECUTING|VERIFYING|RESOLVED|CLOSED
?service=<service-name>
?severity=LOW|MEDIUM|HIGH|CRITICAL
?limit=20
?offset=0
?sort_by=created_at|severity|status
```

**Response:**
```json
{
    "total": 42,
    "limit": 20,
    "offset": 0,
    "incidents": [
        {
            "id": "INC-2026-001",
            "title": "Checkout error spike",
            "service": "checkout-service",
            "severity": "HIGH",
            "status": "VERIFYING",
            "created_at": "2026-08-16T10:31:00Z",
            "agent_status": "In progress"
        }
    ]
}
```

---

#### GET /api/incidents/{id}
Get incident details

**Response:**
```json
{
    "id": "INC-2026-001",
    "title": "Checkout service error spike",
    "service": "checkout-service",
    "severity": "HIGH",
    "status": "VERIFYING",
    "description": "Error rate increased from 2% to 31%",
    "created_at": "2026-08-16T10:31:00Z",
    "created_by": "grafana-alerting",
    "estimated_impact": "Customers cannot checkout",
    "affected_users": "~15,000",
    "current_phase": "Verification",
    "root_cause": {
        "hypothesis": "Deployment 102 introduced payment timeout issue",
        "confidence": 0.91,
        "evidence_count": 4
    },
    "proposed_action": {
        "type": "ROLLBACK",
        "description": "Rollback checkout-service from 4.2.1 to 4.2.0",
        "risk_level": "HIGH",
        "approval_status": "APPROVED"
    }
}
```

---

### Investigation

#### POST /api/incidents/{id}/investigate
Start investigation (triggers agent)

**Request:**
```json
{
    "strategy": "AUTOMATIC",  // or MANUAL
    "focus_areas": ["deployments", "metrics"],
    "hypothesis": null  // optional manual hypothesis
}
```

**Response:**
```json
{
    "incident_id": "INC-2026-001",
    "investigation_id": "INV-2026-001",
    "status": "STARTED",
    "agent_type": "incident-agent",
    "started_at": "2026-08-16T10:31:05Z"
}
```

---

#### GET /api/incidents/{id}/investigation
Get investigation status and progress

**Response:**
```json
{
    "incident_id": "INC-2026-001",
    "investigation_id": "INV-2026-001",
    "status": "INVESTIGATING",
    "phase": "ANALYZING_EVIDENCE",
    "progress": {
        "evidence_collected": 4,
        "evidence_total": 4,
        "hypothesis_confidence": 0.87
    },
    "agent_reasoning": "Strong correlation between deployment and error spike. Analyzing code changes...",
    "last_update": "2026-08-16T10:31:35Z"
}
```

---

#### GET /api/incidents/{id}/timeline
Get execution timeline (real-time updates)

**Response:**
```json
{
    "incident_id": "INC-2026-001",
    "events": [
        {
            "timestamp": "2026-08-16T10:31:02Z",
            "event_type": "INVESTIGATION_STARTED",
            "description": "Agent began investigating incident",
            "phase": "INITIAL"
        },
        {
            "timestamp": "2026-08-16T10:31:07Z",
            "event_type": "TOOL_CALL",
            "description": "Querying Grafana for error rate timeline",
            "tool": "grafana",
            "tool_call_id": "tc-001"
        },
        {
            "timestamp": "2026-08-16T10:31:09Z",
            "event_type": "TOOL_RESULT",
            "description": "Error rate data received: 2% → 31%",
            "tool": "grafana",
            "result_summary": "Sharp increase at 10:30"
        },
        {
            "timestamp": "2026-08-16T10:31:15Z",
            "event_type": "TOOL_CALL",
            "description": "Analyzing logs for payment timeouts",
            "tool": "postgres",
            "tool_call_id": "tc-002"
        },
        {
            "timestamp": "2026-08-16T10:31:20Z",
            "event_type": "HYPOTHESIS_FORMED",
            "description": "Deployment 102 likely caused the issue",
            "confidence": 0.87
        },
        {
            "timestamp": "2026-08-16T10:31:25Z",
            "event_type": "SANDBOX_EXECUTION",
            "description": "Running diagnostic script to validate hypothesis",
            "sandbox_id": "sbx-001"
        },
        {
            "timestamp": "2026-08-16T10:31:30Z",
            "event_type": "APPROVAL_REQUESTED",
            "description": "Agent requesting approval to rollback deployment",
            "action": "Rollback deployment-102",
            "approval_id": "apr-001"
        }
    ]
}
```

**WebSocket Support (Optional):**
```
ws://localhost:8000/ws/incidents/{id}/timeline
// Real-time event streaming
```

---

### Approvals

#### GET /api/approvals/pending
List pending approval requests

**Response:**
```json
{
    "total": 1,
    "approvals": [
        {
            "id": "apr-001",
            "incident_id": "INC-2026-001",
            "action": "Rollback checkout-service from 4.2.1 to 4.2.0",
            "risk_level": "HIGH",
            "confidence": 0.91,
            "requested_at": "2026-08-16T10:31:40Z",
            "expires_at": "2026-08-16T10:33:40Z",
            "summary": "Strong evidence indicates deployment-102 caused payment timeout spike",
            "evidence_count": 4
        }
    ]
}
```

---

#### GET /api/approvals/{id}
Get approval request details

**Response:**
```json
{
    "id": "apr-001",
    "incident_id": "INC-2026-001",
    "action": "Rollback checkout-service from 4.2.1 to 4.2.0",
    "description": "Roll back deployment-102",
    "risk_level": "HIGH",
    "confidence": 0.91,
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
    "reversibility": "FULLY_REVERSIBLE",
    "estimated_downtime": "< 2 minutes",
    "verification_plan": "Monitor error rate for 10 minutes post-rollback",
    "alternatives": [
        {
            "option": "Scale service",
            "feasibility": "POSSIBLE",
            "timeline": "15 minutes"
        }
    ],
    "requested_at": "2026-08-16T10:31:40Z",
    "expires_at": "2026-08-16T10:33:40Z",
    "status": "PENDING"
}
```

---

#### POST /api/approvals/{id}/approve
Approve an action

**Request:**
```json
{
    "approved_by": "engineer@company.com",
    "approval_reason": "Evidence is compelling. Deployment correlation is clear.",
    "override_risk": false
}
```

**Response:**
```json
{
    "id": "apr-001",
    "incident_id": "INC-2026-001",
    "status": "APPROVED",
    "approved_at": "2026-08-16T10:31:50Z",
    "approved_by": "engineer@company.com"
}
```

---

#### POST /api/approvals/{id}/reject
Reject an action

**Request:**
```json
{
    "rejected_by": "engineer@company.com",
    "rejection_reason": "Need to investigate more before rolling back",
    "suggested_alternative": "Scale service first to mitigate impact"
}
```

**Response:**
```json
{
    "id": "apr-001",
    "incident_id": "INC-2026-001",
    "status": "REJECTED",
    "rejected_at": "2026-08-16T10:31:50Z",
    "rejected_by": "engineer@company.com"
}
```

---

### Reports

#### GET /api/incidents/{id}/report
Get final incident report

**Response:**
```json
{
    "incident_id": "INC-2026-001",
    "title": "Checkout service error spike",
    "service": "checkout-service",
    "severity": "HIGH",
    "duration_minutes": 14,
    "detected_at": "2026-08-16T10:30:00Z",
    "resolved_at": "2026-08-16T10:44:00Z",
    "root_cause": {
        "description": "Deployment 102 introduced a payment timeout issue",
        "confidence": 0.91,
        "evidence": [
            "Error rate increased 31% within 2 minutes of deployment",
            "PaymentTimeoutException frequency increased 1,360%",
            "GitHub PR #8421 modified timeout handling",
            "Sandbox analysis confirmed 91% correlation"
        ]
    },
    "remediation": {
        "action": "Rollback deployment-102",
        "executed_at": "2026-08-16T10:32:00Z",
        "execution_time_seconds": 25,
        "approval": {
            "requested_at": "2026-08-16T10:31:40Z",
            "approved_at": "2026-08-16T10:31:50Z",
            "approved_by": "engineer@company.com"
        }
    },
    "verification": {
        "verified_at": "2026-08-16T10:44:00Z",
        "metrics": {
            "error_rate": {
                "before": "31%",
                "during": "14%",
                "after": "2.3%",
                "recovery_time_minutes": 12
            },
            "timeout_rate": {
                "before": "175 per min",
                "after": "15 per min"
            }
        },
        "status": "RECOVERED"
    },
    "agent_summary": "OpsForge identified the root cause through multi-source evidence correlation and successfully validated and executed the remediation action.",
    "generated_at": "2026-08-16T10:44:00Z"
}
```

---

#### POST /api/incidents/{id}/report/export
Export report in specified format

**Request:**
```json
{
    "format": "PDF|MARKDOWN|JSON|HTML"
}
```

**Response:** Document in requested format

---

### Tools & Capabilities

#### GET /api/tools
List available tools

**Response:**
```json
{
    "tools": [
        {
            "name": "github",
            "display_name": "GitHub",
            "status": "ACTIVE",
            "capabilities": [
                "get_repository_info",
                "get_recent_commits",
                "get_pull_request",
                "search_commits",
                "get_deployment_history"
            ],
            "last_check": "2026-08-16T10:30:00Z"
        },
        {
            "name": "grafana",
            "display_name": "Grafana",
            "status": "ACTIVE",
            "capabilities": [
                "query_metrics",
                "get_dashboard",
                "query_logs",
                "get_alert_history",
                "compare_metrics"
            ],
            "last_check": "2026-08-16T10:30:05Z"
        },
        {
            "name": "postgres",
            "display_name": "PostgreSQL",
            "status": "ACTIVE",
            "capabilities": [
                "execute_query",
                "get_table_schema",
                "get_slow_queries",
                "analyze_data"
            ],
            "last_check": "2026-08-16T10:30:10Z"
        }
    ]
}
```

---

#### GET /api/tools/{name}/status
Check tool status

**Response:**
```json
{
    "name": "github",
    "status": "ACTIVE",
    "last_check": "2026-08-16T10:30:00Z",
    "latency_ms": 145,
    "error_rate": 0.0,
    "available_quota": 4500
}
```

---

### Sessions

#### GET /api/sessions/{id}
Get agent session details

**Response:**
```json
{
    "id": "sess-2026-001",
    "incident_id": "INC-2026-001",
    "agent_type": "incident-agent",
    "status": "ACTIVE",
    "created_at": "2026-08-16T10:31:00Z",
    "tool_calls_count": 8,
    "sandbox_executions": 1,
    "duration_seconds": 45,
    "messages": [
        {
            "role": "AGENT",
            "content": "Investigating checkout service error spike...",
            "timestamp": "2026-08-16T10:31:05Z"
        }
    ]
}
```

---

## Error Responses

### Standard Error Format

```json
{
    "error": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
        "field": "value"
    },
    "timestamp": "2026-08-16T10:31:00Z"
}
```

### Common Error Codes

| Code | HTTP | Description |
|------|------|-----------|
| INCIDENT_NOT_FOUND | 404 | Incident does not exist |
| APPROVAL_NOT_FOUND | 404 | Approval request not found |
| INVALID_REQUEST | 400 | Request validation failed |
| UNAUTHORIZED | 401 | Authentication required |
| FORBIDDEN | 403 | Permission denied |
| CONFLICT | 409 | Incident state conflict |
| TOOL_UNAVAILABLE | 503 | MCP tool not responding |
| SANDBOX_ERROR | 500 | Sandbox execution failed |
| INTERNAL_ERROR | 500 | Internal server error |

---

## Authentication

**Header Format:**
```
Authorization: Bearer <jwt_token>
```

**Claims (TBD):**
```json
{
    "sub": "user_id",
    "email": "user@company.com",
    "role": "engineer|admin",
    "exp": 1629129600
}
```

---

## Rate Limiting

Planned rate limits (TBD):
- 100 requests per minute per user
- 1,000 requests per minute per API key
- Tool quota limits per service

---

**Version:** 1.0  
**Last Updated:** 2026-08-16
