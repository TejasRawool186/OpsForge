"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { ArrowRight, Sparkles } from "lucide-react";
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
      <div className="min-h-screen bg-black flex items-center justify-center text-white font-sans">
        <div className="flex items-center gap-3 text-zinc-400">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Initializing Control Room...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleTransition}
      className={`min-h-screen bg-black text-white flex flex-col justify-center items-center relative overflow-hidden font-sans select-none cursor-pointer transition-all duration-500 ease-out p-6 ${
        isTransitioning ? "opacity-0 scale-95 blur-md" : "opacity-100 scale-100 blur-0"
      }`}
    >
      {/* React Bits LineWaves Subtle WebGL Background */}
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

      {/* Transparent Subtle Glass Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none z-[1]" />

      {/* Pitch Dark Centered Title & Tagline */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500">
        
        <div className="space-y-3">
          <h1 className="text-7xl sm:text-8xl font-black tracking-tight text-white drop-shadow-2xl">
            OpsForge
          </h1>
          <p className="text-lg sm:text-xl font-normal text-zinc-400 tracking-wide max-w-xl mx-auto">
            Autonomous AI Agent Incident Response Engine
          </p>
        </div>

        {/* Minimal Transparent Glass Pill CTA */}
        <div className="pt-4">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/15 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all shadow-2xl backdrop-blur-md group">
            <Sparkles className="h-4 w-4 text-white group-hover:rotate-12 transition-transform" />
            <span>Click anywhere to Enter Control Room</span>
            <ArrowRight className="h-4 w-4 text-white group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>
    </div>
  );
}
