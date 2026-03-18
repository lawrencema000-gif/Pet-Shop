"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ProgressBarProps {
  current: number;
  target: number;
  label?: string;
  className?: string;
}

export function ProgressBar({ current, target, label, className }: ProgressBarProps) {
  const percentage = Math.min((current / target) * 100, 100);
  const reached = current >= target;

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted">{label}</span>
          {reached ? (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-success">
              <Check size={14} />
              Free shipping!
            </span>
          ) : (
            <span className="text-sm text-muted">
              ${(target - current).toFixed(2)} away
            </span>
          )}
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-surface overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            reached ? "bg-success" : "bg-accent"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
