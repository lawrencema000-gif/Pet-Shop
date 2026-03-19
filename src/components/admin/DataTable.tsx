"use client";

import { useState, useMemo, type ReactNode } from "react";
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  className?: string;
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  bulkActions?: { label: string; onClick: (ids: string[]) => void; variant?: "danger" | "default" }[];
  emptyTitle?: string;
  emptyDescription?: string;
  headerActions?: ReactNode;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  loading,
  searchable,
  searchPlaceholder = "Search...",
  onSearch,
  page = 1,
  pageSize = 20,
  total = 0,
  onPageChange,
  selectable,
  selectedIds = [],
  onSelectionChange,
  bulkActions,
  emptyTitle = "No data found",
  emptyDescription,
  headerActions,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");

  const totalPages = Math.ceil(total / pageSize);
  const allSelected = data.length > 0 && selectedIds.length === data.length;

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function toggleAll() {
    if (allSelected) {
      onSelectionChange?.([]);
    } else {
      onSelectionChange?.(data.map((r) => r.id));
    }
  }

  function toggleRow(id: string) {
    if (selectedIds.includes(id)) {
      onSelectionChange?.(selectedIds.filter((i) => i !== id));
    } else {
      onSelectionChange?.([...selectedIds, id]);
    }
  }

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  return (
    <div className="bg-white border border-border rounded-lg overflow-hidden">
      {/* Header: search + actions */}
      {(searchable || headerActions || (bulkActions && selectedIds.length > 0)) && (
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border">
          {searchable && (
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  onSearch?.(e.target.value);
                }}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          )}
          {bulkActions && selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">{selectedIds.length} selected</span>
              {bulkActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => action.onClick(selectedIds)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                    action.variant === "danger"
                      ? "bg-sale/10 text-sale hover:bg-sale/20"
                      : "bg-accent-light text-accent hover:bg-accent-light/80"
                  )}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
          {headerActions && <div className="ml-auto">{headerActions}</div>}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/50">
              {selectable && (
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="rounded border-border"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider",
                    col.sortable && "cursor-pointer select-none hover:text-foreground",
                    col.className
                  )}
                  onClick={() => col.sortable && toggleSort(col.key)}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      sortDir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border/50">
                  {selectable && <td className="px-4 py-3"><div className="w-4 h-4 bg-surface rounded animate-pulse" /></td>}
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      <div className="h-4 bg-surface rounded animate-pulse w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-12 text-center">
                  <p className="text-sm font-medium text-foreground">{emptyTitle}</p>
                  {emptyDescription && <p className="text-xs text-muted mt-1">{emptyDescription}</p>}
                </td>
              </tr>
            ) : (
              sortedData.map((row) => (
                <tr key={row.id} className="border-b border-border/50 hover:bg-surface/30 transition-colors">
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(row.id)}
                        onChange={() => toggleRow(row.id)}
                        className="rounded border-border"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-4 py-3", col.className)}>
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <span className="text-xs text-muted">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => onPageChange?.(p)}
                  className={cn(
                    "w-8 h-8 text-xs font-medium rounded transition-colors",
                    p === page ? "bg-accent text-white" : "hover:bg-surface text-muted"
                  )}
                >
                  {p}
                </button>
              );
            })}
            {totalPages > 5 && <span className="text-muted text-xs px-1">...</span>}
            <button
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
