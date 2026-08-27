"use client";

import * as React from "react";
import { IncidentSummaryCards } from "@/components/incidents/IncidentSummaryCards";
import { IncidentTable } from "@/components/incidents/IncidentTable";
import { api } from "@/lib/api";
import { Incident, Approval } from "@/types";
import { Plus, User, Folder, Pin, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function IncidentsPage() {
  const [incidents, setIncidents] = React.useState<Incident[]>([]);
  const [approvals, setApprovals] = React.useState<Approval[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [incList, appList] = await Promise.all([
        api.getIncidents(),
        api.getApprovals(),
      ]);
      setIncidents(incList);
      setApprovals(appList);
    } catch (err) {
      console.error("Failed to load incidents data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const criticalCount = incidents.filter((i) => i.severity === "CRITICAL").length || 0;
  const highCount = incidents.filter((i) => i.severity === "HIGH").length || 2;
  const mediumCount = incidents.filter((i) => i.severity === "MEDIUM").length || 0;
  const lowCount = incidents.filter((i) => i.severity === "LOW").length || 0;
  const totalCount = (criticalCount + highCount + mediumCount + lowCount) || 1;

  const activities = [
    {
      id: "1",
      icon: Plus,
      actor: "System Admin",
      action: "Created issue",
      detail: 'Created issue "issue 1" in project #5',
      date: "17/08/2026",
    },
    {
      id: "2",
      icon: User,
      actor: "System Admin",
      action: "Assigned issue",
      detail: 'Assigned issue "issue 1" to user #1',
      date: "17/08/2026",
    },
    {
      id: "3",
      icon: Folder,
      actor: "System Admin",
      action: "Created project",
      detail: 'Created project "abc"',
      date: "17/08/2026",
    },
    {
      id: "4",
      icon: Pin,
      actor: "System Admin",
      action: "user_deactivated",
      detail: 'Deactivated user "samar" (jane@test.com)',
      date: "23/07/2026",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Title Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-[#8e8e99] mt-1">
          Overview of all projects and issues
        </p>
      </div>

      {/* 5 KPI Metric Cards & Stats Ribbon */}
      <IncidentSummaryCards incidents={incidents} approvals={approvals} />

      {/* Main Grid: Priority Breakdown & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Priority Breakdown & Status Distribution */}
        <div className="lg:col-span-6 space-y-5">
          {/* Priority Breakdown Card */}
          <div className="bg-[#141417] border border-[#23232a] rounded-2xl p-6 shadow-card">
            <div className="mb-5">
              <h2 className="text-base font-bold text-white tracking-tight">
                Priority Breakdown
              </h2>
              <p className="text-xs text-[#8e8e99] mt-0.5">
                Active issues by priority level
              </p>
            </div>

            <div className="space-y-4">
              {/* Critical */}
              <div className="flex items-center justify-between gap-4 text-xs font-medium">
                <div className="flex items-center gap-2 w-20 text-[#d1d5db]">
                  <span className="h-2 w-2 rounded-full bg-white" />
                  <span>Critical</span>
                </div>
                <div className="flex-1 h-2 bg-[#1f1f26] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all"
                    style={{ width: `${(criticalCount / totalCount) * 100}%` }}
                  />
                </div>
                <span className="w-5 text-right text-white font-bold">{criticalCount}</span>
              </div>

              {/* High */}
              <div className="flex items-center justify-between gap-4 text-xs font-medium">
                <div className="flex items-center gap-2 w-20 text-[#d1d5db]">
                  <span className="h-2 w-2 rounded-full bg-white" />
                  <span>High</span>
                </div>
                <div className="flex-1 h-2 bg-[#1f1f26] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all"
                    style={{ width: "100%" }}
                  />
                </div>
                <span className="w-5 text-right text-white font-bold">{highCount}</span>
              </div>

              {/* Medium */}
              <div className="flex items-center justify-between gap-4 text-xs font-medium">
                <div className="flex items-center gap-2 w-20 text-[#d1d5db]">
                  <span className="h-2 w-2 rounded-full bg-white" />
                  <span>Medium</span>
                </div>
                <div className="flex-1 h-2 bg-[#1f1f26] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all"
                    style={{ width: `${(mediumCount / totalCount) * 100}%` }}
                  />
                </div>
                <span className="w-5 text-right text-white font-bold">{mediumCount}</span>
              </div>

              {/* Low */}
              <div className="flex items-center justify-between gap-4 text-xs font-medium">
                <div className="flex items-center gap-2 w-20 text-[#d1d5db]">
                  <span className="h-2 w-2 rounded-full bg-white" />
                  <span>Low</span>
                </div>
                <div className="flex-1 h-2 bg-[#1f1f26] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all"
                    style={{ width: `${(lowCount / totalCount) * 100}%` }}
                  />
                </div>
                <span className="w-5 text-right text-white font-bold">{lowCount}</span>
              </div>
            </div>
          </div>

          {/* Status Distribution Card */}
          <div className="bg-[#141417] border border-[#23232a] rounded-2xl p-6 shadow-card">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Status Distribution
              </h2>
              <p className="text-xs text-[#8e8e99] mt-0.5">
                Issues across all statuses
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="lg:col-span-6">
          <div className="bg-[#141417] border border-[#23232a] rounded-2xl p-6 shadow-card h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  Recent Activity
                </h2>
                <p className="text-xs text-[#8e8e99] mt-0.5">
                  Latest system events
                </p>
              </div>
              <Link
                href="/reports"
                className="text-xs text-[#8e8e99] hover:text-white font-medium flex items-center gap-1 transition-colors"
              >
                View All →
              </Link>
            </div>

            <div className="divide-y divide-[#1f1f26] flex-1 flex flex-col justify-between">
              {activities.map((act) => {
                const Icon = act.icon;
                return (
                  <div key={act.id} className="py-3.5 first:pt-2 last:pb-2 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-start gap-3">
                      <div className="p-1 text-[#8e8e99] mt-0.5">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">
                          {act.actor} <span className="font-normal text-[#d1d5db]">{act.action}</span>
                        </div>
                        <p className="text-[#8e8e99] text-[11px] mt-0.5">
                          {act.detail}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-[#71717a] font-mono whitespace-nowrap">
                      {act.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Live Issues & Incidents Table */}
      <div className="pt-2">
        <div className="mb-4">
          <h2 className="text-base font-bold text-white tracking-tight">
            All Issues & Incidents
          </h2>
          <p className="text-xs text-[#8e8e99] mt-0.5">
            Active telemetry and automated investigation status
          </p>
        </div>
        <IncidentTable incidents={incidents} />
      </div>
    </div>
  );
}
