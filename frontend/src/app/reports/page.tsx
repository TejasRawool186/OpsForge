"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileText, Download, CheckCircle2, ArrowRight } from "lucide-react";

export default function ReportsPage() {
  const reports = [
    {
      id: "PM-2026-8804",
      incidentId: "INC-2026-8804",
      title: "Auth Service JWT Key Rotation Cache Staleness",
      date: "August 26, 2026",
      impact: "12 mins intermittent auth failures (142 affected sessions)",
      rootCause: "Cached JWKS public key was not invalidated during KMS key rotation.",
      status: "COMPLETED",
    },
    {
      id: "PM-2026-8799",
      incidentId: "INC-2026-8799",
      title: "Order Ingestion Queue RabbitMQ Unacknowledged Message Saturation",
      date: "August 24, 2026",
      impact: "Order processing lag reached 450s before consumer pool auto-scaled",
      rootCause: "Consumer heartbeat timeout triggered false redeliveries in cluster.",
      status: "COMPLETED",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
            <FileText className="h-5 w-5 text-zinc-300" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
            Incident Post-Mortems & Reports Archive
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Auto-generated SRE root-cause analysis, timeline logs, and permanent preventive actions.
        </p>
      </div>

      <div className="space-y-4">
        {reports.map((report) => (
          <Card key={report.id} className="border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-750 transition-all shadow-sm">
            <CardHeader className="pb-3 border-zinc-800/60">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-medium text-zinc-200 px-2.5 py-0.5 rounded bg-zinc-800 border border-zinc-700">
                    {report.id}
                  </span>
                  <span className="font-mono text-xs text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                    {report.incidentId}
                  </span>
                </div>
                <span className="text-xs font-mono text-zinc-400">{report.date}</span>
              </div>
              <CardTitle className="text-base text-zinc-100 mt-1.5">
                {report.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-1">
              <div className="text-xs text-zinc-300">
                <span className="text-zinc-400 font-mono">Impact: </span>
                {report.impact}
              </div>
              <div className="text-xs text-zinc-300">
                <span className="text-zinc-400 font-mono">Root Cause: </span>
                {report.rootCause}
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/60">
                <Button variant="outline" size="sm" className="font-mono text-xs gap-1.5">
                  <Download className="h-3.5 w-3.5" />
                  Export PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
