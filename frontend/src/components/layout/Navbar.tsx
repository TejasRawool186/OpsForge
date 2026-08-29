"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { NotificationsDropdown } from "./NotificationsDropdown";

interface NavbarProps {
  onOpenCommandPalette: () => void;
  onOpenCreateIncident: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCommandPalette,
  onOpenCreateIncident,
}) => {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; full_name?: string; role: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("opsforge_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("opsforge_token");
    localStorage.removeItem("opsforge_user");
    document.cookie = "opsforge_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setUser(null);
    router.push("/login");
  };

  return (
    <header className="h-16 bg-[#0d0d10] px-8 flex items-center justify-between sticky top-0 z-30 ml-64 border-b border-[#1c1c24]">
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

      {/* Right: Actions, Notifications & User Info */}
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

        {/* Interactive Notifications Dropdown */}
        <NotificationsDropdown />

        {/* User Capsule Badge & Logout */}
        {user ? (
          <div className="flex items-center gap-2 bg-[#141417] border border-[#23232a] rounded-full pl-3 pr-1.5 py-1">
            <span className="text-xs font-medium text-white max-w-[120px] truncate">
              {user.full_name || user.email.split("@")[0]}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold uppercase">
              {user.role}
            </span>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1 rounded-full text-[#8e8e99] hover:text-red-400 hover:bg-red-500/10 transition-colors ml-1"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={() => router.push("/login")}
            className="rounded-full bg-indigo-600 hover:bg-indigo-500 text-xs font-medium px-4 py-1.5"
          >
            <UserIcon className="h-3.5 w-3.5 mr-1.5" />
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
};
