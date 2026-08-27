"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShieldAlert,
  Wrench,
  FileText,
  Settings,
  Flame,
  Activity,
  LogOut,
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
      name: "Dashboard",
      href: "/incidents",
      icon: LayoutDashboard,
    },
    {
      name: "Safety Approvals",
      href: "/approvals",
      icon: ShieldAlert,
      count: pendingApprovalsCount,
    },
    {
      name: "MCP Tools",
      href: "/tools",
      icon: Wrench,
    },
    {
      name: "Activity Logs",
      href: "/reports",
      icon: Activity,
    },
    {
      name: "System Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen fixed left-0 top-0 z-40 transition-colors">
      {/* Brand Header */}
      <div className="p-6 pb-5">
        <Link href="/" className="block">
          <h1 className="text-xl font-bold text-foreground tracking-tight">OpsForge</h1>
          <p className="text-[10px] text-muted-foreground font-semibold tracking-wider uppercase mt-0.5">
            AUTONOMOUS SRE AGENT
          </p>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
        {navigation.map((item) => {
          const isActive =
            item.href === "/incidents"
              ? pathname === "/incidents" || pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              style={
                isActive
                  ? {
                      background: "var(--active-nav-bg)",
                      color: "var(--active-nav-text)",
                      borderColor: "var(--active-nav-border)",
                    }
                  : {}
              }
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all group relative border border-transparent",
                isActive
                  ? "shadow-sm before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-[var(--active-nav-indicator)] before:rounded-r-full"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive ? "text-current" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span>{item.name}</span>
              </div>
              {item.count !== undefined && item.count > 0 && (
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-semibold",
                    isActive
                      ? "bg-purple-500/30 text-purple-200"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom User Profile */}
      <div className="p-4 m-3 mt-auto rounded-xl bg-transparent flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            style={{
              backgroundColor: "var(--user-avatar-bg)",
              color: "var(--user-avatar-text)",
            }}
            className="h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm shadow transition-colors"
          >
            S
          </div>
          <div>
            <div className="text-xs font-semibold text-foreground">System Admin</div>
            <div className="text-[11px] text-muted-foreground">Admin</div>
          </div>
        </div>
        <button
          className="text-muted-foreground hover:text-foreground transition-colors p-1.5"
          title="Sign Out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
};
