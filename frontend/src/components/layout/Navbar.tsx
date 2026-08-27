"use client";

import * as React from "react";
import { Search, Plus, Radio, Server } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface NavbarProps {
  onOpenCommandPalette: () => void;
  onOpenCreateIncident: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCommandPalette,
  onOpenCreateIncident,
}) => {
  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-30 ml-64">
      {/* Left: Search / Command Bar Trigger */}
      <div className="flex items-center gap-4 w-96">
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center justify-between w-full h-9 px-3 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-900 text-xs text-slate-400 hover:text-slate-200 transition-all group"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5 text-slate-500 group-hover:text-cyan-400" />
            <span>Search incidents, logs, MCP tools...</span>
          </div>
          <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400 font-semibold">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Environment, Agent Status & Action Button */}
      <div className="flex items-center gap-4">
        {/* Environment Badge */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
          <Server className="h-3.5 w-3.5 text-cyan-400" />
          <span>production-us-east-1</span>
        </div>

        {/* Live Agent Pulse */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-300">
          <Radio className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
          <span className="font-mono text-[11px]">3 Agents Active</span>
        </div>

        {/* Trigger / Simulate Incident Button */}
        <Button
          variant="glow"
          size="sm"
          onClick={onOpenCreateIncident}
          className="gap-1.5 font-mono text-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          Simulate Incident
        </Button>
      </div>
    </header>
  );
};
