"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: { value: number; positive: boolean };
  loading?: boolean;
}

export function StatsCard({ icon: Icon, label, value, trend, loading }: StatsCardProps) {
  if (loading) {
    return (
      <div className="bg-white border border-border rounded-lg p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface animate-pulse" />
          <div className="flex-1">
            <div className="h-3 w-20 bg-surface rounded animate-pulse mb-2" />
            <div className="h-6 w-16 bg-surface rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-lg p-5 hover:shadow-card transition-shadow">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-accent-light flex items-center justify-center">
          <Icon size={20} className="text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted font-medium uppercase tracking-wider">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-xl font-bold text-foreground">{value}</p>
            {trend && (
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.positive ? "text-success" : "text-sale"
                )}
              >
                {trend.positive ? "+" : ""}{trend.value}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
