"use client";

import * as React from "react";
import { Search, Sun, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface NavbarProps {
  onOpenCommandPalette: () => void;
  onOpenCreateIncident: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCommandPalette,
  onOpenCreateIncident,
}) => {
  return (
    <header className="h-16 bg-[#0d0d10] px-8 flex items-center justify-between sticky top-0 z-30 ml-64">
      {/* Left: Search Bar */}
      <div className="w-80">
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center justify-between w-full h-10 px-4 rounded-xl border border-[#23232a] bg-[#141417] hover:border-[#32323d] text-xs text-[#8e8e99] hover:text-white transition-all text-left group"
        >
          <span>Search issues, projects...</span>
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-[#1f1f26] border border-[#2e2e38] text-[10px] font-mono text-[#71717a]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions, Theme, Notifications & Admin Pill */}
      <div className="flex items-center gap-3">
        {/* Simulate Incident Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenCreateIncident}
          className="rounded-xl border-[#23232a] bg-[#141417] hover:bg-[#1a1a20] text-xs font-medium gap-1.5 text-[#d1d5db]"
        >
          <Plus className="h-3.5 w-3.5" />
          Simulate Incident
        </Button>

        {/* Theme Toggle Icon Button */}
        <button
          className="p-2 rounded-xl text-[#8e8e99] hover:text-white hover:bg-white/[0.04] transition-colors"
          title="Toggle Theme"
        >
          <Sun className="h-4.5 w-4.5" />
        </button>

        {/* Notification Bell */}
        <button
          className="p-2 rounded-xl text-[#8e8e99] hover:text-white hover:bg-white/[0.04] transition-colors relative"
          title="Notifications"
        >
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* ADMIN Capsule Badge */}
        <div className="px-3.5 py-1.5 rounded-full bg-white text-[#0d0d10] text-[11px] font-bold tracking-wider uppercase shadow-sm">
          ADMIN
        </div>
      </div>
    </header>
  );
};
