---
name: post-mortem-report
description: Automated protocol for compiling post-remediation evidence, metric verification traces, root-cause timelines, and blameless incident post-mortem documentation.
---

# OpsForge Post-Mortem & Runbook Generation Skill

This skill defines the standardized protocol for generating blameless post-mortem reports and automated runbook entries following incident resolution.

## Phase 1: Data Collection & Timeline Construction
1. Query full incident audit timeline including alert triggers, subagent evidence payloads, sandbox execution logs, and human approval timestamps.
2. Extract baseline vs. peak error rates, latency metrics (p95/p99), and total duration from alert to resolution (MTTR).

## Phase 2: Root Cause & Impact Analysis
1. Formalize primary root cause statement based on aggregated agent hypothesis and sandboxed diagnostic results.
2. Quantify incident impact:
   - Affected services and endpoints
   - Percentage of impacted user requests
   - Financial or SLA error budget consumption

## Phase 3: Post-Remediation Verification Trace
1. Record post-fix telemetry verification scores proving metric recovery.
2. Verify system health indicators return to green status prior to final post-mortem sign-off.

## Phase 4: Action Items & Prevention Runbook
1. Generate prioritized preventative action items (P0 to P3).
2. Format reusable runbook step for future automatic remediation by OpsForge agents.
