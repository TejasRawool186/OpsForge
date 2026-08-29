"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  User as UserIcon,
  LogIn,
} from "lucide-react";

interface SidebarProps {
  pendingApprovalsCount?: number;
  activeIncidentsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  pendingApprovalsCount = 0,
  activeIncidentsCount = 0,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; full_name?: string; role: string } | null>(null);

  const loadUser = () => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("opsforge_user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    }
  };

  useEffect(() => {
    loadUser();

    const handleAuthChange = () => loadUser();
    window.addEventListener("opsforge_auth_change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("opsforge_auth_change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("opsforge_token");
    localStorage.removeItem("opsforge_user");
    document.cookie = "opsforge_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setUser(null);
    window.dispatchEvent(new Event("opsforge_auth_change"));
    router.push("/login");
  };

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

  const userInitial = user?.full_name ? user.full_name.charAt(0).toUpperCase() : user?.email ? user.email.charAt(0).toUpperCase() : "G";
  const userDisplayName = user?.full_name || (user?.email ? user.email.split("@")[0] : "Guest User");
  const userRole = user?.role || "GUEST";

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
      <div className="p-4 m-3 mt-auto rounded-xl bg-[#121216] border border-[#23232a] flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div
            style={{
              backgroundColor: "var(--user-avatar-bg)",
              color: "var(--user-avatar-text)",
            }}
            className="h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm shadow shrink-0"
          >
            {userInitial}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-foreground truncate">{userDisplayName}</div>
            <div className="text-[11px] text-muted-foreground uppercase font-mono">{userRole}</div>
          </div>
        </div>

        {user ? (
          <button
            onClick={handleLogout}
            className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors p-1.5 rounded-lg shrink-0"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors p-1.5 rounded-lg shrink-0"
            title="Sign In"
          >
            <LogIn className="h-4 w-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
