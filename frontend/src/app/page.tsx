"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  Shield,
  Zap,
  Lock,
  Activity,
  Terminal,
  ArrowRight,
  Server,
  Database,
  GitCommit,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const LineWaves = dynamic(() => import("@/components/ui/LineWaves"), {
  ssr: false,
});

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [isTransitioning, setIsTransitioning] = useState(false);

  // If already authenticated, redirect to Dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/incidents");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleTransition = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      router.push("/login");
    }, 450);
  };

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0d0d10] flex items-center justify-center text-white font-sans">
        <div className="flex items-center gap-3 text-indigo-400">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Initializing Control Room...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleTransition}
      className={`min-h-screen bg-[#0d0d10] text-white flex flex-col justify-between relative overflow-hidden font-sans select-none cursor-pointer transition-all duration-500 ease-out ${
        isTransitioning ? "opacity-0 scale-95 blur-md" : "opacity-100 scale-100 blur-0"
      }`}
    >
      {/* Shared WebGL Background — Identical to Login Page */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <LineWaves
          speed={0.25}
          innerLineCount={30}
          outerLineCount={34}
          warpIntensity={0.8}
          rotation={-30}
          edgeFadeWidth={0.2}
          colorCycleSpeed={0.8}
          brightness={0.06}
          color1="#6366f1"
          color2="#8b5cf6"
          color3="#3b82f6"
          enableMouseInteraction={true}
          mouseInfluence={1.5}
        />
      </div>

      {/* Decorative Orbs — Identical to Login Page */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-indigo-600 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
            <div className="h-full w-full bg-[#0d0d10] rounded-[10px] flex items-center justify-center">
              <Shield className="h-5 w-5 text-indigo-400" />
            </div>
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            OpsForge
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-mono text-indigo-400 uppercase tracking-widest">
            v1.0 Production
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleTransition();
          }}
          className="px-5 py-2.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 border border-indigo-400/30 text-white font-medium text-xs tracking-wide transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span>Sign In to Control Room</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </header>

      {/* Main Hero Section */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center items-center text-center">
        
        {/* Live System Status Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#141417]/80 border border-[#23232a] text-xs text-slate-300 mb-8 backdrop-blur-md shadow-xl animate-in fade-in slide-in-from-top-4 duration-500">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">Telemetry Engine Active</span>
          <span className="text-slate-600">•</span>
          <span className="text-indigo-400 font-medium">Click anywhere to enter Control Room</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl leading-[1.15] mb-6 animate-in fade-in zoom-in-95 duration-700">
          Autonomous AI Agent <br />
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-blue-400 bg-clip-text text-transparent">
            Incident Response Platform
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-sm md:text-base text-slate-400 max-w-2xl leading-relaxed mb-10 animate-in fade-in duration-1000">
          OpsForge connects live SRE telemetry, GitHub commits, Grafana metrics, and automated AI security gates to investigate, diagnose, and remediate production incidents in real time.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTransition();
            }}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-indigo-200" />
            <span>Launch OpsForge Control Room</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-indigo-400" />
            <span>JWT Secured • RBAC Guarded • Real-time Telemetry</span>
          </div>
        </div>

        {/* Live Telemetry Highlights Grid */}
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          
          {/* Card 1 */}
          <div className="bg-[#141417]/80 backdrop-blur-xl border border-[#23232a] rounded-2xl p-6 hover:border-indigo-500/40 transition-all duration-300 group hover:-translate-y-1 shadow-xl">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Zap className="h-5 w-5 text-indigo-400" />
            </div>
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              Autonomous Root Cause Analysis
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Multi-agent reasoning loops inspect stack traces, analyze memory dumps, and match past incident telemetry in seconds.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#141417]/80 backdrop-blur-xl border border-[#23232a] rounded-2xl p-6 hover:border-purple-500/40 transition-all duration-300 group hover:-translate-y-1 shadow-xl">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Shield className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              Human Approval Security Gates
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              High-risk remediation scripts require strict SRE operator review with full audit trails before production execution.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#141417]/80 backdrop-blur-xl border border-[#23232a] rounded-2xl p-6 hover:border-blue-500/40 transition-all duration-300 group hover:-translate-y-1 shadow-xl">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Layers className="h-5 w-5 text-blue-400" />
            </div>
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              Multi-Tenant Credential Vault
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Configure per-user GitHub, Grafana, and PostgreSQL credentials securely stored in Supabase cloud database.
            </p>
          </div>

        </div>
      </main>

      {/* Footer Banner */}
      <footer className="relative z-10 w-full border-t border-[#23232a]/60 bg-[#0d0d10]/80 backdrop-blur-md py-4 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-2 sm:mb-0">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-slate-400">OpsForge Incident Control Room</span>
        </div>
        <div className="text-indigo-400/90 font-medium">
          Click anywhere on screen to launch Sign In →
        </div>
      </footer>
    </div>
  );
}
