"use client";

import * as React from "react";
import { api } from "@/lib/api";
import { ToolRegistry } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { Wrench, CheckCircle2, AlertTriangle, ShieldCheck, Activity, Terminal, RefreshCw } from "lucide-react";

export default function ToolsPage() {
  const [tools, setTools] = React.useState<ToolRegistry[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchTools = async () => {
    setIsLoading(true);
    try {
      const data = await api.getTools();
      setTools(data);
    } catch (err) {
      console.error("Failed to load tools:", err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTools();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800/50">
              <Wrench className="h-5 w-5 text-cyan-400" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              MCP Tool Registry & Sandbox Monitor
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Registered Model Context Protocol (MCP) servers, sandboxed diagnostic runtimes, and health metrics.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchTools}
          isLoading={isLoading}
          className="self-start sm:self-auto font-mono text-xs gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh Health
        </Button>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <Card key={tool.id} className="border-slate-800/80 bg-slate-900/60 hover:border-slate-700 transition-all flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                  {tool.tool_type}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/50">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {tool.status}
                </span>
              </div>
              <CardTitle className="text-base text-white mt-2 font-mono">
                {tool.name}
              </CardTitle>
              {tool.description && (
                <CardDescription className="line-clamp-2 mt-1">
                  {tool.description}
                </CardDescription>
              )}
            </CardHeader>

            <CardContent className="pt-2 border-t border-slate-800/60 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">MCP Server</span>
                  <span className="text-slate-200 block truncate">{tool.mcp_server}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Avg Latency</span>
                  <span className="text-cyan-400 block">{tool.avg_latency_ms}ms</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] font-mono">
                <span className="text-slate-400">Human Approval:</span>
                {tool.requires_approval ? (
                  <span className="text-amber-400 font-medium">REQUIRED (L2/L3)</span>
                ) : (
                  <span className="text-emerald-400 font-medium">Auto-permitted (L0/L1)</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
