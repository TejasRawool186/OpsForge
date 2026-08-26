"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Flame, ShieldCheck, Wrench, FileText, Settings, ArrowRight } from "lucide-react";
import { MOCK_INCIDENTS, MOCK_TOOLS } from "@/lib/mock-data";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onClose(); // Toggle or open
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const filteredIncidents = MOCK_INCIDENTS.filter(
    (inc) =>
      inc.title.toLowerCase().includes(query.toLowerCase()) ||
      inc.id.toLowerCase().includes(query.toLowerCase()) ||
      inc.service.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTools = MOCK_TOOLS.filter(
    (t) =>
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.mcp_server.toLowerCase().includes(query.toLowerCase())
  );

  const handleNavigate = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Search input */}
        <div className="flex items-center px-4 border-b border-slate-800 bg-slate-950/60">
          <Search className="h-4 w-4 text-cyan-400 mr-3" />
          <input
            type="text"
            placeholder="Search commands, incidents, tools, or navigate..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full h-12 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <kbd className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          {/* Quick Navigation */}
          {!query && (
            <div>
              <div className="text-[10px] font-mono font-semibold uppercase text-slate-400 px-3 py-1">
                Navigation
              </div>
              <div className="space-y-0.5">
                <button
                  onClick={() => handleNavigate("/incidents")}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-slate-300 hover:bg-slate-800 hover:text-cyan-300 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Flame className="h-4 w-4 text-rose-400" />
                    Incidents Command Center
                  </span>
                  <ArrowRight className="h-3 w-3 text-slate-500" />
                </button>
                <button
                  onClick={() => handleNavigate("/approvals")}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-slate-300 hover:bg-slate-800 hover:text-cyan-300 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <ShieldCheck className="h-4 w-4 text-amber-400" />
                    Safety Approvals Queue
                  </span>
                  <ArrowRight className="h-3 w-3 text-slate-500" />
                </button>
                <button
                  onClick={() => handleNavigate("/tools")}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-slate-300 hover:bg-slate-800 hover:text-cyan-300 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Wrench className="h-4 w-4 text-cyan-400" />
                    MCP Tool Registry
                  </span>
                  <ArrowRight className="h-3 w-3 text-slate-500" />
                </button>
                <button
                  onClick={() => handleNavigate("/reports")}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-slate-300 hover:bg-slate-800 hover:text-cyan-300 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <FileText className="h-4 w-4 text-emerald-400" />
                    Post-Mortem Reports
                  </span>
                  <ArrowRight className="h-3 w-3 text-slate-500" />
                </button>
                <button
                  onClick={() => handleNavigate("/settings")}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-slate-300 hover:bg-slate-800 hover:text-cyan-300 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Settings className="h-4 w-4 text-slate-400" />
                    System Settings
                  </span>
                  <ArrowRight className="h-3 w-3 text-slate-500" />
                </button>
              </div>
            </div>
          )}

          {/* Incidents Matches */}
          {filteredIncidents.length > 0 && (
            <div>
              <div className="text-[10px] font-mono font-semibold uppercase text-slate-400 px-3 py-1">
                Incidents ({filteredIncidents.length})
              </div>
              <div className="space-y-0.5">
                {filteredIncidents.map((inc) => (
                  <button
                    key={inc.id}
                    onClick={() => handleNavigate(`/incidents/${inc.id}`)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-slate-300 hover:bg-slate-800 hover:text-cyan-300 transition-colors"
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-semibold text-slate-200">{inc.title}</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {inc.id} • {inc.service} • {inc.status}
                      </span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-500 flex-shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* MCP Tools Matches */}
          {filteredTools.length > 0 && (
            <div>
              <div className="text-[10px] font-mono font-semibold uppercase text-slate-400 px-3 py-1">
                MCP Tools ({filteredTools.length})
              </div>
              <div className="space-y-0.5">
                {filteredTools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => handleNavigate("/tools")}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg text-slate-300 hover:bg-slate-800 hover:text-cyan-300 transition-colors"
                  >
                    <div className="flex flex-col text-left">
                      <span className="font-mono font-medium text-slate-200">{tool.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{tool.mcp_server}</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
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
