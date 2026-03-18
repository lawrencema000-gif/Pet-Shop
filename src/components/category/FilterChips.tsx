"use client";

import { X } from "lucide-react";

interface FilterChipsProps {
  activeFilters: Record<string, string>;
  onRemove: (key: string) => void;
}

const FILTER_LABELS: Record<string, string> = {
  minPrice: "Min Price",
  maxPrice: "Max Price",
  sort: "Sort",
};

export default function FilterChips({
  activeFilters,
  onRemove,
}: FilterChipsProps) {
  const entries = Object.entries(activeFilters).filter(
    ([, value]) => value !== undefined && value !== ""
  );

  if (entries.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {entries.map(([key, value]) => (
        <button
          key={key}
          onClick={() => onRemove(key)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-full text-xs font-medium text-foreground hover:bg-surface/80 transition-colors"
        >
          <span className="text-muted">{FILTER_LABELS[key] || key}:</span>
          <span>{value}</span>
          <X className="w-3 h-3 text-muted" />
        </button>
      ))}
      {entries.length > 1 && (
        <button
          onClick={() => entries.forEach(([key]) => onRemove(key))}
          className="text-xs text-accent hover:text-accent/80 font-medium transition-colors"
        >
          Clear All
        </button>
      )}
    </div>
  );
}
