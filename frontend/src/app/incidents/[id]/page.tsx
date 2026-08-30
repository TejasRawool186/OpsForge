"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Incident, IncidentEvent } from "@/types";
import { SeverityBadge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Activity,
  Cpu,
  Clock,
  CheckCircle2,
  FileText,
  Wrench,
  Brain,
  ShieldCheck,
  AlertCircle,
  Terminal,
} from "lucide-react";

export default function IncidentWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const incidentId = typeof params.id === "string" ? params.id : "";

  const [incident, setIncident] = React.useState<Incident | null>(null);
  const [timeline, setTimeline] = React.useState<IncidentEvent[]>([]);
  const [activeTab, setActiveTab] = React.useState("timeline");
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadIncident() {
      setIsLoading(true);
      try {
        const [inc, events] = await Promise.all([
          api.getIncidentById(incidentId),
          api.getIncidentTimeline(incidentId),
        ]);
        setIncident(inc);
        setTimeline(events);
      } catch (err) {
        console.error("Failed to load incident:", err);
      } finally {
        setIsLoading(false);
      }
    }
    if (incidentId) loadIncident();
  }, [incidentId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-zinc-400 border-t-transparent animate-spin" />
          <p className="text-xs font-mono text-zinc-400">Loading Incident Workspace...</p>
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="h-12 w-12 text-zinc-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-zinc-100">Incident Not Found</h2>
        <p className="text-xs text-zinc-400 mt-1">
          No incident matching ID {incidentId} was located.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/incidents")}
          className="mt-4 text-xs"
        >
          Return to Incidents
        </Button>
      </div>
    );
  }

  const tabs = [
    { id: "timeline", label: "Live Investigation Timeline", icon: <Clock className="h-3.5 w-3.5" />, count: timeline.length },
    { id: "hypothesis", label: "Agent Reasoning & Evidence", icon: <Brain className="h-3.5 w-3.5" /> },
    { id: "tools", label: "Tool Executions & Sandbox", icon: <Wrench className="h-3.5 w-3.5" /> },
    { id: "approvals", label: "Safety Gate Approvals", icon: <ShieldCheck className="h-3.5 w-3.5" /> },
    { id: "postmortem", label: "Post-Mortem & Runbook", icon: <FileText className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Back button & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/incidents")}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Dashboard
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Status:</span>
          <StatusBadge status={incident.status} />
        </div>
      </div>

      {/* Incident Header Workspace Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className="font-mono text-xs font-bold text-foreground px-2.5 py-1 rounded-lg bg-muted border border-border">
                {incident.id}
              </span>
              <SeverityBadge severity={incident.severity} />
              <span className="text-xs text-foreground bg-muted px-2.5 py-1 rounded-lg border border-border font-mono">
                {incident.service}
              </span>
              <span className="text-xs text-muted-foreground bg-background px-2.5 py-1 rounded-lg border border-border font-mono">
                {incident.environment}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
              {incident.title}
            </h1>
            {incident.description && (
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-4xl">
                {incident.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto">
            {incident.status === "APPROVAL_REQUIRED" && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push("/approvals")}
                className="text-xs gap-1.5 rounded-xl font-mono"
              >
                <ShieldCheck className="h-4 w-4" />
                Review Safety Gate
              </Button>
            )}
          </div>
        </div>

        {/* Telemetry bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border text-xs">
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Assigned Agent</span>
            <div className="flex items-center gap-1.5 text-foreground mt-0.5 font-medium">
              <Cpu className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{incident.assigned_subagent || "TrueForge Supervisor"}</span>
            </div>
          </div>

          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Alert Source</span>
            <span className="text-foreground block mt-0.5 font-medium">{incident.source}</span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Detected At</span>
            <span className="text-foreground block mt-0.5 font-medium font-mono">{formatDate(incident.created_at)}</span>
          </div>

          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Confidence</span>
            <span className="text-zinc-200 block mt-0.5 font-medium font-mono">94% Confidence</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Contents */}
      <div className="space-y-4">
        {/* Tab 1: Live Timeline */}
        {activeTab === "timeline" && (
          <Card>
            <CardHeader>
              <CardTitle>
                <Clock className="h-4 w-4 text-zinc-400" />
                Real-Time Investigation Timeline & Telemetry Trace
              </CardTitle>
              <CardDescription>
                Chronological sequence of autonomous subagent observations, tool executions, and hypotheses.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative border-l-2 border-zinc-800 ml-4 pl-6 space-y-6">
                {timeline.map((event) => (
                  <div key={event.id} className="relative group">
                    {/* Dot */}
                    <div className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full bg-zinc-900 border-2 border-zinc-500 group-hover:bg-zinc-300 transition-colors" />

                    <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 shadow-sm space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium uppercase bg-zinc-800 text-zinc-200 border border-zinc-700">
                            {event.event_type}
                          </span>
                          {event.tool && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                              {event.tool}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-zinc-400">
                          {formatDate(event.timestamp)}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-zinc-200 font-normal leading-relaxed">
                        {event.summary}
                      </p>

                      {event.details && (
                        <pre className="p-2.5 rounded bg-zinc-900/90 border border-zinc-800 text-[11px] font-mono text-zinc-300 overflow-x-auto">
                          {JSON.stringify(event.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab 2: Hypothesis & Evidence */}
        {activeTab === "hypothesis" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  <Brain className="h-4 w-4 text-zinc-400" />
                  Root Cause Hypothesis & Analysis
                </CardTitle>
                <CardDescription>
                  Formulated by TrueForge Agent based on commit diffs and database connection metrics.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-zinc-900/70 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-medium uppercase text-zinc-300">
                      Hypothesis #1 (Primary)
                    </span>
                    <span className="text-xs font-mono font-medium text-zinc-200 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                      94% Confidence
                    </span>
                  </div>
                  <p className="text-xs text-zinc-200 leading-relaxed">
                    Deployment <strong>checkout-v2.14.0</strong> introduced unreleased database connection handles in order processing loop, exhausting QueuePool (max 20 + 10 overflow) within 15 minutes under standard peak traffic.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2">
                  <span className="text-xs font-mono text-zinc-400 uppercase">Recommended Remediation Action</span>
                  <p className="text-xs text-zinc-200 font-medium">
                    Execute Kubernetes deployment rollback to previous stable image tag <code>checkout-v2.13.9</code>.
                  </p>
                  <span className="inline-block text-[11px] font-mono text-zinc-300 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    Risk Level 3 (Rollback) — Requires SRE Approval
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  <Terminal className="h-4 w-4 text-zinc-400" />
                  Correlated Telemetry Evidence
                </CardTitle>
                <CardDescription>
                  Multi-source telemetry aggregated across GitHub MCP, Grafana MCP, and Postgres.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 overflow-x-auto leading-relaxed">
{`{
  "github": {
    "release": "checkout-v2.14.0",
    "commit_hash": "8e49b1a",
    "author": "jdoe@company.com",
    "changed_files": ["app/services/checkout.py", "app/db/session.py"]
  },
  "grafana_promql": {
    "query": "rate(http_requests_total{status=~'5..'}[5m])",
    "pre_deploy_error_pct": 0.04,
    "post_deploy_error_pct": 18.42
  },
  "postgres_diagnostic": {
    "active_connections": 30,
    "max_pool_size": 20,
    "pool_overflow": 10,
    "waiting_requests": 142
  }
}`}
                </pre>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab 3: Tools */}
        {activeTab === "tools" && (
          <Card>
            <CardHeader>
              <CardTitle>
                <Wrench className="h-4 w-4 text-zinc-400" />
                Executed MCP Tools & Diagnostic Scripts
              </CardTitle>
              <CardDescription>
                Auditable log of all tools and sandbox code executed during this incident.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-medium text-zinc-200">github_deployment_inspector</span>
                    <p className="text-zinc-400 text-[11px] mt-0.5">Fetched deployments from GitHub MCP server</p>
                  </div>
                  <span className="font-mono text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                    200 OK (184ms)
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-medium text-zinc-200">grafana_metrics_query</span>
                    <p className="text-zinc-400 text-[11px] mt-0.5">Queried 5xx error rate and connection metrics</p>
                  </div>
                  <span className="font-mono text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                    200 OK (92ms)
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-medium text-zinc-200">postgres_query_diagnostic</span>
                    <p className="text-zinc-400 text-[11px] mt-0.5">Queried pg_stat_activity for unreleased connection locks</p>
                  </div>
                  <span className="font-mono text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                    200 OK (45ms)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab 4: Approvals */}
        {activeTab === "approvals" && (
          <Card>
            <CardHeader>
              <CardTitle>
                <ShieldCheck className="h-4 w-4 text-zinc-400" />
                Human Safety Gate Approvals
              </CardTitle>
              <CardDescription>
                High-risk and destructive remediation actions require explicit human SRE authorization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-medium text-zinc-300">
                    APPR-8801-01 • Level 3 Rollback Request
                  </span>
                  <span className="text-xs font-mono font-medium text-white bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                    PENDING APPROVAL
                  </span>
                </div>
                <p className="text-xs text-zinc-200">
                  Rollback deployment <code>checkout-service</code> to image tag <code>v2.13.9</code> in production cluster.
                </p>
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => router.push("/approvals")}
                    className="font-mono text-xs"
                  >
                    Open Approvals Queue & Decide
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tab 5: Post-Mortem */}
        {activeTab === "postmortem" && (
          <Card>
            <CardHeader>
              <CardTitle>
                <FileText className="h-4 w-4 text-zinc-400" />
                Auto-Generated Post-Mortem Draft
              </CardTitle>
              <CardDescription>
                Live summary of timeline, root cause, impact, and preventive action items.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none text-xs text-zinc-300 space-y-3">
                <p>
                  <strong>Executive Summary:</strong> At 18 minutes past the hour, an alert fired indicating elevated 500 error rates on the checkout service. TrueForge automated investigation identified a connection pool leak introduced in release v2.14.0.
                </p>
                <p>
                  <strong>Action Items:</strong>
                  <br />• Implement connection pool leak detector in staging integration tests.
                  <br />• Set explicit statement timeouts on checkout order transaction queries.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
