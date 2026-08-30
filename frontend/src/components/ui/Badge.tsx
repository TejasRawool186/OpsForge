import * as React from "react";
import { cn } from "@/lib/utils";
import { Severity, IncidentStatus, ApprovalStatus, RiskLevel } from "@/types";

interface SeverityBadgeProps {
  severity: Severity | string;
  className?: string;
  showDot?: boolean;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, className, showDot = true }) => {
  const configs: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    CRITICAL: {
      bg: "bg-white",
      text: "text-zinc-950 font-bold",
      border: "border-white",
      dot: "bg-zinc-950",
    },
    HIGH: {
      bg: "bg-zinc-800",
      text: "text-zinc-100 font-semibold",
      border: "border-zinc-700",
      dot: "bg-zinc-100",
    },
    MEDIUM: {
      bg: "bg-zinc-900",
      text: "text-zinc-300",
      border: "border-zinc-800",
      dot: "bg-zinc-400",
    },
    LOW: {
      bg: "bg-zinc-950",
      text: "text-zinc-400",
      border: "border-zinc-800",
      dot: "bg-zinc-500",
    },
  };

  const key = String(severity || "LOW").toUpperCase();
  const conf = configs[key] || configs.LOW;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono tracking-wider uppercase border",
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
  status: IncidentStatus | ApprovalStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const configs: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    CREATED: {
      bg: "bg-zinc-950",
      text: "text-zinc-400",
      border: "border-zinc-800",
      dot: "bg-zinc-500",
    },
    INVESTIGATING: {
      bg: "bg-zinc-800",
      text: "text-zinc-200",
      border: "border-zinc-700",
      dot: "bg-zinc-200",
    },
    APPROVAL_REQUIRED: {
      bg: "bg-white",
      text: "text-zinc-950 font-bold",
      border: "border-white",
      dot: "bg-zinc-950 animate-pulse",
    },
    REMEDIATING: {
      bg: "bg-zinc-800",
      text: "text-zinc-100",
      border: "border-zinc-700",
      dot: "bg-zinc-100 animate-pulse",
    },
    VERIFYING: {
      bg: "bg-zinc-850",
      text: "text-zinc-200",
      border: "border-zinc-700",
      dot: "bg-zinc-300",
    },
    RESOLVED: {
      bg: "bg-zinc-900",
      text: "text-zinc-300",
      border: "border-zinc-800",
      dot: "bg-zinc-400",
    },
    CLOSED: {
      bg: "bg-zinc-950",
      text: "text-zinc-500",
      border: "border-zinc-800",
      dot: "bg-zinc-600",
    },
    PENDING: {
      bg: "bg-white",
      text: "text-zinc-950 font-bold",
      border: "border-white",
      dot: "bg-zinc-950 animate-pulse",
    },
    APPROVED: {
      bg: "bg-zinc-800",
      text: "text-zinc-100",
      border: "border-zinc-700",
      dot: "bg-zinc-200",
    },
    REJECTED: {
      bg: "bg-zinc-950",
      text: "text-zinc-500 line-through",
      border: "border-zinc-800",
      dot: "bg-zinc-600",
    },
  };

  const key = String(status || "CLOSED").toUpperCase();
  const formatted = key.replace(/_/g, " ");
  const conf = configs[key] || configs.CLOSED;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono tracking-wider border uppercase",
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

export const RiskBadge: React.FC<{ risk: RiskLevel | string; className?: string }> = ({ risk, className }) => {
  const configs: Record<string, { bg: string; text: string; border: string; label: string }> = {
    LEVEL_0: { bg: "bg-zinc-950", text: "text-zinc-400", border: "border-zinc-800", label: "L0 - Read Only" },
    LEVEL_1: { bg: "bg-zinc-900", text: "text-zinc-300", border: "border-zinc-800", label: "L1 - Low Risk" },
    LEVEL_2: { bg: "bg-zinc-800", text: "text-zinc-100", border: "border-zinc-700", label: "L2 - Moderate Risk" },
    LEVEL_3: { bg: "bg-white", text: "text-zinc-950 font-bold", border: "border-white", label: "L3 - Destructive" },
    LOW: { bg: "bg-zinc-950", text: "text-zinc-400", border: "border-zinc-800", label: "Low Risk" },
    MEDIUM: { bg: "bg-zinc-900", text: "text-zinc-300", border: "border-zinc-800", label: "Moderate Risk" },
    HIGH: { bg: "bg-zinc-800", text: "text-zinc-100", border: "border-zinc-700", label: "High Risk" },
    DESTRUCTIVE: { bg: "bg-white", text: "text-zinc-950 font-bold", border: "border-white", label: "Destructive" },
  };

  const key = String(risk || "LEVEL_0").toUpperCase();
  const conf = configs[key] || { bg: "bg-zinc-900", text: "text-zinc-300", border: "border-zinc-800", label: key };

  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-[11px] font-mono border uppercase", conf.bg, conf.text, conf.border, className)}>
      {conf.label}
    </span>
  );
};
