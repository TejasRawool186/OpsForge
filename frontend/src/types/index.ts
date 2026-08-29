export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type IncidentStatus =
  | "CREATED"
  | "DETECTED"
  | "INVESTIGATING"
  | "ROOT_CAUSE_IDENTIFIED"
  | "APPROVAL_REQUIRED"
  | "REMEDIATING"
  | "VERIFYING"
  | "RESOLVED"
  | "CLOSED";

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "TIMED_OUT" | "CANCELLED";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "DESTRUCTIVE" | "LEVEL_0" | "LEVEL_1" | "LEVEL_2" | "LEVEL_3";

export interface RootCauseInfo {
  hypothesis?: string | null;
  confidence?: number | null;
  evidence_count?: number | null;
}

export interface ProposedActionInfo {
  type?: string | null;
  description?: string | null;
  risk_level?: string | null;
  approval_status?: string | null;
}

export interface Incident {
  id: string;
  title: string;
  description?: string | null;
  severity: Severity | string;
  status: IncidentStatus | string;
  service: string;
  environment?: string | null;
  source?: string | null;
  source_id?: string | null;
  alert_source?: string | null;
  alert_id?: string | null;
  assigned_subagent?: string | null;
  agent_status?: string | null;
  current_phase?: string | null;
  estimated_impact?: string | null;
  affected_users?: number | null;
  error_message?: string | null;
  metadata_json?: Record<string, any> | null;
  created_at: string;
  updated_at?: string | null;
  resolved_at?: string | null;
  root_cause?: RootCauseInfo | null;
  proposed_action?: ProposedActionInfo | null;
}

export interface IncidentEvent {
  id: number | string;
  incident_id: string;
  event_type: string;
  timestamp: string;
  tool?: string | null;
  tool_call_id?: string | null;
  description?: string;
  summary?: string;
  result_summary?: string | null;
  phase?: string | null;
  confidence?: number | null;
  confidence_score?: number | null;
  sandbox_id?: string | null;
  approval_id?: string | null;
  details?: Record<string, any> | null;
  data?: Record<string, any> | null;
}

export interface Investigation {
  id: string;
  incident_id: string;
  status: "ACTIVE" | "COMPLETED" | "FAILED" | "PAUSED" | string;
  agent_id?: string;
  root_cause_hypothesis?: string | null;
  confidence_score?: number | null;
  evidence?: Record<string, any> | null;
  suggested_action?: string | null;
  suggested_action_risk?: RiskLevel | null;
  started_at?: string;
  completed_at?: string | null;
  iteration_count?: number;
}

export interface Approval {
  id: string;
  incident_id: string;
  investigation_id?: string | null;
  action?: string;
  action_type?: string;
  action_description?: string;
  description?: string;
  summary?: string;
  risk_level: RiskLevel | string;
  confidence?: number;
  parameters?: Record<string, any> | null;
  status: ApprovalStatus | string;
  requested_by_agent?: string;
  requested_at: string;
  expires_at?: string;
  evidence_count?: number;
  approved_by?: string | null;
  approved_at?: string | null;
  rejected_by?: string | null;
  rejected_at?: string | null;
  decision_reason?: string | null;
  decision_by?: string | null;
  decision_at?: string | null;
}

export interface ToolRegistry {
  id?: number | string;
  name: string;
  display_name?: string | null;
  description?: string | null;
  mcp_server?: string;
  tool_type?: "READ_ONLY" | "DIAGNOSTIC" | "REMEDIATION" | string;
  requires_approval?: boolean;
  status: "ACTIVE" | "DEGRADED" | "OFFLINE" | string;
  avg_latency_ms?: number;
  latency_ms?: number;
  error_rate?: number;
  last_health_check?: string;
  last_check?: string;
  capabilities?: string[];
}

export interface RemediationLog {
  id: number | string;
  incident_id: string;
  approval_id?: string | null;
  action_type: string;
  command_executed?: string | null;
  parameters?: Record<string, any> | null;
  execution_status: "SUCCESS" | "FAILED" | "IN_PROGRESS" | string;
  output?: string | null;
  executed_at: string;
  duration_ms?: number | null;
  verification_status?: "PASSED" | "FAILED" | "PENDING" | string;
  pre_metric_val?: number | null;
  post_metric_val?: number | null;
}

export interface UserIntegration {
  id: string;
  user_id: string;
  tool_name: "github" | "grafana" | "postgres" | string;
  display_name: string;
  config: Record<string, any>;
  status: "CONNECTED" | "ERROR" | "UNTESTED" | string;
  last_tested_at?: string | null;
  error_message?: string | null;
  created_at?: string;
  updated_at?: string;
  has_credentials?: boolean;
}

export interface IntegrationTestResult {
  tool_name: string;
  status: "CONNECTED" | "ERROR" | "UNTESTED" | string;
  message: string;
  details?: Record<string, any>;
}

