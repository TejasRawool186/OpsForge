"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bell,
  Check,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileText,
  X,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "critical" | "warning" | "success" | "info";
  unread: boolean;
  href: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    title: "Safety Gate Approval Required",
    message: "INC-2026-8801: Automated L3 rollback requires on-call human authorization.",
    time: "2m ago",
    type: "critical",
    unread: true,
    href: "/approvals",
  },
  {
    id: "2",
    title: "Investigation Hypothesis Confirmed",
    message: "Subagent identified corrupted DB connection pool in checkout service.",
    time: "14m ago",
    type: "success",
    unread: true,
    href: "/incidents/INC-2026-8801",
  },
  {
    id: "3",
    title: "Telemetry Alert Triggered",
    message: "Payment Gateway HTTP 500 error rate exceeded 5% threshold.",
    time: "38m ago",
    type: "warning",
    unread: true,
    href: "/incidents",
  },
  {
    id: "4",
    title: "Post-Mortem Report Published",
    message: "Report generated for Redis Memory Exhaustion outage.",
    time: "1h ago",
    type: "info",
    unread: false,
    href: "/reports",
  },
];

export const NotificationsDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Close when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
    setIsOpen(false);
  };

  const getTypeIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "critical":
        return <ShieldAlert className="h-4 w-4 text-red-400" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case "info":
        return <FileText className="h-4 w-4 text-blue-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-2 rounded-xl text-[#8e8e99] hover:text-white hover:bg-white/[0.04] transition-all relative",
          isOpen && "text-white bg-white/[0.06]"
        )}
        title="Notifications"
        aria-label="Open notifications"
        aria-expanded={isOpen}
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
        )}
      </button>

      {/* Flyout Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#141417] border border-[#23232a] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-4 border-b border-[#1f1f26] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] text-[#8e8e99] hover:text-white flex items-center gap-1 font-medium transition-colors"
              >
                <Check className="h-3 w-3" />
                Mark all as read
              </button>
            )}
          </div>

          {/* List of Notifications */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#1f1f26]">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#71717a]">
                No new notifications.
              </div>
            ) : (
              notifications.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => markAsRead(item.id)}
                  className={cn(
                    "p-3.5 flex items-start gap-3 hover:bg-white/[0.03] transition-colors block text-left group relative",
                    item.unread && "bg-white/[0.015]"
                  )}
                >
                  <div className="p-1.5 rounded-lg bg-[#1a1a20] border border-[#262630] flex-shrink-0 mt-0.5">
                    {getTypeIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4
                        className={cn(
                          "text-xs font-semibold truncate",
                          item.unread ? "text-white" : "text-[#a1a1aa]"
                        )}
                      >
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-[#71717a] font-mono whitespace-nowrap">
                        {item.time}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#8e8e99] line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                  </div>

                  {item.unread && (
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                  )}
                </Link>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-[#1f1f26] bg-[#111114] text-center">
            <Link
              href="/incidents"
              onClick={() => setIsOpen(false)}
              className="text-xs text-[#8e8e99] hover:text-white font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              <span>View All System Activity</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
