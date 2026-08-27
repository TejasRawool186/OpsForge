import * as React from "react";
import { cn } from "@/lib/utils";
import { Severity, IncidentStatus, ApprovalStatus, RiskLevel } from "@/types";

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
  showDot?: boolean;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, className, showDot = true }) => {
  const configs: Record<Severity, { bg: string; text: string; border: string; dot: string }> = {
    CRITICAL: {
      bg: "bg-red-500/10",
      text: "text-red-400",
      border: "border-red-500/20",
      dot: "bg-red-500",
    },
    HIGH: {
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/20",
      dot: "bg-amber-500",
    },
    MEDIUM: {
      bg: "bg-yellow-500/10",
      text: "text-yellow-400",
      border: "border-yellow-500/20",
      dot: "bg-yellow-400",
    },
    LOW: {
      bg: "bg-zinc-500/10",
      text: "text-zinc-400",
      border: "border-zinc-500/20",
      dot: "bg-zinc-400",
    },
  };

  const conf = configs[severity] || configs.LOW;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border",
        conf.bg,
        conf.text,
        conf.border,
        className
      )}
    >
      {showDot && <span className={cn("h-1.5 w-1.5 rounded-full", conf.dot)} />}
      {severity}
    </span>
  );
};

interface StatusBadgeProps {
  status: IncidentStatus | ApprovalStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const configs: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    INVESTIGATING: {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      border: "border-blue-500/20",
      dot: "bg-blue-400",
    },
    APPROVAL_REQUIRED: {
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/20",
      dot: "bg-amber-400",
    },
    REMEDIATING: {
      bg: "bg-purple-500/10",
      text: "text-purple-400",
      border: "border-purple-500/20",
      dot: "bg-purple-400 animate-pulse",
    },
    VERIFYING: {
      bg: "bg-cyan-500/10",
      text: "text-cyan-400",
      border: "border-cyan-500/20",
      dot: "bg-cyan-400",
    },
    RESOLVED: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/20",
      dot: "bg-emerald-400",
    },
    CLOSED: {
      bg: "bg-zinc-500/10",
      text: "text-zinc-400",
      border: "border-zinc-500/20",
      dot: "bg-zinc-500",
    },
    PENDING: {
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/20",
      dot: "bg-amber-400",
    },
    APPROVED: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/20",
      dot: "bg-emerald-400",
    },
    REJECTED: {
      bg: "bg-red-500/10",
      text: "text-red-400",
      border: "border-red-500/20",
      dot: "bg-red-400",
    },
  };

  const formatted = status.replace(/_/g, " ");
  const conf = configs[status] || configs.CLOSED;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border tracking-wide",
        conf.bg,
        conf.text,
        conf.border,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", conf.dot)} />
      {formatted}
    </span>
  );
};

export const RiskBadge: React.FC<{ risk: RiskLevel; className?: string }> = ({ risk, className }) => {
  const configs: Record<RiskLevel, { bg: string; text: string; border: string; label: string }> = {
    LEVEL_0: { bg: "bg-zinc-800/80", text: "text-zinc-300", border: "border-zinc-700", label: "L0 - Read Only" },
    LEVEL_1: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", label: "L1 - Low Risk" },
    LEVEL_2: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", label: "L2 - Moderate Risk" },
    LEVEL_3: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20", label: "L3 - Destructive" },
  };
  const conf = configs[risk] || configs.LEVEL_0;
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-[11px] font-semibold border", conf.bg, conf.text, conf.border, className)}>
      {conf.label}
    </span>
  );
};
