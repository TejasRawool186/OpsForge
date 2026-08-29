"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import {
  Settings,
  ShieldCheck,
  Cpu,
  Check,
  Link2,
  GitBranch,
  Activity,
  Database,
  RefreshCw,
  Trash2,
  AlertTriangle,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { api } from "@/lib/api";
import { UserIntegration, IntegrationTestResult } from "@/types";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState<"integrations" | "system">("integrations");

  // System Settings State
  const [model, setModel] = React.useState("gemini-1.5-pro");
  const [harnessMode, setHarnessMode] = React.useState("autonomous-gated");
  const [timeoutSec, setTimeoutSec] = React.useState("900");
  const [isSystemSaved, setIsSystemSaved] = React.useState(false);

  // Integrations State
  const [integrations, setIntegrations] = React.useState<UserIntegration[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [savingTool, setSavingTool] = React.useState<string | null>(null);
  const [testingTool, setTestingTool] = React.useState<string | null>(null);
  const [testResults, setTestResults] = React.useState<Record<string, IntegrationTestResult>>({});
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form State for Tools
  const [githubForm, setGithubForm] = React.useState({
    displayName: "OpsForge GitHub",
    repoOwner: "TejasRawool186",
    repoName: "OpsForge",
    token: "",
  });

  const [grafanaForm, setGrafanaForm] = React.useState({
    displayName: "Grafana Enterprise",
    baseUrl: "https://grafana.example.com",
    apiKey: "",
  });

  const [postgresForm, setPostgresForm] = React.useState({
    displayName: "Supabase App DB",
    host: "aws-0-ap-northeast-1.pooler.supabase.com",
    port: "6543",
    dbName: "postgres",
    username: "postgres.lmglaazccinekrndvvqy",
    password: "",
  });

  // Fetch Existing Integrations
  const loadIntegrations = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getUserIntegrations("demo_user");
      setIntegrations(data);

      // Pre-fill forms if integrations exist
      data.forEach((item) => {
        if (item.tool_name === "github") {
          setGithubForm((prev) => ({
            ...prev,
            displayName: item.display_name || prev.displayName,
            repoOwner: item.config.repo_owner || prev.repoOwner,
            repoName: item.config.repo_name || prev.repoName,
          }));
        } else if (item.tool_name === "grafana") {
          setGrafanaForm((prev) => ({
            ...prev,
            displayName: item.display_name || prev.displayName,
            baseUrl: item.config.base_url || prev.baseUrl,
          }));
        } else if (item.tool_name === "postgres") {
          setPostgresForm((prev) => ({
            ...prev,
            displayName: item.display_name || prev.displayName,
            host: item.config.host || prev.host,
            port: String(item.config.port || prev.port),
            dbName: item.config.database || prev.dbName,
            username: item.config.user || prev.username,
          }));
        }
      });
    } catch (err: any) {
      console.error("Failed to load integrations:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadIntegrations();
  }, [loadIntegrations]);

  const showToast = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Live Raw Connection Test
  const handleTestRaw = async (toolName: string, config: Record<string, any>, credentials: Record<string, any>) => {
    setTestingTool(toolName);
    try {
      const res = await api.testIntegrationRaw({ tool_name: toolName, config, credentials });
      setTestResults((prev) => ({ ...prev, [toolName]: res }));
      if (res.status === "CONNECTED") {
        showToast("success", `[${toolName.toUpperCase()}] ${res.message}`);
      } else {
        showToast("error", `[${toolName.toUpperCase()}] Test Failed: ${res.message}`);
      }
    } catch (err: any) {
      showToast("error", `Test error: ${err.message || "Failed to reach test server"}`);
    } finally {
      setTestingTool(null);
    }
  };

  // Save Integration to Supabase DB
  const handleSaveIntegration = async (
    toolName: string,
    displayName: string,
    config: Record<string, any>,
    credentials: Record<string, any>
  ) => {
    setSavingTool(toolName);
    try {
      const saved = await api.saveUserIntegration({
        user_id: "demo_user",
        tool_name: toolName,
        display_name: displayName,
        config,
        credentials,
      });
      showToast(
        "success",
        `Saved ${displayName} to Supabase! Status: ${saved.status}. ${saved.test_message || ""}`
      );
      await loadIntegrations();
    } catch (err: any) {
      showToast("error", `Failed to save integration: ${err.message}`);
    } finally {
      setSavingTool(null);
    }
  };

  // Delete Integration
  const handleDeleteIntegration = async (toolName: string) => {
    const existing = integrations.find((i) => i.tool_name === toolName);
    if (!existing) return;
    try {
      await api.deleteUserIntegration(existing.id);
      showToast("success", `Removed ${existing.display_name}`);
      await loadIntegrations();
    } catch (err: any) {
      showToast("error", `Failed to delete: ${err.message}`);
    }
  };

  const getStatusBadge = (toolName: string) => {
    const dbItem = integrations.find((i) => i.tool_name === toolName);
    const rawTest = testResults[toolName];
    const status = rawTest ? rawTest.status : dbItem ? dbItem.status : "UNTESTED";
    const msg = rawTest ? rawTest.message : dbItem?.error_message;

    if (status === "CONNECTED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="h-3.5 w-3.5" /> Connected
        </span>
      );
    }
    if (status === "ERROR") {
      return (
        <div className="flex flex-col items-end gap-0.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="h-3.5 w-3.5" /> Error
          </span>
          {msg && <span className="text-[10px] text-rose-400/80 max-w-xs text-right font-mono truncate">{msg}</span>}
        </div>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
        Untested
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
              <Settings className="h-5 w-5 text-zinc-300" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
              OpsForge Settings & Tool Integrations
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage your external tools (GitHub, Grafana, PostgreSQL) with AES-256 encrypted credentials stored in Supabase.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-lg border border-zinc-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("integrations")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
              activeTab === "integrations"
                ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Link2 className="h-3.5 w-3.5" /> Integrations
          </button>
          <button
            onClick={() => setActiveTab("system")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
              activeTab === "system"
                ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Cpu className="h-3.5 w-3.5" /> Agent & Safety
          </button>
        </div>
      </div>

      {/* Global Toast */}
      {feedback && (
        <div
          className={`p-3 rounded-lg border text-xs font-mono flex items-center justify-between animate-in slide-in-from-top-2 ${
            feedback.type === "success"
              ? "bg-emerald-950/40 text-emerald-300 border-emerald-800/50"
              : "bg-rose-950/40 text-rose-300 border-rose-800/50"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-zinc-400 hover:text-zinc-200">
            ×
          </button>
        </div>
      )}

      {/* TAB 1: INTEGRATIONS */}
      {activeTab === "integrations" && (
        <div className="space-y-6">
          {/* Security Banner */}
          <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-start gap-3">
            <Lock className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
            <div className="text-xs space-y-0.5">
              <span className="font-semibold text-zinc-200 block">AES-256 Multi-Tenant Credential Encryption</span>
              <p className="text-zinc-400">
                All sensitive API tokens and passwords are encrypted using Python Fernet before being written to your Supabase PostgreSQL cluster. Secrets are never exposed in API responses.
              </p>
            </div>
          </div>

          {/* 1. GITHUB INTEGRATION */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-purple-400" />
                  GitHub Repository & Code Operations
                </CardTitle>
                <CardDescription>
                  Configure code repo inspection, PR review fetching, and workflow triggering.
                </CardDescription>
              </div>
              {getStatusBadge("github")}
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Display Name</label>
                  <Input
                    value={githubForm.displayName}
                    onChange={(e) => setGithubForm({ ...githubForm, displayName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Repo Owner / Org</label>
                  <Input
                    value={githubForm.repoOwner}
                    onChange={(e) => setGithubForm({ ...githubForm, repoOwner: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Repository Name</label>
                  <Input
                    value={githubForm.repoName}
                    onChange={(e) => setGithubForm({ ...githubForm, repoName: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center justify-between">
                  <span>GitHub Personal Access Token (PAT)</span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {integrations.find((i) => i.tool_name === "github")?.has_credentials
                      ? "🔑 Encrypted Key Present"
                      : "Optional for public repos"}
                  </span>
                </label>
                <Input
                  type="password"
                  placeholder={
                    integrations.find((i) => i.tool_name === "github")?.has_credentials
                      ? "•••••••••••••••••••• (Leave blank to keep existing)"
                      : "ghp_xxxxxxxxxxxxxxxxxxxx"
                  }
                  value={githubForm.token}
                  onChange={(e) => setGithubForm({ ...githubForm, token: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={testingTool === "github"}
                  onClick={() =>
                    handleTestRaw(
                      "github",
                      { repo_owner: githubForm.repoOwner, repo_name: githubForm.repoName },
                      githubForm.token ? { github_token: githubForm.token } : {}
                    )
                  }
                  className="font-mono text-xs"
                >

                  {testingTool === "github" ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  )}
                  Test Connection
                </Button>

                <div className="flex items-center gap-2">
                  {integrations.some((i) => i.tool_name === "github") && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteIntegration("github")}
                      className="font-mono text-xs text-rose-400 hover:text-rose-300 border-rose-900/40 hover:bg-rose-950/30"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={savingTool === "github"}
                    onClick={() =>
                      handleSaveIntegration(
                        "github",
                        githubForm.displayName,
                        { repo_owner: githubForm.repoOwner, repo_name: githubForm.repoName },
                        githubForm.token ? { github_token: githubForm.token } : {}
                      )
                    }
                    className="font-mono text-xs"
                  >
                    {savingTool === "github" ? "Saving..." : "Save GitHub Setup"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. GRAFANA INTEGRATION */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-amber-400" />
                  Grafana Observability & Metrics Engine
                </CardTitle>
                <CardDescription>
                  Fetch real-time metric graphs, Prometheus query alerts, and dashboard snapshots.
                </CardDescription>
              </div>
              {getStatusBadge("grafana")}
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Display Name</label>
                  <Input
                    value={grafanaForm.displayName}
                    onChange={(e) => setGrafanaForm({ ...grafanaForm, displayName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Grafana Base URL</label>
                  <Input
                    value={grafanaForm.baseUrl}
                    onChange={(e) => setGrafanaForm({ ...grafanaForm, baseUrl: e.target.value })}
                    placeholder="https://grafana.yourdomain.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center justify-between">
                  <span>API Key / Service Account Token</span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {integrations.find((i) => i.tool_name === "grafana")?.has_credentials
                      ? "🔑 Encrypted Key Present"
                      : "Required for auth"}
                  </span>
                </label>
                <Input
                  type="password"
                  placeholder={
                    integrations.find((i) => i.tool_name === "grafana")?.has_credentials
                      ? "•••••••••••••••••••• (Leave blank to keep existing)"
                      : "eyJrZXlOIjoiZXhhbXBsZSI..."
                  }
                  value={grafanaForm.apiKey}
                  onChange={(e) => setGrafanaForm({ ...grafanaForm, apiKey: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={testingTool === "grafana"}
                  onClick={() =>
                    handleTestRaw(
                      "grafana",
                      { base_url: grafanaForm.baseUrl },
                      grafanaForm.apiKey ? { api_key: grafanaForm.apiKey } : {}
                    )
                  }
                  className="font-mono text-xs"
                >
                  {testingTool === "grafana" ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  )}
                  Test Connection
                </Button>

                <div className="flex items-center gap-2">
                  {integrations.some((i) => i.tool_name === "grafana") && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteIntegration("grafana")}
                      className="font-mono text-xs text-rose-400 hover:text-rose-300 border-rose-900/40 hover:bg-rose-950/30"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={savingTool === "grafana"}
                    onClick={() =>
                      handleSaveIntegration(
                        "grafana",
                        grafanaForm.displayName,
                        { base_url: grafanaForm.baseUrl },
                        grafanaForm.apiKey ? { api_key: grafanaForm.apiKey } : {}
                      )
                    }
                    className="font-mono text-xs"
                  >
                    {savingTool === "grafana" ? "Saving..." : "Save Grafana Setup"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. POSTGRESQL INTEGRATION */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-emerald-400" />
                  PostgreSQL Target Database Inspection
                </CardTitle>
                <CardDescription>
                  Perform read-only query diagnostics, table schema inspection, and lock detection.
                </CardDescription>
              </div>
              {getStatusBadge("postgres")}
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Host / Pooler Endpoint</label>
                  <Input
                    value={postgresForm.host}
                    onChange={(e) => setPostgresForm({ ...postgresForm, host: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Port</label>
                  <Input
                    value={postgresForm.port}
                    onChange={(e) => setPostgresForm({ ...postgresForm, port: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Database Name</label>
                  <Input
                    value={postgresForm.dbName}
                    onChange={(e) => setPostgresForm({ ...postgresForm, dbName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Username</label>
                  <Input
                    value={postgresForm.username}
                    onChange={(e) => setPostgresForm({ ...postgresForm, username: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1 flex items-center justify-between">
                  <span>Database Password</span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {integrations.find((i) => i.tool_name === "postgres")?.has_credentials
                      ? "🔑 Encrypted Password Stored"
                      : "Required for Postgres auth"}
                  </span>
                </label>
                <Input
                  type="password"
                  placeholder={
                    integrations.find((i) => i.tool_name === "postgres")?.has_credentials
                      ? "•••••••••••••••••••• (Leave blank to keep existing)"
                      : "Password"
                  }
                  value={postgresForm.password}
                  onChange={(e) => setPostgresForm({ ...postgresForm, password: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={testingTool === "postgres"}
                  onClick={() =>
                    handleTestRaw(
                      "postgres",
                      {
                        host: postgresForm.host,
                        port: Number(postgresForm.port),
                        database: postgresForm.dbName,
                        user: postgresForm.username,
                      },
                      postgresForm.password ? { password: postgresForm.password } : {}
                    )
                  }
                  className="font-mono text-xs"
                >
                  {testingTool === "postgres" ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5 mr-1" />
                  )}
                  Test Connection
                </Button>

                <div className="flex items-center gap-2">
                  {integrations.some((i) => i.tool_name === "postgres") && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteIntegration("postgres")}
                      className="font-mono text-xs text-rose-400 hover:text-rose-300 border-rose-900/40 hover:bg-rose-950/30"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={savingTool === "postgres"}
                    onClick={() =>
                      handleSaveIntegration(
                        "postgres",
                        postgresForm.displayName,
                        {
                          host: postgresForm.host,
                          port: Number(postgresForm.port),
                          database: postgresForm.dbName,
                          user: postgresForm.username,
                        },
                        postgresForm.password ? { password: postgresForm.password } : {}
                      )
                    }
                    className="font-mono text-xs"
                  >
                    {savingTool === "postgres" ? "Saving..." : "Save Postgres Setup"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: SYSTEM SAFETY & HARNESS SETTINGS */}
      {activeTab === "system" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setIsSystemSaved(true);
            setTimeout(() => setIsSystemSaved(false), 2500);
          }}
          className="space-y-6"
        >
          {/* Model Provider */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
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
              <CardTitle className="flex items-center gap-2">
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
            {isSystemSaved && (
              <span className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 animate-in fade-in">
                <Check className="h-4 w-4" />
                System settings saved!
              </span>
            )}
            <Button type="submit" variant="primary" size="sm" className="font-mono text-xs">
              Save System Configuration
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
