"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  AlertTriangle, ShieldCheck, ShieldX, ChevronDown, ChevronUp, Filter,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase/client";
import { logAdminAction } from "@/lib/audit-log";

interface FraudFlag {
  id: string;
  order_id: string;
  user_id: string | null;
  rule_name: string;
  severity: "low" | "medium" | "high" | "critical";
  details: Record<string, unknown>;
  resolved: boolean;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

const SEVERITY_COLOR: Record<string, string> = {
  low: "bg-blue-50 text-blue-600",
  medium: "bg-amber-50 text-amber-600",
  high: "bg-orange-50 text-orange-600",
  critical: "bg-sale/10 text-sale",
};

const SEVERITY_OPTIONS = ["all", "low", "medium", "high", "critical"] as const;
const RESOLVED_OPTIONS = ["all", "unresolved", "resolved"] as const;

export default function AdminFraudPage() {
  const { t } = useTranslation();
  const [flags, setFlags] = useState<FraudFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [resolvedFilter, setResolvedFilter] = useState<string>("all");
  const [processing, setProcessing] = useState<string | null>(null);

  const loadFlags = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("fraud_flags")
      .select("*")
      .order("created_at", { ascending: false });

    if (severityFilter !== "all") {
      query = query.eq("severity", severityFilter);
    }
    if (resolvedFilter === "resolved") {
      query = query.eq("resolved", true);
    } else if (resolvedFilter === "unresolved") {
      query = query.eq("resolved", false);
    }

    const { data } = await query.limit(200);
    setFlags((data ?? []) as FraudFlag[]);
    setLoading(false);
  }, [severityFilter, resolvedFilter]);

  useEffect(() => { loadFlags(); }, [loadFlags]);

  async function toggleResolved(flag: FraudFlag) {
    setProcessing(flag.id);
    const newResolved = !flag.resolved;
    const updates: Record<string, unknown> = {
      resolved: newResolved,
      resolved_at: newResolved ? new Date().toISOString() : null,
      resolved_by: newResolved ? "admin" : null,
    };

    const { error } = await supabase
      .from("fraud_flags")
      .update(updates)
      .eq("id", flag.id);

    if (error) {
      console.error("Toggle fraud flag failed:", error.message);
      setProcessing(null);
      return;
    }

    await logAdminAction(
      newResolved ? "resolve_fraud_flag" : "unresolve_fraud_flag",
      "fraud_flag",
      flag.id,
      { rule_name: flag.rule_name, severity: flag.severity }
    );
    setProcessing(null);
    loadFlags();
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {t("admin.fraud.title", "Fraud Flags")}
          </h1>
          <p className="text-sm text-muted mt-1">
            {t("admin.fraud.subtitle", "Review flagged orders and resolve fraud alerts")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-muted" />
          <span className="text-xs text-muted font-medium">{flags.length} flags</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
        >
          {SEVERITY_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === "all"
                ? t("admin.fraud.allSeverities", "All Severities")
                : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={resolvedFilter}
          onChange={(e) => setResolvedFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
        >
          {RESOLVED_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r === "all"
                ? t("admin.fraud.allStatus", "All Status")
                : r === "resolved"
                ? t("admin.fraud.resolved", "Resolved")
                : t("admin.fraud.unresolved", "Unresolved")}
            </option>
          ))}
        </select>
      </div>

      {/* Flags List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white border border-border rounded-lg p-5">
              <div className="h-4 w-48 bg-surface rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : flags.length === 0 ? (
        <div className="bg-white border border-border rounded-lg p-12 text-center">
          <ShieldCheck size={32} className="mx-auto text-muted mb-3" />
          <p className="text-sm text-muted">
            {t("admin.fraud.noFlags", "No fraud flags found")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {flags.map((flag) => {
            const expanded = expandedId === flag.id;

            return (
              <div key={flag.id} className="bg-white border border-border rounded-lg overflow-hidden">
                {/* Header row */}
                <button
                  onClick={() => setExpandedId(expanded ? null : flag.id)}
                  className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-surface/30 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    flag.resolved ? "bg-success/10 text-success" : SEVERITY_COLOR[flag.severity]
                  }`}>
                    {flag.resolved ? <ShieldCheck size={14} /> : <AlertTriangle size={14} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {flag.rule_name}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${SEVERITY_COLOR[flag.severity]}`}>
                        {flag.severity}
                      </span>
                      {flag.resolved && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-success/10 text-success">
                          {t("admin.fraud.resolvedBadge", "Resolved")}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted mt-0.5">
                      {t("admin.fraud.order", "Order")}{" "}
                      <Link
                        href={`/admin/orders/${flag.order_id}`}
                        className="text-accent hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        #{flag.order_id.slice(0, 8)}
                      </Link>
                      {flag.user_id && (
                        <>
                          {" "}&middot;{" "}
                          <Link
                            href={`/admin/customers/${flag.user_id}`}
                            className="text-accent hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {t("admin.fraud.user", "User")} #{flag.user_id.slice(0, 8)}
                          </Link>
                        </>
                      )}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted">
                      {new Date(flag.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {expanded ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
                </button>

                {/* Expanded content */}
                {expanded && (
                  <div className="px-5 pb-5 border-t border-border/50 pt-4 space-y-4">
                    {/* Details JSON */}
                    <div>
                      <p className="text-xs font-semibold text-muted uppercase mb-1">
                        {t("admin.fraud.details", "Details")}
                      </p>
                      <pre className="text-xs text-foreground bg-surface/50 rounded-md p-3 overflow-auto max-h-60">
                        {JSON.stringify(flag.details, null, 2)}
                      </pre>
                    </div>

                    {/* Resolved info */}
                    {flag.resolved && flag.resolved_at && (
                      <div className="bg-success/5 border border-success/20 rounded-md p-3">
                        <p className="text-sm text-success font-medium">
                          {t("admin.fraud.resolvedAt", "Resolved at")}{" "}
                          {new Date(flag.resolved_at).toLocaleString()}
                          {flag.resolved_by && <> &middot; {t("admin.fraud.by", "by")} {flag.resolved_by}</>}
                        </p>
                      </div>
                    )}

                    {/* Toggle button */}
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => toggleResolved(flag)}
                        disabled={processing === flag.id}
                        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md disabled:opacity-60 ${
                          flag.resolved
                            ? "text-amber-600 border border-amber-300 hover:bg-amber-50"
                            : "bg-success text-white hover:bg-success/90"
                        }`}
                      >
                        {flag.resolved ? (
                          <><ShieldX size={14} /> {t("admin.fraud.unresolve", "Mark Unresolved")}</>
                        ) : (
                          <><ShieldCheck size={14} /> {t("admin.fraud.resolve", "Mark Resolved")}</>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
