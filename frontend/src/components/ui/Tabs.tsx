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
    <div className={cn("flex space-x-1 border border-[#23232a] p-1.5 bg-[#141417] rounded-2xl", className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-xs font-medium rounded-xl transition-all duration-150 relative",
              isActive
                ? "bg-[#22172f] text-white font-semibold border border-purple-500/30 shadow-sm"
                : "text-[#8e8e99] hover:text-white hover:bg-white/[0.03]"
            )}
          >
            {tab.icon && <span className={cn(isActive ? "text-purple-300" : "text-[#8e8e99]")}>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold",
                  isActive ? "bg-purple-500/30 text-purple-200" : "bg-[#1f1f26] text-[#8e8e99]"
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
