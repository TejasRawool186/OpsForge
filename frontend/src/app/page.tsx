"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

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
      className="min-h-screen bg-[#0d0d10] text-[#f3f4f6] flex flex-col items-center justify-center cursor-pointer select-none px-6 text-center animate-in fade-in duration-300"
    >
      <div className="space-y-6 max-w-xl">
        <div>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-white">
            OpsForge
          </h1>
          <p className="text-xs sm:text-sm text-[#71717a] font-mono tracking-widest uppercase mt-2">
            AUTONOMOUS SRE AGENT
          </p>
        </div>

        <p className="text-sm text-[#8e8e99] max-w-md mx-auto leading-relaxed font-normal">
          Autonomous telemetry diagnosis, sandbox validation, and human-gated incident remediation.
        </p>

        <div className="pt-10">
          <span className="inline-flex items-center gap-2 text-xs font-mono text-[#a1a1aa] hover:text-white px-4 py-2 rounded-full border border-[#23232a] bg-[#141417] transition-all animate-pulse">
            <span>Click anywhere to continue</span>
            <span>&rarr;</span>
          </span>
        </div>
      </div>
    </div>
  );
}
