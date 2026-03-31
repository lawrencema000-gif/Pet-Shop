"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, Check } from "lucide-react";
import { useAuth } from "@/lib/supabase/auth-provider";
import { useNotifications } from "@/hooks/useNotifications";

export function NotificationBell() {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 hover:bg-surface-light transition-colors rounded"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-sale rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-background border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-accent hover:underline flex items-center gap-1"
              >
                <Check size={12} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted">
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-border last:border-b-0 hover:bg-surface-light transition-colors cursor-pointer ${
                    !n.is_read ? "bg-accent/5" : ""
                  }`}
                  onClick={() => {
                    if (!n.is_read) markAsRead(n.id);
                    if (n.link) {
                      setOpen(false);
                      window.location.href = n.link;
                    }
                  }}
                >
                  <div className="flex items-start gap-2">
                    {!n.is_read && (
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-accent shrink-0" />
                    )}
                    <div className={!n.is_read ? "" : "ml-4"}>
                      <p className="text-sm font-medium text-foreground line-clamp-1">
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="text-xs text-muted line-clamp-2 mt-0.5">
                          {n.body}
                        </p>
                      )}
                      <p className="text-[10px] text-muted mt-1">
                        {formatTimeAgo(n.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-border">
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="text-xs text-accent hover:underline"
              >
                View all
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
