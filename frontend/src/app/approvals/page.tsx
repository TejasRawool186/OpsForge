"use client";

import * as React from "react";
import { api } from "@/lib/api";
import { Approval } from "@/types";
import { RiskBadge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { formatDate } from "@/lib/utils";
import { ShieldAlert, CheckCircle2, XCircle, AlertTriangle, Cpu } from "lucide-react";

export default function ApprovalsPage() {
  const [approvals, setApprovals] = React.useState<Approval[]>([]);
  const [selectedApproval, setSelectedApproval] = React.useState<Approval | null>(null);
  const [actionType, setActionType] = React.useState<"APPROVED" | "REJECTED" | null>(null);
  const [decisionReason, setDecisionReason] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchApprovals = async () => {
    try {
      const data = await api.getApprovals();
      setApprovals(data);
    } catch (err) {
      console.error("Failed to load approvals:", err);
    }
  };

  React.useEffect(() => {
    fetchApprovals();
  }, []);

  const handleOpenDecision = (approval: Approval, type: "APPROVED" | "REJECTED") => {
    setSelectedApproval(approval);
    setActionType(type);
    setDecisionReason(
      type === "APPROVED"
        ? "Approved: Root cause verified and rollback target validated."
        : "Rejected: Incomplete diagnostic evidence or risk too high."
    );
  };

  const handleConfirmDecision = async () => {
    if (!selectedApproval || !actionType) return;
    setIsSubmitting(true);
    try {
      await api.decideApproval(selectedApproval.id, actionType, decisionReason);
      setSelectedApproval(null);
      setActionType(null);
      await fetchApprovals();
    } catch (err) {
      console.error("Failed to record approval decision:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingList = approvals.filter((a) => a.status === "PENDING");
  const historyList = approvals.filter((a) => a.status !== "PENDING");

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
            <ShieldAlert className="h-5 w-5 text-zinc-300" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
            Human Safety Gate & Approvals Queue
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          OpsForge strictly halts autonomous execution before applying Level 2 and Level 3 production changes until an SRE reviews and signs off.
        </p>
      </div>

      {/* Pending Safety Requests */}
      <div className="space-y-4">
        <h2 className="text-sm font-mono font-medium uppercase text-zinc-300 flex items-center gap-2 tracking-wider">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          Pending Approvals ({pendingList.length})
        </h2>

        {pendingList.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-zinc-400 text-xs">
              <CheckCircle2 className="h-8 w-8 text-zinc-500 mx-auto mb-2" />
              No pending approval requests. All systems operating safely within automatic bounds.
            </CardContent>
          </Card>
        ) : (
          pendingList.map((app) => (
            <Card key={app.id} className="border-zinc-800 bg-zinc-900/50 shadow-sm">
              <CardHeader className="pb-3 border-zinc-800/80">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium text-zinc-200">{app.id}</span>
                    <RiskBadge risk={app.risk_level} />
                    <span className="font-mono text-xs text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                      Incident: {app.incident_id}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-amber-400">
                    Requested: {formatDate(app.requested_at)}
                  </span>
                </div>
                <CardTitle className="text-base text-zinc-100 mt-1">
                  {app.action_type}: {app.action_description}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-3">
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-300">
                  <Cpu className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Requested by: {app.requested_by_agent}</span>
                </div>

                {app.parameters && (
                  <div>
                    <span className="text-[11px] font-mono text-zinc-400 block mb-1">
                      Execution Parameters (JSON Payload):
                    </span>
                    <pre className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-300 overflow-x-auto">
                      {JSON.stringify(app.parameters, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleOpenDecision(app, "REJECTED")}
                    className="font-mono text-xs gap-1.5"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Reject Action
                  </Button>
                  <Button
                    variant="amber"
                    size="sm"
                    onClick={() => handleOpenDecision(app, "APPROVED")}
                    className="font-mono text-xs gap-1.5"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Approve & Authorize Remediation
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Historical Approvals */}
      <div className="space-y-4 pt-4">
        <h2 className="text-sm font-mono font-medium uppercase text-zinc-400 tracking-wider">
          Decision History & Audit Trail ({historyList.length})
        </h2>

        {historyList.map((app) => (
          <Card key={app.id} className="border-zinc-800/80 bg-zinc-900/30">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-medium text-zinc-200">{app.id}</span>
                  <RiskBadge risk={app.risk_level} />
                  <StatusBadge status={app.status} />
                </div>
                <p className="text-zinc-300 font-medium">{app.action_description}</p>
                {app.decision_reason && (
                  <p className="text-zinc-400 text-[11px] mt-1 italic font-mono">
                    &ldquo;{app.decision_reason}&rdquo; — by {app.decision_by || "SRE"}
                  </p>
                )}
              </div>
              <span className="font-mono text-zinc-500 text-[11px] whitespace-nowrap">
                {formatDate(app.decision_at || app.requested_at)}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Decision Modal */}
      {selectedApproval && actionType && (
        <Modal
          isOpen={true}
          onClose={() => {
            setSelectedApproval(null);
            setActionType(null);
          }}
          title={actionType === "APPROVED" ? "Authorize Remediation Action" : "Reject Remediation Request"}
          description={`Confirm human SRE authorization for ${selectedApproval.id}`}
        >
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs space-y-1">
              <span className="font-mono text-zinc-200 block font-semibold">{selectedApproval.action_type}</span>
              <p className="text-zinc-300">{selectedApproval.action_description}</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Audit Reason / Decision Justification *
              </label>
              <Textarea
                rows={3}
                value={decisionReason}
                onChange={(e) => setDecisionReason(e.target.value)}
                placeholder="State your justification for the immutable security audit trail..."
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setSelectedApproval(null);
                  setActionType(null);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant={actionType === "APPROVED" ? "amber" : "destructive"}
                onClick={handleConfirmDecision}
                isLoading={isSubmitting}
                className="font-mono text-xs"
              >
                Confirm {actionType === "APPROVED" ? "Approval" : "Rejection"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
