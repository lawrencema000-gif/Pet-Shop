"use client";

import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-success/10 text-success",
  draft: "bg-warning/10 text-warning",
  archived: "bg-muted/10 text-muted",
  pending: "bg-warning/10 text-warning",
  confirmed: "bg-accent-light text-accent",
  shipped: "bg-blue-50 text-blue-600",
  delivered: "bg-success/10 text-success",
  cancelled: "bg-sale/10 text-sale",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full capitalize",
        STATUS_STYLES[status] ?? "bg-surface text-muted"
      )}
    >
      {status}
    </span>
  );
}
