"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  Workspace,
  GitHubRepo,
  GitHubConnectionInfo,
  ReadinessCheckResult,
  UserIntegration,
} from "@/types";
import LineWaves from "@/components/ui/LineWaves";
import {
  ShieldCheck,
  GitBranch,
  Activity,
  Database,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Zap,
  ExternalLink,
  Layers,
  Lock,
  ChevronRight,
  Server,
} from "lucide-react";

type WizardStep = "workspace" | "github" | "observability" | "safety" | "readiness";

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [currentStep, setCurrentStep] = useState<WizardStep>("workspace");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Workspace State
  const [workspaceName, setWorkspaceName] = useState("");
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);

  // Step 2: GitHub State
  const [githubStatus, setGithubStatus] = useState<GitHubConnectionInfo | null>(null);
  const [repositories, setRepositories] = useState<GitHubRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [connectingGithub, setConnectingGithub] = useState(false);

  // Step 3: Observability (Grafana/Postgres)
  const [grafanaUrl, setGrafanaUrl] = useState("");
  const [grafanaToken, setGrafanaToken] = useState("");
  const [postgresUrl, setPostgresUrl] = useState("");
  const [grafanaSaved, setGrafanaSaved] = useState(false);
  const [postgresSaved, setPostgresSaved] = useState(false);

  // Step 4: Safety State
  const [approvalThreshold, setApprovalThreshold] = useState("MEDIUM");

  // Step 5: Readiness State
  const [readiness, setReadiness] = useState<ReadinessCheckResult | null>(null);
  const [checkingReadiness, setCheckingReadiness] = useState(false);

  // Check auth and initial workspace state
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    if (isAuthenticated) {
      initOnboarding();
    }
  }, [isAuthenticated, authLoading]);

  // Handle GitHub OAuth Callback query params (?code=...&state=...)
  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const installationId = searchParams.get("installation_id");

    if (code && state && activeWorkspace) {
      handleGithubCallback(code, state, installationId || undefined);
    }
  }, [searchParams, activeWorkspace]);

  const initOnboarding = async () => {
    try {
      setLoading(true);
      const state = await api.getOnboardingState();
      if (state.has_workspace && state.workspace_id) {
        const ws = await api.getWorkspace(state.workspace_id);
        setActiveWorkspace(ws);
        setWorkspaceName(ws.name);

        // Map server step to wizard step
        if (ws.onboarding_step === "github") setCurrentStep("github");
        else if (ws.onboarding_step === "repositories") setCurrentStep("github");
        else if (ws.onboarding_step === "grafana" || ws.onboarding_step === "postgres") setCurrentStep("observability");
        else if (ws.onboarding_step === "safety") setCurrentStep("safety");
        else if (ws.onboarding_step === "readiness") setCurrentStep("readiness");
        else setCurrentStep("workspace");

        // Fetch GitHub status if workspace exists
        loadGithubStatus(ws.id);
      }
    } catch (err: any) {
      loggerError("Failed to initialize onboarding", err);
    } finally {
      setLoading(false);
    }
  };

  const loggerError = (msg: string, err: any) => {
    setError(err?.message || msg);
  };

  const loadGithubStatus = async (wsId: string) => {
    try {
      const status = await api.getGitHubStatus(wsId);
      setGithubStatus(status);
      if (status.selected_repository) {
        setSelectedRepo(status.selected_repository);
      }
      if (status.connected) {
        const reposRes = await api.listGitHubRepositories(wsId);
        setRepositories(reposRes.repositories || []);
      }
    } catch (err) {
      // Ignore if not connected
    }
  };

  const handleGithubCallback = async (code: string, state: string, installationId?: string) => {
    try {
      setLoading(true);
      setError(null);
      await api.handleGitHubCallback({
        code,
        state,
        installation_id: installationId,
        workspace_id: activeWorkspace!.id,
      });
      setCurrentStep("github");
      await loadGithubStatus(activeWorkspace!.id);
    } catch (err: any) {
      setError(`GitHub Authentication Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Handle Create Workspace
  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceName.trim()) {
      setError("Please enter a workspace name.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      let ws: Workspace;
      if (activeWorkspace) {
        ws = activeWorkspace;
      } else {
        ws = await api.createWorkspace({
          name: workspaceName,
        });
        setActiveWorkspace(ws);
      }
      await api.updateOnboarding(ws.id, { step: "github", status: "IN_PROGRESS" });
      setCurrentStep("github");
      loadGithubStatus(ws.id);
    } catch (err: any) {
      setError(err.message || "Failed to create workspace");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle GitHub Connect Button
  const handleConnectGithub = async () => {
    if (!activeWorkspace) return;
    setConnectingGithub(true);
    setError(null);
    try {
      const res = await api.getGitHubConnectUrl(activeWorkspace.id);
      window.location.href = res.authorization_url;
    } catch (err: any) {
      setError(err.message || "Failed to start GitHub authorization flow");
      setConnectingGithub(false);
    }
  };

  // Step 2: Select Repository
  const handleSelectRepository = async (repo: GitHubRepo) => {
    if (!activeWorkspace) return;
    setLoading(true);
    try {
      await api.selectGitHubRepository({
        workspace_id: activeWorkspace.id,
        owner: repo.owner,
        name: repo.name,
        full_name: repo.full_name,
        default_branch: repo.default_branch,
      });
      setSelectedRepo(repo);
      setGithubStatus((prev) => prev ? { ...prev, selected_repository: repo } : null);
    } catch (err: any) {
      setError(err.message || "Failed to select repository");
    } finally {
      setLoading(false);
    }
  };

  const handleFinishGithubStep = async () => {
    if (!activeWorkspace) return;
    setLoading(true);
    try {
      await api.updateOnboarding(activeWorkspace.id, { step: "grafana" });
      setCurrentStep("observability");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Save Observability Integrations
  const handleSaveGrafana = async () => {
    if (!grafanaUrl) return;
    try {
      await api.saveUserIntegration({
        tool_name: "grafana",
        display_name: "Grafana Observability",
        config: { url: grafanaUrl },
        credentials: { api_key: grafanaToken },
      });
      setGrafanaSaved(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSavePostgres = async () => {
    if (!postgresUrl) return;
    try {
      await api.saveUserIntegration({
        tool_name: "postgres",
        display_name: "Production PostgreSQL",
        config: { connection_url: postgresUrl },
        credentials: { connection_url: postgresUrl },
      });
      setPostgresSaved(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleFinishObservabilityStep = async () => {
    if (!activeWorkspace) return;
    setLoading(true);
    try {
      await api.updateOnboarding(activeWorkspace.id, { step: "safety" });
      setCurrentStep("safety");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Finish Safety Step
  const handleFinishSafetyStep = async () => {
    if (!activeWorkspace) return;
    setLoading(true);
    try {
      await api.updateOnboarding(activeWorkspace.id, { step: "readiness" });
      setCurrentStep("readiness");
      runReadinessCheck();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 5: Run Readiness Verification
  const runReadinessCheck = async () => {
    if (!activeWorkspace) return;
    setCheckingReadiness(true);
    setError(null);
    try {
      const res = await api.checkReadiness(activeWorkspace.id);
      setReadiness(res);
    } catch (err: any) {
      setError(err.message || "Failed to complete readiness check");
    } finally {
      setCheckingReadiness(false);
    }
  };

  // Step 5: Final Launch
  const handleCompleteOnboarding = async () => {
    if (!activeWorkspace) return;
    setLoading(true);
    try {
      const res = await api.completeOnboarding(activeWorkspace.id);
      router.push(res.redirect_url || "/incidents");
    } catch (err: any) {
      setError(err.message || "Failed to finalize onboarding");
      setLoading(false);
    }
  };

  const stepsList = [
    { id: "workspace", label: "Workspace Setup", icon: Layers },
    { id: "github", label: "GitHub Integration", icon: GitBranch },
    { id: "observability", label: "Observability", icon: Activity },
    { id: "safety", label: "Safety Controls", icon: ShieldCheck },
    { id: "readiness", label: "Readiness Check", icon: Server },
  ];

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col justify-between selection:bg-white selection:text-black overflow-x-hidden">
      {/* Static Black-and-White LineWaves WebGL Background */}
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
        <LineWaves
          speed={0.15}
          innerLineCount={32}
          outerLineCount={36}
          warpIntensity={0.5}
          rotation={-45}
          edgeFadeWidth={0.0}
          colorCycleSpeed={0.2}
          brightness={0.4}
          color1="#ffffff"
          color2="#e4e4e7"
          color3="#71717a"
          enableMouseInteraction={false}
        />
      </div>

      {/* Subtle Dark Gradient Overlay */}
      <div className="fixed inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/90 pointer-events-none z-[1]" />

      {/* Header */}
      <header className="relative z-10 border-b border-zinc-800/80 bg-black/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-white/10">
            <Zap className="w-5 h-5 text-black font-bold" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              OpsForge Setup
            </h1>
            <p className="text-xs text-zinc-400">Autonomous SRE Integration Onboarding</p>
          </div>
        </div>
        {user && (
          <div className="text-xs text-zinc-400 flex items-center gap-2 bg-zinc-900/80 px-3 py-1.5 rounded-full border border-zinc-800">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            <span>{user.email}</span>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-4xl w-full mx-auto px-4 py-8 flex-1 flex flex-col">
        {/* Step Stepper Navigation */}
        <div className="mb-8 bg-black/60 border border-zinc-800/80 rounded-2xl p-4 backdrop-blur-md shadow-2xl">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {stepsList.map((step, idx) => {
              const Icon = step.icon;
              const isCurrent = currentStep === step.id;
              const stepIdxs = ["workspace", "github", "observability", "safety", "readiness"];
              const isPast = stepIdxs.indexOf(currentStep) > stepIdxs.indexOf(step.id);

              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                        isCurrent
                          ? "bg-white text-black shadow-lg shadow-white/20 scale-110"
                          : isPast
                          ? "bg-zinc-800 text-white border border-zinc-700"
                          : "bg-zinc-900/80 text-zinc-600 border border-zinc-800"
                      }`}
                    >
                      {isPast ? <CheckCircle2 className="w-5 h-5 text-white" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span
                      className={`text-xs font-medium hidden sm:inline ${
                        isCurrent ? "text-white font-semibold" : isPast ? "text-zinc-300" : "text-zinc-600"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {idx < stepsList.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 transition-all duration-500 ${
                        isPast ? "bg-zinc-700" : "bg-zinc-900"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Global Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-zinc-900/90 border border-zinc-700 text-zinc-200 flex items-start gap-3 backdrop-blur-md shadow-lg">
            <AlertCircle className="w-5 h-5 text-white shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">{error}</div>
            <button
              onClick={() => setError(null)}
              className="text-xs text-zinc-400 hover:text-white underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-black/60 border border-zinc-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl flex-1 flex flex-col justify-between">
          {/* STEP 1: WORKSPACE SETUP */}
          {currentStep === "workspace" && (
            <form onSubmit={handleCreateWorkspace} className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium mb-3">
                  <Layers className="w-3.5 h-3.5" /> Step 1 of 5
                </div>
                <h2 className="text-2xl font-bold text-white">Create Operational Workspace</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Workspaces isolate operational environments, incident telemetry, and GitHub authorization scope.
                </p>
              </div>

              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                    Workspace Name
                  </label>
                  <input
                    type="text"
                    required
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    placeholder="e.g. Acme Production Engineering"
                    className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all text-sm"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-800 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-lg shadow-white/10 disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  Save Workspace & Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: GITHUB INTEGRATION */}
          {currentStep === "github" && (
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium mb-3">
                  <GitBranch className="w-3.5 h-3.5" /> Step 2 of 5
                </div>
                <h2 className="text-2xl font-bold text-white">GitHub Integration</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Connect your GitHub App to enable automated commit inspection, pull request generation, and patch verification.
                </p>
              </div>

              {/* GitHub OAuth Connection Status */}
              <div className="p-6 rounded-2xl bg-black border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                      <GitBranch className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">GitHub App Connection</h3>
                      <p className="text-xs text-zinc-400">
                        {githubStatus?.connected
                          ? `Connected as @${githubStatus.github_username || "User"}`
                          : "Not connected to GitHub App"}
                      </p>
                    </div>
                  </div>

                  {githubStatus?.connected ? (
                    <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-white text-xs font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" /> Connected
                    </span>
                  ) : (
                    <button
                      onClick={handleConnectGithub}
                      disabled={connectingGithub}
                      className="px-5 py-2.5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                    >
                      {connectingGithub ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                      Authorize GitHub App
                    </button>
                  )}
                </div>
              </div>

              {/* Repository Selection */}
              {githubStatus?.connected && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-zinc-200">Select Target Repository</h3>
                  <p className="text-xs text-zinc-400">
                    OpsForge will monitor commit logs and generate fixes against this primary repository.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                    {repositories.map((repo) => {
                      const isSelected = selectedRepo?.full_name === repo.full_name;
                      return (
                        <div
                          key={repo.full_name}
                          onClick={() => handleSelectRepository(repo)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? "bg-zinc-900 border-white text-white shadow-md shadow-white/10"
                              : "bg-black border-zinc-800 hover:border-zinc-700 text-zinc-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-semibold text-sm text-white truncate">{repo.full_name}</div>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
                          </div>
                          <div className="text-xs text-zinc-500 mt-1 flex items-center gap-2">
                            <span>Branch: {repo.default_branch}</span>
                            {repo.private && <span className="text-zinc-400 font-mono">Private</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-zinc-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep("workspace")}
                  className="px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all text-sm flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={handleFinishGithubStep}
                  disabled={loading || !githubStatus?.connected}
                  className="px-6 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-lg shadow-white/10 disabled:opacity-50"
                >
                  Continue to Observability <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: OBSERVABILITY (Grafana & Postgres) */}
          {currentStep === "observability" && (
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium mb-3">
                  <Activity className="w-3.5 h-3.5" /> Step 3 of 5
                </div>
                <h2 className="text-2xl font-bold text-white">Observability & Data Sources</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Connect telemetry tools to allow OpsForge agents to query Prometheus metrics and database schemas during incident root-cause analysis.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Grafana Box */}
                <div className="p-5 rounded-2xl bg-black border border-zinc-800 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm">Grafana Metrics & Logs</h3>
                      <p className="text-xs text-zinc-400">Prometheus / Loki endpoint</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="url"
                      placeholder="https://grafana.example.com"
                      value={grafanaUrl}
                      onChange={(e) => setGrafanaUrl(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                    />
                    <input
                      type="password"
                      placeholder="Grafana API Service Account Token"
                      value={grafanaToken}
                      onChange={(e) => setGrafanaToken(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white"
                    />
                    <button
                      type="button"
                      onClick={handleSaveGrafana}
                      className="w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-white transition-all flex items-center justify-center gap-1.5 border border-zinc-800"
                    >
                      {grafanaSaved ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : null}
                      {grafanaSaved ? "Grafana Config Saved" : "Save Grafana Connection"}
                    </button>
                  </div>
                </div>

                {/* Postgres Box */}
                <div className="p-5 rounded-2xl bg-black border border-zinc-800 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                      <Database className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm">PostgreSQL Connection</h3>
                      <p className="text-xs text-zinc-400">Read-only diagnostic query access</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="postgresql://user:pass@host:5432/dbname"
                      value={postgresUrl}
                      onChange={(e) => setPostgresUrl(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-white font-mono"
                    />
                    <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-[11px] text-zinc-400">
                      Credentials are encrypted using AES-256-GCM before database storage.
                    </div>
                    <button
                      type="button"
                      onClick={handleSavePostgres}
                      className="w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-white transition-all flex items-center justify-center gap-1.5 border border-zinc-800"
                    >
                      {postgresSaved ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : null}
                      {postgresSaved ? "Postgres Config Saved" : "Save Postgres Connection"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep("github")}
                  className="px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all text-sm flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={handleFinishObservabilityStep}
                  className="px-6 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-lg shadow-white/10"
                >
                  Continue to Safety Controls <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SAFETY CONTROLS */}
          {currentStep === "safety" && (
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium mb-3">
                  <ShieldCheck className="w-3.5 h-3.5" /> Step 4 of 5
                </div>
                <h2 className="text-2xl font-bold text-white">Safety & Risk Policy Configuration</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  OpsForge enforces mandatory Human-in-the-Loop approvals for destructive commands or production remediations.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-black border border-zinc-800 space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                    Human Approval Risk Threshold
                  </label>
                  <p className="text-xs text-zinc-400 mb-4">
                    Any action classified at or above this risk level will pause execution and require explicit SRE Operator authorization.
                  </p>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "LOW", label: "Low Risk+", desc: "Approve almost all write operations" },
                      { id: "MEDIUM", label: "Medium Risk+", desc: "Approve restarts, config patches, DB migrations" },
                      { id: "HIGH", label: "High/Destructive", desc: "Approve destructive actions only" },
                    ].map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setApprovalThreshold(item.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          approvalThreshold === item.id
                            ? "bg-zinc-900 border-white text-white shadow-md shadow-white/10"
                            : "bg-black border-zinc-800 text-zinc-400 hover:border-zinc-700"
                        }`}
                      >
                        <div className="font-semibold text-sm">{item.label}</div>
                        <div className="text-[11px] opacity-75 mt-1">{item.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-300 text-xs flex items-start gap-3">
                  <Lock className="w-4 h-4 text-white shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Safety Sandbox Active:</span> All remediation scripts execute inside an isolated Docker sandbox with non-root privileges and strict execution timeouts.
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep("observability")}
                  className="px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all text-sm flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={handleFinishSafetyStep}
                  className="px-6 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-lg shadow-white/10"
                >
                  Run System Readiness Check <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: READINESS CHECK */}
          {currentStep === "readiness" && (
            <div className="space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium mb-3">
                  <Server className="w-3.5 h-3.5" /> Step 5 of 5
                </div>
                <h2 className="text-2xl font-bold text-white">Operational Environment Readiness</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  Live end-to-end verification of tool connectivity, agent harness availability, and authorization policies.
                </p>
              </div>

              {/* Live Readiness Matrix */}
              <div className="space-y-3">
                {checkingReadiness ? (
                  <div className="py-12 text-center space-y-4 bg-black border border-zinc-800 rounded-2xl">
                    <RefreshCw className="w-8 h-8 text-white animate-spin mx-auto" />
                    <div className="text-sm text-zinc-300 font-medium">Running live system readiness probe...</div>
                  </div>
                ) : readiness ? (
                  <div className="space-y-3">
                    {/* Overall Summary Bar */}
                    <div className="p-4 rounded-xl bg-black border border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {readiness.overall_ready ? (
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        ) : (
                          <AlertCircle className="w-6 h-6 text-zinc-400" />
                        )}
                        <div>
                          <div className="font-semibold text-sm text-white">
                            {readiness.overall_ready
                              ? "All Critical Systems Ready for Incident Autonomous Response"
                              : "Partial System Readiness"}
                          </div>
                          <div className="text-xs text-zinc-400">
                            {readiness.connected_count} of {readiness.total_count} integration probes verified
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={runReadinessCheck}
                        className="px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white text-xs flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Re-test
                      </button>
                    </div>

                    {/* Probes List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <ProbeCard
                        title="GitHub App & Repo API"
                        status={readiness.github.connected}
                        message={readiness.github.message}
                        icon={GitBranch}
                      />
                      <ProbeCard
                        title="Grafana Telemetry Probe"
                        status={readiness.grafana.connected}
                        message={readiness.grafana.message}
                        icon={Activity}
                      />
                      <ProbeCard
                        title="PostgreSQL Diagnostics"
                        status={readiness.postgres.connected}
                        message={readiness.postgres.message}
                        icon={Database}
                      />
                      <ProbeCard
                        title="Safety Approval Gate"
                        status={readiness.safety.configured}
                        message={readiness.safety.message}
                        icon={ShieldCheck}
                      />
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="pt-6 border-t border-zinc-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep("safety")}
                  className="px-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all text-sm flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={handleCompleteOnboarding}
                  disabled={loading}
                  className="px-8 py-3.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-xl shadow-white/20 disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Launch SRE Command Center <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ProbeCard({
  title,
  status,
  message,
  icon: Icon,
}: {
  title: string;
  status: boolean;
  message: string;
  icon: React.ElementType;
}) {
  return (
    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-3">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
          status ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-900 text-slate-500 border border-slate-800"
        }`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-xs text-white truncate">{title}</span>
          {status ? (
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              PASSED
            </span>
          ) : (
            <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
              OPTIONAL / UNSET
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-400 mt-1 leading-snug">{message}</p>
      </div>
    </div>
  );
}
