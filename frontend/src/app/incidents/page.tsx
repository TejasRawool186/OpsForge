"use client";

import * as React from "react";
import { IncidentSummaryCards } from "@/components/incidents/IncidentSummaryCards";
import { IncidentTable } from "@/components/incidents/IncidentTable";
import { api } from "@/lib/api";
import { Incident, Approval } from "@/types";
import { Plus, User, Folder, Pin, Activity, AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function IncidentsPage() {
  const [incidents, setIncidents] = React.useState<Incident[]>([]);
  const [approvals, setApprovals] = React.useState<Approval[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [user, setUser] = React.useState<{ full_name?: string; email?: string } | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [incList, appList] = await Promise.all([
        api.getIncidents(),
        api.getApprovals(),
      ]);
      setIncidents(incList || []);
      setApprovals(appList || []);
    } catch (err) {
      console.error("Failed to load incidents data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();

    if (typeof window !== "undefined") {
      const uStr = localStorage.getItem("opsforge_user");
      if (uStr) {
        try {
          setUser(JSON.parse(uStr));
        } catch {
          setUser(null);
        }
      }
    }
  }, []);

  const criticalCount = incidents.filter((i) => i.severity === "CRITICAL").length;
  const highCount = incidents.filter((i) => i.severity === "HIGH").length;
  const mediumCount = incidents.filter((i) => i.severity === "MEDIUM").length;
  const lowCount = incidents.filter((i) => i.severity === "LOW").length;
  const totalCount = criticalCount + highCount + mediumCount + lowCount || 1;

  // Build dynamic recent activity events from actual incidents & approvals
  const dynamicActivities = React.useMemo(() => {
    const items: Array<{
      id: string;
      actor: string;
      action: string;
      detail: string;
      date: string;
      icon: any;
    }> = [];

    incidents.forEach((inc) => {
      items.push({
        id: `inc-${inc.id}`,
        actor: user?.full_name || user?.email?.split("@")[0] || "Telemetry Agent",
        action: "Detected incident",
        detail: `${inc.title} (${inc.service})`,
        date: inc.created_at ? new Date(inc.created_at).toLocaleDateString() : "Just now",
        icon: AlertCircle,
      });
    });

    approvals.forEach((app) => {
      items.push({
        id: `app-${app.id}`,
        actor: "Autonomous Safety Gate",
        action: "Requested approval",
        detail: `${app.action_type} for incident ${app.incident_id?.substring(0, 8)}...`,
        date: (app.requested_at || app.created_at) ? new Date(app.requested_at || app.created_at!).toLocaleDateString() : "Just now",
        icon: Pin,
      });
    });

    return items.slice(0, 5);
  }, [incidents, approvals, user]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Overview of all live projects and SRE telemetry issues
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-xl bg-[#141417] border border-[#23232a] text-xs font-medium text-[#8e8e99] hover:text-white flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh Live Data
        </button>
      </div>

      {/* 5 KPI Metric Cards & Stats Ribbon */}
      <IncidentSummaryCards incidents={incidents} approvals={approvals} />

      {/* Main Grid: Priority Breakdown & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Priority Breakdown & Status Distribution */}
        <div className="lg:col-span-6 space-y-5">
          {/* Priority Breakdown Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
            <div className="mb-5">
              <h2 className="text-base font-bold text-foreground tracking-tight">
                Priority Breakdown
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Active issues by priority level
              </p>
            </div>

            <div className="space-y-4">
              {/* Critical */}
              <div className="flex items-center justify-between gap-4 text-xs font-medium">
                <div className="flex items-center gap-2 w-20 text-foreground">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <span>Critical</span>
                </div>
                <div className="flex-1 h-2 bg-[var(--track-bg)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all"
                    style={{ width: incidents.length > 0 ? `${(criticalCount / totalCount) * 100}%` : "0%" }}
                  />
                </div>
                <span className="w-5 text-right text-foreground font-bold">{criticalCount}</span>
              </div>

              {/* High */}
              <div className="flex items-center justify-between gap-4 text-xs font-medium">
                <div className="flex items-center gap-2 w-20 text-foreground">
                  <span className="h-2 w-2 rounded-full bg-orange-500" />
                  <span>High</span>
                </div>
                <div className="flex-1 h-2 bg-[var(--track-bg)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all"
                    style={{ width: incidents.length > 0 ? `${(highCount / totalCount) * 100}%` : "0%" }}
                  />
                </div>
                <span className="w-5 text-right text-foreground font-bold">{highCount}</span>
              </div>

              {/* Medium */}
              <div className="flex items-center justify-between gap-4 text-xs font-medium">
                <div className="flex items-center gap-2 w-20 text-foreground">
                  <span className="h-2 w-2 rounded-full bg-yellow-500" />
                  <span>Medium</span>
                </div>
                <div className="flex-1 h-2 bg-[var(--track-bg)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 rounded-full transition-all"
                    style={{ width: incidents.length > 0 ? `${(mediumCount / totalCount) * 100}%` : "0%" }}
                  />
                </div>
                <span className="w-5 text-right text-foreground font-bold">{mediumCount}</span>
              </div>

              {/* Low */}
              <div className="flex items-center justify-between gap-4 text-xs font-medium">
                <div className="flex items-center gap-2 w-20 text-foreground">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  <span>Low</span>
                </div>
                <div className="flex-1 h-2 bg-[var(--track-bg)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: incidents.length > 0 ? `${(lowCount / totalCount) * 100}%` : "0%" }}
                  />
                </div>
                <span className="w-5 text-right text-foreground font-bold">{lowCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="lg:col-span-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-card h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-foreground tracking-tight">
                  Recent Activity
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Latest telemetry & agent activity events
                </p>
              </div>
              <Link
                href="/reports"
                className="text-xs text-muted-foreground hover:text-foreground font-medium flex items-center gap-1 transition-colors"
              >
                View All →
              </Link>
            </div>

            <div className="divide-y divide-border flex-1 flex flex-col justify-start">
              {dynamicActivities.length > 0 ? (
                dynamicActivities.map((act) => {
                  const Icon = act.icon;
                  return (
                    <div key={act.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-start gap-3">
                        <div className="p-1 text-indigo-400 mt-0.5 bg-indigo-500/10 rounded-lg">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">
                            {act.actor} <span className="font-normal text-muted-foreground">{act.action}</span>
                          </div>
                          <p className="text-muted-foreground text-[11px] mt-0.5">
                            {act.detail}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] text-muted-foreground font-mono whitespace-nowrap">
                        {act.date}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground font-mono">
                  No activity events recorded yet. Click &quot;Simulate Incident&quot; to trigger autonomous diagnosis.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Live Issues & Incidents Table */}
      <div className="pt-2">
        <div className="mb-4">
          <h2 className="text-base font-bold text-foreground tracking-tight">
            All Issues & Incidents
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Active telemetry and automated investigation status from live database
          </p>
        </div>
        <IncidentTable incidents={incidents} />
      </div>
    </div>
  );
}
