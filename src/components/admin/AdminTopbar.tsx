"use client";

import { useState, useEffect } from "react";
import { Menu, Search, Bell } from "lucide-react";
import { useAuth } from "@/lib/supabase/auth-provider";
import { useStaffPermissions } from "@/hooks/useStaffPermissions";

interface AdminTopbarProps {
  onMenuClick: () => void;
  onSearchClick: () => void;
}

export function AdminTopbar({ onMenuClick, onSearchClick }: AdminTopbarProps) {
  const { profile } = useAuth();
  const { roleName } = useStaffPermissions();
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    setIsMac(navigator.platform.includes("Mac"));
  }, []);

  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 lg:px-8">
      {/* Left: mobile menu + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-surface rounded-md transition-colors"
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        <div className="hidden lg:block">
          <h2 className="text-sm font-semibold text-foreground">Admin Panel</h2>
        </div>
      </div>

      {/* Right: search + user */}
      <div className="flex items-center gap-2">
        <button
          onClick={onSearchClick}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted hover:text-foreground border border-border rounded-md hover:bg-surface transition-colors"
        >
          <Search size={16} />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="hidden sm:inline text-[10px] font-mono bg-surface px-1.5 py-0.5 rounded text-muted">
            {isMac ? "⌘K" : "Ctrl+K"}
          </kbd>
        </button>

        <button className="p-2 hover:bg-surface rounded-md transition-colors relative" aria-label="Notifications" title="Notifications coming soon">
          <Bell size={18} className="text-muted" />
        </button>

        <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold ml-1" title={`${profile?.full_name} (${roleName})`}>
          {profile?.full_name?.[0]?.toUpperCase() ?? "A"}
        </div>
      </div>
    </header>
  );
}
