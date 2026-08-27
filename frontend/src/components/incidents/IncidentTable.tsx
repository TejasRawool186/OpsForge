"use client";

import * as React from "react";
import Link from "next/link";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { SeverityBadge, StatusBadge } from "@/components/ui/Badge";
import { Input, Select } from "@/components/ui/Input";
import { formatDate } from "@/lib/utils";
import { Incident, Severity, IncidentStatus } from "@/types";
import { Search, Filter, ArrowUpRight, Cpu } from "lucide-react";

interface IncidentTableProps {
  incidents: Incident[];
}

export const IncidentTable: React.FC<IncidentTableProps> = ({ incidents }) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [severityFilter, setSeverityFilter] = React.useState<string>("ALL");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.service.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = severityFilter === "ALL" || inc.severity === severityFilter;
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && inc.status !== "RESOLVED" && inc.status !== "CLOSED") ||
      (statusFilter === "APPROVAL_REQUIRED" && inc.status === "APPROVAL_REQUIRED") ||
      (statusFilter === "RESOLVED" && inc.status === "RESOLVED");

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Controls / Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Filter incidents by ID, service, or issue..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters:</span>
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-36 text-xs h-9"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="APPROVAL_REQUIRED">Needs Approval</option>
            <option value="RESOLVED">Resolved</option>
          </Select>

          <Select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-32 text-xs h-9"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical (P1)</option>
            <option value="HIGH">High (P2)</option>
            <option value="MEDIUM">Medium (P3)</option>
            <option value="LOW">Low (P4)</option>
          </Select>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 overflow-hidden shadow-xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">Incident ID</TableHead>
              <TableHead>Title & Root Cause</TableHead>
              <TableHead className="w-28">Severity</TableHead>
              <TableHead className="w-40">Status</TableHead>
              <TableHead className="w-36">Service</TableHead>
              <TableHead className="w-44">Assigned Agent</TableHead>
              <TableHead className="w-36">Detected</TableHead>
              <TableHead className="w-20 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIncidents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-slate-500">
                  No incidents matching your filter criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredIncidents.map((incident) => (
                <TableRow key={incident.id} className="group">
                  <TableCell className="font-mono text-xs font-semibold text-cyan-400">
                    <Link
                      href={`/incidents/${incident.id}`}
                      className="hover:underline flex items-center gap-1"
                    >
                      {incident.id}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col max-w-md">
                      <Link
                        href={`/incidents/${incident.id}`}
                        className="font-medium text-slate-200 hover:text-cyan-300 transition-colors line-clamp-1 text-xs sm:text-sm"
                      >
                        {incident.title}
                      </Link>
                      {incident.error_message && (
                        <span className="text-[11px] text-slate-400 font-mono line-clamp-1 mt-0.5">
                          {incident.error_message}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <SeverityBadge severity={incident.severity} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={incident.status} />
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                      {incident.service}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-slate-300">
                      <Cpu className="h-3.5 w-3.5 text-cyan-400 flex-shrink-0" />
                      <span className="truncate">{incident.assigned_subagent || "Supervisor"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-[11px] text-slate-400">
                    {formatDate(incident.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/incidents/${incident.id}`}
                      className="inline-flex items-center justify-center p-1.5 rounded-lg bg-slate-800/80 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 transition-colors"
                      title="Open Incident Workspace"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
