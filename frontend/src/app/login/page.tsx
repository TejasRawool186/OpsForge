"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Shield, KeyRound, Mail, User, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const LineWaves = dynamic(() => import("@/components/ui/LineWaves"), {
  ssr: false,
});

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("SRE_OPERATOR");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const authEndpoint = isSignup ? "/api/v1/auth/signup" : "/api/v1/auth/login";
    const bodyData = isSignup
      ? { email: email.trim(), password, full_name: fullName, role }
      : { email: email.trim(), password };

    const envUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const cleanEnvBase = envUrl ? envUrl.replace(/\/$/, "").replace(/\/api\/v1$/, "") : "";

    const candidateUrls = Array.from(new Set([
      authEndpoint,
      `http://localhost:8000${authEndpoint}`,
      cleanEnvBase ? `${cleanEnvBase}${authEndpoint}` : "",
    ])).filter(Boolean);

    let res: Response | null = null;

    for (const url of candidateUrls) {
      try {
        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData),
        });

        res = resp;
        break;
      } catch (err) {
        console.warn(`Connection attempt failed for ${url}:`, err);
      }
    }

    if (!res) {
      setError("Unable to connect to OpsForge backend service. Please check backend status.");
      setLoading(false);
      return;
    }

    try {
      const data = await res.json();

      if (!res.ok) {
        let errStr = "Authentication failed. Please check your credentials.";
        if (data?.detail) {
          errStr = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
        } else if (data?.message) {
          errStr = data.message;
        }
        setError(errStr);
        setLoading(false);
        return;
      }

      // Store auth state in unified AuthContext
      login(data.access_token, data.user);
      setSuccessMsg(isSignup ? "Account created successfully! Redirecting..." : "Login successful! Redirecting...");

      setTimeout(() => {
        router.push("/incidents");
      }, 400);
    } catch (parseErr) {
      setError("Received invalid response from authentication server.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d10] text-white flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans select-none animate-in fade-in duration-300">
      {/* Shared WebGL Background — Identical to Landing Page */}
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

      {/* Decorative Ambient Orbs — Identical to Landing Page */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Glassmorphism Auth Card */}
      <div className="w-full max-w-md bg-[#141417]/90 backdrop-blur-2xl border border-[#23232a] rounded-3xl p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-indigo-600 p-0.5 shadow-xl shadow-indigo-500/20 mb-4 flex items-center justify-center">
            <div className="h-full w-full bg-[#0d0d10] rounded-[14px] flex items-center justify-center">
              <Shield className="h-7 w-7 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {isSignup ? "Create OpsForge Account" : "Control Room Sign In"}
          </h1>
          <p className="text-xs text-[#a1a1aa] mt-1.5 leading-relaxed">
            {isSignup
              ? "Join the multi-tenant autonomous incident response platform"
              : "Enter your credentials to manage live SRE telemetry and agent security gates"}
          </p>
        </div>

        {/* Feedback Banners */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400 text-xs animate-in fade-in duration-200">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3 text-emerald-400 text-xs animate-in fade-in duration-200">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div className="animate-in fade-in duration-200">
              <label className="block text-[11px] font-semibold text-[#8e8e99] mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-[#71717a]" />
                <input
                  type="text"
                  required={isSignup}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Tejas Rawool"
                  className="w-full bg-[#0d0d10] border border-[#23232a] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#52525b] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-[#8e8e99] mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[#71717a]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tejas@opsforge.io"
                className="w-full bg-[#0d0d10] border border-[#23232a] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#52525b] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#8e8e99] mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-[#71717a]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#0d0d10] border border-[#23232a] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#52525b] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {isSignup && (
            <div className="animate-in fade-in duration-200">
              <label className="block text-[11px] font-semibold text-[#8e8e99] mb-1.5 uppercase tracking-wider">
                System Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#0d0d10] border border-[#23232a] rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              >
                <option value="SRE_OPERATOR">SRE Operator</option>
                <option value="ADMIN">Administrator</option>
                <option value="SECURITY_LEAD">Security Lead</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 group disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            ) : (
              <>
                <span>{isSignup ? "Create Account" : "Sign In to Control Room"}</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Signup/Login */}
        <div className="mt-6 pt-6 border-t border-[#23232a] text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setError(null);
              setSuccessMsg(null);
            }}
            className="text-xs text-[#8e8e99] hover:text-white transition-colors cursor-pointer"
          >
            {isSignup ? (
              <span>Already have an account? <strong className="text-indigo-400 hover:underline">Sign in</strong></span>
            ) : (
              <span>{"Don't have an account?"} <strong className="text-indigo-400 hover:underline">Create one</strong></span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
