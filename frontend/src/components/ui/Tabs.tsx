"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: { id: string; label: string; count?: number; icon?: React.ReactNode }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div className={cn("flex space-x-1 border-b border-slate-800/80 p-1 bg-slate-950/40 rounded-xl", className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all duration-150 relative",
              isActive
                ? "bg-slate-800 text-cyan-400 font-semibold shadow-inner-glow border border-slate-700/80"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
            )}
          >
            {tab.icon && <span className={cn(isActive ? "text-cyan-400" : "text-slate-500")}>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold",
                  isActive ? "bg-cyan-500/20 text-cyan-300" : "bg-slate-800 text-slate-400"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
