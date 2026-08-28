"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Flame, ShieldCheck, Wrench, FileText, Settings, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { Incident, ToolRegistry } from "@/types";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [incidents, setIncidents] = React.useState<Incident[]>([]);
  const [tools, setTools] = React.useState<ToolRegistry[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      api.getIncidents().then(setIncidents).catch(() => setIncidents([]));
      api.getTools().then(setTools).catch(() => setTools([]));
    }
  }, [isOpen]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const filteredIncidents = incidents.filter(
    (inc) =>
      inc.title.toLowerCase().includes(query.toLowerCase()) ||
      inc.id.toLowerCase().includes(query.toLowerCase()) ||
      inc.service.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTools = tools.filter(
    (t) =>
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      (t.display_name && t.display_name.toLowerCase().includes(query.toLowerCase()))
  );

  const handleNavigate = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Search input */}
        <div className="flex items-center px-4 border-b border-zinc-800 bg-zinc-950/60">
          <Search className="h-4 w-4 text-zinc-400 mr-3" />
          <input
            type="text"
            placeholder="Search commands, incidents, tools, or navigate..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full h-12 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
          />
          <kbd className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-400">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          {/* Quick Navigation */}
          {!query && (
            <div>
              <div className="text-[10px] font-mono font-medium uppercase text-zinc-500 px-3 py-1">
                Navigation
              </div>
              <div className="space-y-0.5">
                <button
                  onClick={() => handleNavigate("/incidents")}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Flame className="h-4 w-4 text-zinc-400" />
                    Incidents Command Center
                  </span>
                  <ArrowRight className="h-3 w-3 text-zinc-500" />
                </button>
                <button
                  onClick={() => handleNavigate("/approvals")}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <ShieldCheck className="h-4 w-4 text-zinc-400" />
                    Safety Approvals Queue
                  </span>
                  <ArrowRight className="h-3 w-3 text-zinc-500" />
                </button>
                <button
                  onClick={() => handleNavigate("/tools")}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Wrench className="h-4 w-4 text-zinc-400" />
                    MCP Tool Registry
                  </span>
                  <ArrowRight className="h-3 w-3 text-zinc-500" />
                </button>
                <button
                  onClick={() => handleNavigate("/reports")}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <FileText className="h-4 w-4 text-zinc-400" />
                    Post-Mortem Reports
                  </span>
                  <ArrowRight className="h-3 w-3 text-zinc-500" />
                </button>
                <button
                  onClick={() => handleNavigate("/settings")}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Settings className="h-4 w-4 text-zinc-400" />
                    System Settings
                  </span>
                  <ArrowRight className="h-3 w-3 text-zinc-500" />
                </button>
              </div>
            </div>
          )}

          {/* Incidents Matches */}
          {filteredIncidents.length > 0 && (
            <div>
              <div className="text-[10px] font-mono font-medium uppercase text-zinc-500 px-3 py-1">
                Incidents ({filteredIncidents.length})
              </div>
              <div className="space-y-0.5">
                {filteredIncidents.map((inc) => (
                  <button
                    key={inc.id}
                    onClick={() => handleNavigate(`/incidents/${inc.id}`)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-semibold text-zinc-200">{inc.title}</span>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        {inc.id} • {inc.service} • {inc.status}
                      </span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-zinc-500 flex-shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MCP Tools Matches */}
          {filteredTools.length > 0 && (
            <div>
              <div className="text-[10px] font-mono font-medium uppercase text-zinc-500 px-3 py-1">
                MCP Tools ({filteredTools.length})
              </div>
              <div className="space-y-0.5">
                {filteredTools.map((tool) => (
                  <button
                    key={tool.name}
                    onClick={() => handleNavigate("/tools")}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-mono font-medium text-zinc-200">{tool.display_name || tool.name}</span>
                      <span className="text-[11px] text-zinc-500 font-mono">{tool.name}</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {tool.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
