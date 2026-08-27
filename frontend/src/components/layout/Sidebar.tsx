"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Flame,
  ShieldCheck,
  Wrench,
  FileText,
  Settings,
  Activity,
  Cpu,
  Radio,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  pendingApprovalsCount?: number;
  activeIncidentsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  pendingApprovalsCount = 1,
  activeIncidentsCount = 3,
}) => {
  const pathname = usePathname();

  const navigation = [
    {
      name: "Incidents Dashboard",
      href: "/incidents",
      icon: Flame,
      count: activeIncidentsCount,
      badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    },
    {
      name: "Safety Approvals",
      href: "/approvals",
      icon: ShieldCheck,
      count: pendingApprovalsCount,
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    },
    {
      name: "MCP Tool Registry",
      href: "/tools",
      icon: Wrench,
    },
    {
      name: "Post-Mortems",
      href: "/reports",
      icon: FileText,
    },
    {
      name: "System Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950/80 backdrop-blur-xl flex flex-col h-screen fixed left-0 top-0 z-40">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-slate-800/80 justify-between">
        <Link href="/incidents" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-glow">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base text-white tracking-tight">OpsForge</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                v1.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">Autonomous SRE Agent</p>
          </div>
        </Link>
      </div>

      {/* Harness Status Banner */}
      <div className="p-3 mx-3 mt-4 rounded-lg bg-slate-900/90 border border-slate-800 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-300 font-medium font-mono text-[11px]">TrueForge Harness</span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/40">
          ONLINE
        </span>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-mono font-semibold uppercase text-slate-400 px-3 pb-2 tracking-wider">
          Operations
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/incidents" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group",
                isActive
                  ? "bg-slate-800/90 text-cyan-300 border border-slate-700/80 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"
                  )}
                />
                <span>{item.name}</span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span
                  className={cn(
                    "px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold border",
                    item.badgeColor
                  )}
                >
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}

        <div className="text-[10px] font-mono font-semibold uppercase text-slate-400 px-3 pt-6 pb-2 tracking-wider">
          Active Incident
        </div>
        <Link
          href="/incidents/INC-2026-8801"
          className="flex flex-col p-2.5 rounded-lg bg-gradient-to-r from-rose-950/30 to-slate-900 border border-rose-900/40 hover:border-rose-700/60 transition-all group"
        >
          <div className="flex items-center justify-between text-[11px] font-mono font-semibold text-rose-300">
            <span className="flex items-center gap-1.5">
              <Radio className="h-3 w-3 text-rose-400 animate-pulse" />
              INC-2026-8801
            </span>
            <ChevronRight className="h-3 w-3 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-[11px] text-slate-300 mt-1 line-clamp-1">Checkout Service 500 Spike</p>
          <span className="text-[10px] text-amber-400 font-mono mt-1">APPROVAL REQUIRED</span>
        </Link>
      </nav>

      {/* Footer Info */}
      <div className="p-3 m-3 rounded-lg border border-slate-800/80 bg-slate-900/40 text-xs">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-cyan-400" />
            Active SRE
          </span>
          <span className="text-slate-200 font-mono font-medium">samar@oncall</span>
        </div>
      </div>
    </aside>
  );
};
