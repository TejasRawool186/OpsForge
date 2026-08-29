import * as React from "react";
import { BarChart2, Disc, FlaskConical, Check, AlertTriangle } from "lucide-react";
import { Incident, Approval } from "@/types";

interface IncidentSummaryCardsProps {
  incidents: Incident[];
  approvals: Approval[];
}

export const IncidentSummaryCards: React.FC<IncidentSummaryCardsProps> = ({
  incidents = [],
  approvals = [],
}) => {
  const totalCount = incidents.length;
  const openCount = incidents.filter((i) => i.status !== "RESOLVED" && i.status !== "CLOSED").length;
  const testingCount = approvals.filter((a) => a.status === "PENDING").length;
  const resolvedCount = incidents.filter((i) => i.status === "RESOLVED").length;
  const overdueCount = incidents.filter((i) => i.severity === "CRITICAL" && i.status !== "RESOLVED").length;

  // Compute live sub-metrics
  const activeProjectsCount = new Set(incidents.map((i) => i.service).filter(Boolean)).size;
  const unassignedCount = incidents.filter((i) => !i.assigned_subagent || i.assigned_subagent === "Unassigned").length;
  
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const issuesThisWeek = incidents.filter((i) => {
    if (!i.created_at) return false;
    return new Date(i.created_at) >= oneWeekAgo;
  }).length;

  const cards = [
    {
      title: "Total Issues",
      value: totalCount,
      stripeColor: "border-l-[#3b82f6]",
      icon: BarChart2,
    },
    {
      title: "Open",
      value: openCount,
      stripeColor: "border-l-[#f3f4f6]",
      icon: Disc,
    },
    {
      title: "Testing",
      value: testingCount,
      stripeColor: "border-l-[#eab308]",
      icon: FlaskConical,
    },
    {
      title: "Resolved",
      value: resolvedCount,
      stripeColor: "border-l-[#10b981]",
      icon: Check,
    },
    {
      title: "Overdue",
      value: overdueCount,
      stripeColor: "border-l-[#ef4444]",
      icon: AlertTriangle,
    },
  ];

  return (
    <div className="space-y-4">
      {/* 5 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`bg-card border border-border border-l-4 ${card.stripeColor} rounded-2xl p-5 flex items-start justify-between shadow-card hover:border-muted-foreground/30 transition-all`}
            >
              <div>
                <div className="text-2xl font-bold text-foreground tracking-tight">
                  {card.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                  {card.title}
                </p>
              </div>
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
          );
        })}
      </div>

      {/* Sub-metric Stats Ribbon */}
      <div className="bg-card border border-border rounded-2xl py-3.5 px-6 flex flex-wrap items-center justify-between gap-4 text-xs shadow-card">
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground text-sm">{totalCount > 0 ? 1 : 0}</span>
          <span className="text-muted-foreground font-medium">Active Users</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground text-sm">{activeProjectsCount}</span>
          <span className="text-muted-foreground font-medium">Active Services</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground text-sm">{issuesThisWeek}</span>
          <span className="text-muted-foreground font-medium">Issues This Week</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-foreground text-sm">{unassignedCount}</span>
          <span className="text-muted-foreground font-medium">Unassigned</span>
        </div>
      </div>
    </div>
  );
};
