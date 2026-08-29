"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { CommandPalette } from "./CommandPalette";
import { CreateIncidentModal } from "@/components/incidents/CreateIncidentModal";
import { useAuth } from "@/context/AuthContext";
import { Terminal } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = React.useState(false);
  const [isCreateIncidentOpen, setIsCreateIncidentOpen] = React.useState(false);

  const isLoginPage = pathname === "/login" || pathname?.startsWith("/login");

  // Initial Auth Verification Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d0d10] text-[#f3f4f6] flex flex-col items-center justify-center space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="h-12 w-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center animate-pulse">
            <Terminal className="h-6 w-6 text-indigo-400" />
          </div>
        </div>
        <p className="text-xs font-mono text-[#8e8e99] tracking-wider uppercase">
          Verifying OpsForge Credentials...
        </p>
      </div>
    );
  }

  // Standalone Layout for Auth Login Page or Unauthenticated State
  if (isLoginPage || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0d0d10] text-[#f3f4f6] selection:bg-indigo-500/30">
        {children}
        <CreateIncidentModal
          isOpen={isCreateIncidentOpen}
          onClose={() => setIsCreateIncidentOpen(false)}
        />
      </div>
    );
  }

  // Full Control Room Layout for Authenticated Pages
  return (
    <div className="min-h-screen bg-[#0d0d10] text-[#f3f4f6] flex selection:bg-indigo-500/30 antialiased font-sans">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenCreateIncident={() => setIsCreateIncidentOpen(true)}
        />
        <main className="flex-1 p-6 md:p-8 ml-64 overflow-y-auto max-w-7xl">
          {children}
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />

      {/* Global Simulate / Create Incident Modal */}
      <CreateIncidentModal
        isOpen={isCreateIncidentOpen}
        onClose={() => setIsCreateIncidentOpen(false)}
      />
    </div>
  );
};
