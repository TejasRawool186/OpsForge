"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { KeyRound, Mail, User, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
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

    const envUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
    let candidateUrls: string[] = [];

    if (envUrl.startsWith("/")) {
      candidateUrls = [authEndpoint, `http://localhost:8000${authEndpoint}`];
    } else {
      const cleanEnvBase = envUrl.replace(/\/$/, "").replace(/\/api\/v1$/, "");
      candidateUrls = [authEndpoint, `${cleanEnvBase}${authEndpoint}`, `http://localhost:8000${authEndpoint}`];
    }

    candidateUrls = Array.from(new Set(candidateUrls)).filter(Boolean);

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
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans select-none animate-in fade-in duration-300">
      {/* Shared WebGL Background with Subtle Color Shift */}
      <div className="absolute inset-0 z-0 opacity-45 pointer-events-none">
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

      {/* Transparent Glass Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none z-[1]" />

      {/* Pitch Dark Glassmorphism Auth Card */}
      <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <h1 className="text-3xl font-black tracking-tight text-white">
            OpsForge
          </h1>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            {isSignup
              ? "Create your account to access the control room"
              : "Enter your credentials to access live incident control"}
          </p>
        </div>

        {/* Feedback Banners */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-red-500/40 flex items-start gap-3 text-red-400 text-xs animate-in fade-in duration-200">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-emerald-500/40 flex items-start gap-3 text-emerald-400 text-xs animate-in fade-in duration-200">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
            <span className="leading-relaxed">{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div className="animate-in fade-in duration-200">
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  required={isSignup}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Tejas Rawool"
                  className="w-full bg-black/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tejas@opsforge.io"
                className="w-full bg-black/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-black/60 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
              />
            </div>
          </div>

          {isSignup && (
            <div className="animate-in fade-in duration-200">
              <label className="block text-[11px] font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
                System Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
              >
                <option value="SRE_OPERATOR" className="bg-black text-white">SRE Operator</option>
                <option value="ADMIN" className="bg-black text-white">Administrator</option>
                <option value="SECURITY_LEAD" className="bg-black text-white">Security Lead</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-sm transition-all shadow-xl flex items-center justify-center gap-2 group disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-black" />
            ) : (
              <>
                <span>{isSignup ? "Create Account" : "Sign In to Control Room"}</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Toggle Signup/Login */}
        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setError(null);
              setSuccessMsg(null);
            }}
            className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            {isSignup ? (
              <span>Already have an account? <strong className="text-white underline underline-offset-4">Sign in</strong></span>
            ) : (
              <span>{"Don't have an account?"} <strong className="text-white underline underline-offset-4">Create one</strong></span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
