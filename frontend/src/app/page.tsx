"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const LineWaves = dynamic(() => import("@/components/ui/LineWaves"), {
  ssr: false,
});

export default function LandingPage() {
  const router = useRouter();

  const handleContinue = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("opsforge_session", "active");
    }
    router.push("/incidents");
  };

  React.useEffect(() => {
    const handleKeyDown = () => {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("opsforge_session", "active");
      }
      router.push("/incidents");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <div
      onClick={handleContinue}
      className="min-h-screen bg-[#0d0d10] text-[#f3f4f6] flex flex-col items-center justify-center cursor-pointer select-none relative overflow-hidden"
    >
      {/* LineWaves Background */}
      <div className="absolute inset-0 z-0">
        <LineWaves
          speed={0.3}
          innerLineCount={32}
          outerLineCount={36}
          warpIntensity={1.0}
          rotation={-45}
          edgeFadeWidth={0.0}
          colorCycleSpeed={1.0}
          brightness={0.08}
          color1="#ffffff"
          color2="#ffffff"
          color3="#ffffff"
          enableMouseInteraction={true}
          mouseInfluence={2.0}
        />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 text-center px-6 space-y-6 max-w-xl">
        <div>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-white">
            OpsForge
          </h1>
          <p className="text-xs sm:text-sm text-[#a1a1aa] font-mono tracking-widest uppercase mt-2">
            AUTONOMOUS SRE AGENT
          </p>
        </div>

        <p className="text-sm text-[#d4d4d8] max-w-md mx-auto leading-relaxed font-normal">
          Autonomous telemetry diagnosis, sandbox validation, and human-gated incident remediation.
        </p>

        <div className="pt-8">
          <p className="text-xs font-mono text-[#a1a1aa] tracking-wider animate-pulse">
            Click anywhere to continue
          </p>
        </div>
      </div>
    </div>
  );
}
