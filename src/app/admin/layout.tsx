"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { AdminBreadcrumb } from "@/components/admin/AdminBreadcrumb";
import { CommandPalette } from "@/components/admin/CommandPalette";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Cmd+K / Ctrl+K shortcut
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setSearchOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <AdminGuard>
      <div className="min-h-screen flex bg-surface/50">
        {/* Desktop sidebar */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <AdminSidebar />
        </div>

        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
            <div className="relative w-64 h-full animate-slide-in-right">
              <AdminSidebar onClose={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          <AdminTopbar
            onMenuClick={() => setMobileOpen(true)}
            onSearchClick={() => setSearchOpen(true)}
          />
          <main className="flex-1 p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <AdminBreadcrumb />
              {children}
            </div>
          </main>
        </div>

        {/* Command palette */}
        <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      </div>
    </AdminGuard>
  );
}
