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
            icon={<Search className="h-4 w-4 text-[#8e8e99]" />}
            className="rounded-xl bg-[#141417] border-[#23232a] text-xs h-10"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-[#8e8e99]">
            <Filter className="h-3.5 w-3.5" />
            <span>Filters:</span>
          </div>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-36 text-xs h-10 rounded-xl bg-[#141417] border-[#23232a]"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="APPROVAL_REQUIRED">Needs Approval</option>
            <option value="RESOLVED">Resolved</option>
          </Select>

          <Select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-32 text-xs h-10 rounded-xl bg-[#141417] border-[#23232a]"
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
      <div className="rounded-2xl border border-[#23232a] bg-[#141417] overflow-hidden shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#23232a] bg-[#141417]">
              <TableHead className="w-32 text-[#8e8e99] font-medium text-xs">ID</TableHead>
              <TableHead className="text-[#8e8e99] font-medium text-xs">Title & Summary</TableHead>
              <TableHead className="w-28 text-[#8e8e99] font-medium text-xs">Priority</TableHead>
              <TableHead className="w-40 text-[#8e8e99] font-medium text-xs">Status</TableHead>
              <TableHead className="w-36 text-[#8e8e99] font-medium text-xs">Project / Service</TableHead>
              <TableHead className="w-44 text-[#8e8e99] font-medium text-xs">Assignee / Agent</TableHead>
              <TableHead className="w-36 text-[#8e8e99] font-medium text-xs">Created</TableHead>
              <TableHead className="w-20 text-right text-[#8e8e99] font-medium text-xs">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIncidents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-10 text-[#71717a]">
                  No issues or incidents found matching your filter criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredIncidents.map((incident) => (
                <TableRow key={incident.id} className="group border-b border-[#1f1f26] hover:bg-white/[0.02]">
                  <TableCell className="font-mono text-xs font-semibold text-white">
                    <Link
                      href={`/incidents/${incident.id}`}
                      className="hover:underline hover:text-purple-300 flex items-center gap-1"
                    >
                      {incident.id}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col max-w-md">
                      <Link
                        href={`/incidents/${incident.id}`}
                        className="font-medium text-white hover:text-purple-300 transition-colors line-clamp-1 text-xs sm:text-sm"
                      >
                        {incident.title}
                      </Link>
                      {incident.error_message && (
                        <span className="text-[11px] text-[#71717a] font-mono line-clamp-1 mt-0.5">
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
                    <span className="text-xs text-[#d1d5db] bg-[#1e1e24] px-2.5 py-1 rounded-lg border border-[#2e2e38]">
                      {incident.service}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs text-[#d1d5db]">
                      <div className="h-5 w-5 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-[10px]">
                        {(incident.assigned_subagent || "A").charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate">{incident.assigned_subagent || "Supervisor"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[11px] text-[#71717a] font-mono">
                    {formatDate(incident.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/incidents/${incident.id}`}
                      className="inline-flex items-center justify-center p-1.5 rounded-lg bg-[#1f1f26] hover:bg-white hover:text-black text-[#8e8e99] transition-colors"
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
