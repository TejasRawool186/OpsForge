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
            placeholder="Search issues, projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="h-4 w-4 text-muted-foreground" />}
            className="rounded-xl bg-card border-border text-xs h-10 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters:</span>
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-36 text-xs h-10 rounded-xl bg-card border-border shadow-sm text-foreground"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="APPROVAL_REQUIRED">Needs Approval</option>
            <option value="RESOLVED">Resolved</option>
          </Select>

          <Select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-32 text-xs h-10 rounded-xl bg-card border-border shadow-sm text-foreground"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical (P1)</option>
            <option value="HIGH">High (P2)</option>
            <option value="MEDIUM">Medium (P3)</option>
            <option value="LOW">Low (P4)</option>
          </Select>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-card">
              <TableHead className="w-32 text-muted-foreground font-medium text-xs">ID</TableHead>
              <TableHead className="text-muted-foreground font-medium text-xs">Title & Summary</TableHead>
              <TableHead className="w-28 text-muted-foreground font-medium text-xs">Priority</TableHead>
              <TableHead className="w-40 text-muted-foreground font-medium text-xs">Status</TableHead>
              <TableHead className="w-36 text-muted-foreground font-medium text-xs">Project / Service</TableHead>
              <TableHead className="w-44 text-muted-foreground font-medium text-xs">Assignee / Agent</TableHead>
              <TableHead className="w-36 text-muted-foreground font-medium text-xs">Created</TableHead>
              <TableHead className="w-20 text-right text-muted-foreground font-medium text-xs">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIncidents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                  No issues or incidents found matching your filter criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredIncidents.map((incident) => (
                <TableRow key={incident.id} className="group border-b border-border hover:bg-muted/50">
                  <TableCell className="font-mono text-xs font-semibold text-foreground">
                    <Link
                      href={`/incidents/${incident.id}`}
                      className="hover:underline hover:text-white flex items-center gap-1"
                    >
                      {incident.id}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col max-w-md">
                      <Link
                        href={`/incidents/${incident.id}`}
                        className="font-medium text-foreground hover:text-white transition-colors line-clamp-1 text-xs sm:text-sm"
                      >
                        {incident.title}
                      </Link>
                      {incident.error_message && (
                        <span className="text-[11px] text-muted-foreground font-mono line-clamp-1 mt-0.5">
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
                    <span className="text-xs text-foreground bg-muted px-2.5 py-1 rounded-lg border border-border">
                      {incident.service}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs text-foreground">
                      <div className="h-5 w-5 rounded-full bg-zinc-800 text-zinc-200 border border-zinc-700 flex items-center justify-center font-bold text-[10px]">
                        {(incident.assigned_subagent || "A").charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate">{incident.assigned_subagent || "Supervisor"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[11px] text-muted-foreground font-mono">
                    {formatDate(incident.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/incidents/${incident.id}`}
                      className="inline-flex items-center justify-center p-1.5 rounded-lg bg-muted hover:bg-foreground hover:text-background text-muted-foreground transition-colors"
                      title="Open Issue Workspace"
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
