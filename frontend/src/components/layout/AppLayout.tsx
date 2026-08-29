"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { CommandPalette } from "./CommandPalette";
import { CreateIncidentModal } from "@/components/incidents/CreateIncidentModal";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = React.useState(false);
  const [isCreateIncidentOpen, setIsCreateIncidentOpen] = React.useState(false);

  const isLandingPage = pathname === "/";
  const isLoginPage = pathname === "/login";

  if (isLandingPage || isLoginPage) {
    return (
      <div className="min-h-screen bg-[#0d0d10] text-[#f3f4f6]">
        {children}
        <CreateIncidentModal
          isOpen={isCreateIncidentOpen}
          onClose={() => setIsCreateIncidentOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d10] text-[#f3f4f6] flex">
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
