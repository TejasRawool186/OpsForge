export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type IncidentStatus = 
  | "DETECTED"
  | "INVESTIGATING"
  | "ROOT_CAUSE_IDENTIFIED"
  | "APPROVAL_REQUIRED"
  | "REMEDIATING"
  | "VERIFYING"
  | "RESOLVED"
  | "CLOSED";

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "TIMED_OUT" | "CANCELLED";

export type RiskLevel = "LEVEL_0" | "LEVEL_1" | "LEVEL_2" | "LEVEL_3";

export interface Incident {
  id: string;
  title: string;
  description: string | null;
  severity: Severity;
  status: IncidentStatus;
  service: string;
  environment: string;
  source: string;
  source_id: string | null;
  assigned_subagent: string | null;
  error_message: string | null;
  metadata_json: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface IncidentEvent {
  id: number;
  incident_id: string;
  event_type: "ALERT" | "AGENT_THOUGHT" | "TOOL_CALL" | "TOOL_RESULT" | "HYPOTHESIS" | "APPROVAL_REQUEST" | "APPROVAL_DECISION" | "REMEDIATION_EXECUTION" | "VERIFICATION" | "RESOLUTION";
  timestamp: string;
  tool: string | null;
  summary: string;
  details: Record<string, any> | null;
  confidence_score: number | null;
}

export interface Investigation {
  id: string;
  incident_id: string;
  status: "ACTIVE" | "COMPLETED" | "FAILED" | "PAUSED";
  agent_id: string;
  root_cause_hypothesis: string | null;
  confidence_score: number | null;
  evidence: Record<string, any> | null;
  suggested_action: string | null;
  suggested_action_risk: RiskLevel | null;
  started_at: string;
  completed_at: string | null;
  iteration_count: number;
}

export interface Approval {
  id: string;
  incident_id: string;
  investigation_id: string | null;
  action_type: string;
  action_description: string;
  risk_level: RiskLevel;
  parameters: Record<string, any> | null;
  status: ApprovalStatus;
  requested_by_agent: string;
  decision_by: string | null;
  decision_reason: string | null;
  decision_at: string | null;
  timeout_seconds: number;
  requested_at: string;
  expires_at: string;
}

export interface ToolRegistry {
  id: number;
  name: string;
  description: string | null;
  mcp_server: string;
  tool_type: "READ_ONLY" | "DIAGNOSTIC" | "REMEDIATION";
  requires_approval: boolean;
  status: "ACTIVE" | "DEGRADED" | "OFFLINE";
  avg_latency_ms: number;
  error_rate: number;
  last_health_check: string;
}

export interface RemediationLog {
  id: number;
  incident_id: string;
  approval_id: string | null;
  action_type: string;
  command_executed: string | null;
  parameters: Record<string, any> | null;
  execution_status: "SUCCESS" | "FAILED" | "IN_PROGRESS";
  output: string | null;
  executed_at: string;
  duration_ms: number | null;
  verification_status: "PASSED" | "FAILED" | "PENDING";
  pre_metric_val: number | null;
  post_metric_val: number | null;
}
