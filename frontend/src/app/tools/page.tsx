"use client";

import * as React from "react";
import { api } from "@/lib/api";
import { ToolRegistry } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Wrench, RefreshCw } from "lucide-react";

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
            <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
              <Wrench className="h-5 w-5 text-zinc-300" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
              MCP Tool Registry & Sandbox Monitor
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
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
      {tools.length === 0 ? (
        <Card className="border-zinc-800 bg-zinc-900/40 p-8 text-center">
          <Wrench className="h-8 w-8 text-zinc-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-zinc-300">No MCP tools registered</p>
          <p className="text-xs text-zinc-500 mt-1">Connect your integration tools in Settings to activate subagent capability gates.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool, idx) => (
            <Card key={tool.name || idx} className="border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700 transition-all flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {tool.tool_type || "MCP Tool"}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-mono font-medium text-zinc-300 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {tool.status}
                  </span>
                </div>
                <CardTitle className="text-base text-zinc-100 mt-2 font-mono">
                  {tool.display_name || tool.name}
                </CardTitle>
                {tool.description && (
                  <CardDescription className="line-clamp-2 mt-1">
                    {tool.description}
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="pt-2 border-t border-zinc-800/60 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">MCP Server</span>
                    <span className="text-zinc-200 block truncate">{tool.mcp_server || tool.name}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] uppercase">Avg Latency</span>
                    <span className="text-zinc-200 block">
                      {tool.latency_ms ? `${tool.latency_ms}ms` : tool.avg_latency_ms ? `${tool.avg_latency_ms}ms` : "Active"}
                    </span>
                  </div>
                </div>

                {tool.capabilities && tool.capabilities.length > 0 && (
                  <div>
                    <span className="text-zinc-500 block text-[10px] font-mono uppercase mb-1">Capabilities</span>
                    <div className="flex flex-wrap gap-1">
                      {tool.capabilities.map((cap) => (
                        <span key={cap} className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded border border-zinc-700">
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 text-[11px] font-mono">
                  <span className="text-zinc-500">Human Approval:</span>
                  {tool.requires_approval ? (
                    <span className="text-amber-400 font-medium">REQUIRED (L2/L3)</span>
                  ) : (
                    <span className="text-zinc-400 font-medium">Auto-permitted (L0/L1)</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
