import * as React from "react";
import { cn } from "@/lib/utils";
import { Severity, IncidentStatus, ApprovalStatus, RiskLevel } from "@/types";

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
  showDot?: boolean;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, className, showDot = true }) => {
  const configs: Record<Severity, { bg: string; text: string; border: string; dot: string; glow: string }> = {
    CRITICAL: {
      bg: "bg-rose-950/60",
      text: "text-rose-300",
      border: "border-rose-700/60",
      dot: "bg-rose-500",
      glow: "shadow-[0_0_8px_rgba(244,63,94,0.6)]",
    },
    HIGH: {
      bg: "bg-amber-950/60",
      text: "text-amber-300",
      border: "border-amber-700/60",
      dot: "bg-amber-500",
      glow: "shadow-[0_0_8px_rgba(245,158,11,0.6)]",
    },
    MEDIUM: {
      bg: "bg-yellow-950/50",
      text: "text-yellow-300",
      border: "border-yellow-700/50",
      dot: "bg-yellow-400",
      glow: "shadow-[0_0_8px_rgba(234,179,8,0.4)]",
    },
    LOW: {
      bg: "bg-sky-950/50",
      text: "text-sky-300",
      border: "border-sky-700/50",
      dot: "bg-sky-400",
      glow: "shadow-[0_0_8px_rgba(56,189,248,0.4)]",
    },
  };

  const conf = configs[severity] || configs.LOW;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider border",
        conf.bg,
        conf.text,
        conf.border,
        className
      )}
    >
      {showDot && <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", conf.dot, conf.glow)} />}
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
      bg: "bg-indigo-950/60",
      text: "text-indigo-300",
      border: "border-indigo-700/50",
      dot: "bg-indigo-400 animate-ping",
    },
    APPROVAL_REQUIRED: {
      bg: "bg-amber-950/70",
      text: "text-amber-300",
      border: "border-amber-600/60",
      dot: "bg-amber-400",
    },
    REMEDIATING: {
      bg: "bg-cyan-950/60",
      text: "text-cyan-300",
      border: "border-cyan-700/50",
      dot: "bg-cyan-400 animate-spin",
    },
    VERIFYING: {
      bg: "bg-teal-950/60",
      text: "text-teal-300",
      border: "border-teal-700/50",
      dot: "bg-teal-400",
    },
    RESOLVED: {
      bg: "bg-emerald-950/60",
      text: "text-emerald-300",
      border: "border-emerald-700/50",
      dot: "bg-emerald-400",
    },
    CLOSED: {
      bg: "bg-slate-900/80",
      text: "text-slate-400",
      border: "border-slate-800",
      dot: "bg-slate-500",
    },
    PENDING: {
      bg: "bg-amber-950/70",
      text: "text-amber-300",
      border: "border-amber-600/60",
      dot: "bg-amber-400",
    },
    APPROVED: {
      bg: "bg-emerald-950/60",
      text: "text-emerald-300",
      border: "border-emerald-700/50",
      dot: "bg-emerald-400",
    },
    REJECTED: {
      bg: "bg-rose-950/60",
      text: "text-rose-300",
      border: "border-rose-700/50",
      dot: "bg-rose-400",
    },
  };

  const formatted = status.replace(/_/g, " ");
  const conf = configs[status] || configs.CLOSED;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border font-mono tracking-wide",
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
    LEVEL_0: { bg: "bg-slate-800/80", text: "text-slate-300", border: "border-slate-700", label: "L0 - Read Only" },
    LEVEL_1: { bg: "bg-sky-950/60", text: "text-sky-300", border: "border-sky-700/60", label: "L1 - Low Risk" },
    LEVEL_2: { bg: "bg-amber-950/70", text: "text-amber-300", border: "border-amber-700/60", label: "L2 - Moderate Risk" },
    LEVEL_3: { bg: "bg-rose-950/80", text: "text-rose-300", border: "border-rose-700/80", label: "L3 - Destructive / High Risk" },
  };
  const conf = configs[risk] || configs.LEVEL_0;
  return (
    <span className={cn("px-2 py-0.5 rounded text-xs font-mono font-semibold border", conf.bg, conf.text, conf.border, className)}>
      {conf.label}
    </span>
  );
};
