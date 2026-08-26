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
          <div className="p-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/50">
            <FileText className="h-5 w-5 text-emerald-400" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Incident Post-Mortems & Reports Archive
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Auto-generated SRE root-cause analysis, timeline logs, and permanent preventive actions.
        </p>
      </div>

      <div className="space-y-4">
        {reports.map((report) => (
          <Card key={report.id} className="border-slate-800/80 bg-slate-900/60 hover:border-slate-700 transition-all">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/50">
                    {report.id}
                  </span>
                  <span className="font-mono text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    {report.incidentId}
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-400">{report.date}</span>
              </div>
              <CardTitle className="text-base text-white mt-1.5">
                {report.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-1">
              <div className="text-xs text-slate-300">
                <span className="text-slate-400 font-mono">Impact: </span>
                {report.impact}
              </div>
              <div className="text-xs text-slate-300">
                <span className="text-slate-400 font-mono">Root Cause: </span>
                {report.rootCause}
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
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
