"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Settings, ShieldCheck, Cpu, Sliders, Check } from "lucide-react";

export default function SettingsPage() {
  const [model, setModel] = React.useState("gemini-1.5-pro");
  const [harnessMode, setHarnessMode] = React.useState("autonomous-gated");
  const [timeoutSec, setTimeoutSec] = React.useState("900");
  const [isSaved, setIsSaved] = React.useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
      <div>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
            <Settings className="h-5 w-5 text-zinc-300" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
            System & Agent Harness Settings
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Configure TrueForge agent execution parameters, model endpoints, and safety gate policies.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Model Provider */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Cpu className="h-4 w-4 text-zinc-400" />
              AI Model Orchestrator & Inference Bridge
            </CardTitle>
            <CardDescription>
              Select the primary reasoning LLM for incident investigation loops and hypothesis formulation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Model Provider</label>
                <Select value={model} onChange={(e) => setModel(e.target.value)}>
                  <option value="gemini-1.5-pro">Google Gemini 1.5 Pro (Recommended)</option>
                  <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Ultra-fast)</option>
                  <option value="groq-llama-3.3-70b">Groq / Llama 3.3 70B Versatile</option>
                  <option value="trueforge-local">TrueForge Local Embedded Agent</option>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">Execution Harness Mode</label>
                <Select value={harnessMode} onChange={(e) => setHarnessMode(e.target.value)}>
                  <option value="autonomous-gated">Autonomous with Human Safety Gates (Default)</option>
                  <option value="supervised">Supervised (Approve all diagnostic scripts)</option>
                  <option value="simulation">Simulation / Dry-Run Mode (No real write actions)</option>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Safety Gate Policies */}
        <Card>
          <CardHeader>
            <CardTitle>
              <ShieldCheck className="h-4 w-4 text-zinc-400" />
              Safety Gate & Remediation Thresholds
            </CardTitle>
            <CardDescription>
              Enforce strict risk controls to prevent unauthorized or destructive production actions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Approval Request Timeout (Seconds)
                </label>
                <Input
                  type="number"
                  value={timeoutSec}
                  onChange={(e) => setTimeoutSec(e.target.value)}
                />
                <span className="text-[11px] text-zinc-500 font-mono mt-1 block">
                  Pending actions auto-expire after this timeout.
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Confidence Threshold for Hypothesis
                </label>
                <Input defaultValue="85%" disabled />
                <span className="text-[11px] text-zinc-500 font-mono mt-1 block">
                  Requires ≥85% confidence before proposing remediation.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          {isSaved && (
            <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 animate-in fade-in">
              <Check className="h-4 w-4" />
              Settings saved successfully!
            </span>
          )}
          <Button type="submit" variant="primary" size="sm" className="font-mono text-xs">
            Save Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}
