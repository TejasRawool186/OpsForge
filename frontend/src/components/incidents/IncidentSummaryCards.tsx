import * as React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Flame, ShieldAlert, CheckCircle2, Clock, Zap } from "lucide-react";
import { Incident, Approval } from "@/types";

interface IncidentSummaryCardsProps {
  incidents: Incident[];
  approvals: Approval[];
}

export const IncidentSummaryCards: React.FC<IncidentSummaryCardsProps> = ({
  incidents,
  approvals,
}) => {
  const activeCount = incidents.filter((i) => i.status !== "RESOLVED" && i.status !== "CLOSED").length;
  const criticalCount = incidents.filter((i) => i.severity === "CRITICAL" && i.status !== "RESOLVED").length;
  const pendingApprovalsCount = approvals.filter((a) => a.status === "PENDING").length;
  const resolvedCount = incidents.filter((i) => i.status === "RESOLVED").length;

  const cards = [
    {
      title: "Active Incidents",
      value: activeCount,
      subtext: `${criticalCount} Critical P1 Outage`,
      icon: Flame,
      color: "text-rose-400",
      bgGradient: "from-rose-950/30 to-slate-900",
      borderColor: "border-rose-900/40",
      iconBg: "bg-rose-950/60 border-rose-800/40",
    },
    {
      title: "Safety Approvals Pending",
      value: pendingApprovalsCount,
      subtext: "L3 Rollbacks Awaiting Decision",
      icon: ShieldAlert,
      color: "text-amber-400",
      bgGradient: "from-amber-950/30 to-slate-900",
      borderColor: "border-amber-900/40",
      iconBg: "bg-amber-950/60 border-amber-800/40",
    },
    {
      title: "Mean Time To Detect (MTTD)",
      value: "1.8m",
      subtext: "94% faster than manual on-call",
      icon: Zap,
      color: "text-cyan-400",
      bgGradient: "from-cyan-950/30 to-slate-900",
      borderColor: "border-cyan-900/40",
      iconBg: "bg-cyan-950/60 border-cyan-800/40",
    },
    {
      title: "Mean Time To Recover (MTTR)",
      value: "14.2m",
      subtext: `${resolvedCount} incidents auto-mitigated today`,
      icon: Clock,
      color: "text-emerald-400",
      bgGradient: "from-emerald-950/30 to-slate-900",
      borderColor: "border-emerald-900/40",
      iconBg: "bg-emerald-950/60 border-emerald-800/40",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.title}
            className={`bg-gradient-to-br ${card.bgGradient} ${card.borderColor} border shadow-lg hover:border-slate-700 transition-all`}
          >
            <CardContent className="p-5 flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">{card.title}</p>
                <div className="text-2xl font-bold font-mono tracking-tight text-white mt-1.5">
                  {card.value}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{card.subtext}</p>
              </div>
              <div className={`p-2.5 rounded-lg border ${card.iconBg}`}>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
