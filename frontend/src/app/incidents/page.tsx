"use client";

import * as React from "react";
import { IncidentSummaryCards } from "@/components/incidents/IncidentSummaryCards";
import { IncidentTable } from "@/components/incidents/IncidentTable";
import { api } from "@/lib/api";
import { Incident, Approval } from "@/types";
import { Flame, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-950/60 border border-rose-800/50">
              <Flame className="h-5 w-5 text-rose-400" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Incident Command Center
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time telemetry, active subagent investigations, and human safety approval gates.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          isLoading={isLoading}
          className="self-start sm:self-auto font-mono text-xs gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <IncidentSummaryCards incidents={incidents} approvals={approvals} />

      {/* Incident List Data Grid */}
      <div className="pt-2">
        <IncidentTable incidents={incidents} />
      </div>
    </div>
  );
}
