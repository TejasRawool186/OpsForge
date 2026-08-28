---
name: incident-triage
description: Standard operating procedure for autonomous incident investigation, subagent delegation, root-cause hypothesis generation, and safety-gated remediation.
---

# OpsForge Incident Triage & Response Skill

This skill provides step-by-step instructions for TrueForge incident agents to investigate production incidents, query metrics, delegate tasks to subagents, form hypotheses, execute diagnostic code in a sandbox, and request human safety approvals.

## Phase 1: Incident Parsing & Initial Assessment
1. Read the incident report parameters (Service, Severity, Error Spike, Timestamp).
2. Establish baseline context and target metrics window (30 minutes prior to incident vs. 30 minutes post-incident).
3. Set initial incident state to `INVESTIGATING`.

## Phase 2: Parallel Subagent Delegation
Delegate specialized domain investigations to parallel subagents:
- **Metrics Agent**: Execute `grafana.query_metrics` to calculate error rate percentage jump and latency degradation (p95/p99).
- **Log Agent**: Query application error logs for exception patterns (e.g. `PaymentTimeoutException`, `DBConnectionPoolExhausted`).
- **Git Agent**: Query `github.get_recent_deployments` and `github.get_diff` for recent commits within the 15-minute window preceding the incident.

## Phase 3: Evidence Aggregation & Hypothesis Formation
1. Correlate metrics jump with recent deployment timestamps and error log exception spikes.
2. Calculate hypothesis confidence score (0.0 to 1.0) using data-driven evidence weighting:
   - Data metric correlation: +0.35
   - Exception trace evidence: +0.35
   - Commit / Deployment alignment: +0.25
3. If confidence >= 0.85, set root cause candidate (e.g., "Deployment #102 introduced connection timeout bug in checkout-service").

## Phase 4: Sandboxed Diagnostic Execution
1. Generate diagnostic Python script to isolate the issue.
2. Submit script to **Daytona Sandbox** tool for safe execution.
3. Validate output metrics against expectations.

## Phase 5: Safety Classification & Approval Gate
Determine remediation action and classify risk level:
- **Level 0 (SAFE)**: Read-only diagnostics, cache flush, log level adjustment -> `Auto-Execute`.
- **Level 1 (LOW)**: Minor config tweak -> `Auto-Execute`.
- **Level 2 (HIGH)**: Deployment rollback, scaling up replicas -> `APPROVAL_REQUIRED`.
- **Level 3 (DESTRUCTIVE)**: DB index rebuild, table truncation, service restart -> `APPROVAL_REQUIRED`.

When risk is Level 2 or Level 3:
- Generate approval payload with root-cause evidence, parameters, and risk score.
- Submit to OpsForge Safety Gate queue (`/approvals`).
- Pause execution until human SRE decision (`APPROVED` or `REJECTED`).

## Phase 6: Verification & Post-Mortem Generation
1. Upon execution of approved action, verify post-remediation metrics return to baseline.
2. Generate comprehensive Post-Mortem report (Markdown, JSON, PDF).
3. Mark incident state as `RESOLVED`.
