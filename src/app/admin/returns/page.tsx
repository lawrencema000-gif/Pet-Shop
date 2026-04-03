"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Clock, CheckCircle, XCircle, Package,
  ChevronDown, ChevronUp, Download,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase/client";
import { logAdminAction } from "@/lib/audit-log";
import { formatPrice } from "@/lib/utils";
import { exportCsv } from "@/lib/csv-export";

interface ReturnRequest {
  id: string;
  order_id: string;
  email: string;
  reason: string;
  description: string | null;
  status: string;
  admin_notes: string | null;
  refund_amount: number | null;
  created_at: string;
  updated_at: string;
  order_total?: number;
}

const STATUS_TABS = [
  { key: "all", labelKey: "admin.returns.tabAll" },
  { key: "pending", labelKey: "admin.returns.tabPending" },
  { key: "approved", labelKey: "admin.returns.tabApproved" },
  { key: "rejected", labelKey: "admin.returns.tabRejected" },
  { key: "completed", labelKey: "admin.returns.tabCompleted" },
] as const;

const statusIcon: Record<string, typeof Clock> = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
  completed: Package,
};

const statusColor: Record<string, string> = {
  pending: "bg-amber-50 text-amber-600",
  approved: "bg-success/10 text-success",
  rejected: "bg-sale/10 text-sale",
  completed: "bg-accent/10 text-accent",
};

export default function AdminReturnsPage() {
  const { t } = useTranslation();
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});

  const REASONS: Record<string, string> = {
    defective: t("admin.returns.reasons.defective"),
    wrong_item: t("admin.returns.reasons.wrong_item"),
    not_as_described: t("admin.returns.reasons.not_as_described"),
    changed_mind: t("admin.returns.reasons.changed_mind"),
    too_late: t("admin.returns.reasons.too_late"),
    other: t("admin.returns.reasons.other"),
  };

  const loadReturns = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("return_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (tab !== "all") {
      query = query.eq("status", tab);
    }

    const { data } = await query.limit(200);
    const items = (data ?? []) as ReturnRequest[];

    // Fetch order totals
    if (items.length > 0) {
      const orderIds = Array.from(new Set(items.map((r) => r.order_id)));
      const { data: orders } = await supabase
        .from("orders")
        .select("id, total")
        .in("id", orderIds);
      const totalMap = new Map(orders?.map((o) => [o.id, Number(o.total)]) ?? []);
      items.forEach((r) => { r.order_total = totalMap.get(r.order_id); });
    }

    setReturns(items);
    setLoading(false);
  }, [tab]);

  // Load counts for badges
  const loadCounts = useCallback(async () => {
    const { data } = await supabase
      .from("return_requests")
      .select("status");
    const c: Record<string, number> = { all: 0, pending: 0, approved: 0, rejected: 0, completed: 0 };
    data?.forEach((r) => {
      c[r.status] = (c[r.status] ?? 0) + 1;
      c.all++;
    });
    setCounts(c);
  }, []);

  useEffect(() => { loadReturns(); }, [loadReturns]);
  useEffect(() => { loadCounts(); }, [loadCounts]);

  async function updateReturn(id: string, status: string) {
    setProcessing(true);
    const updates: Record<string, unknown> = {
      status,
      admin_notes: adminNotes || null,
      updated_at: new Date().toISOString(),
    };

    if (status === "approved" && refundAmount) {
      updates.refund_amount = parseFloat(refundAmount);
    }

    const { error } = await supabase
      .from("return_requests")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("Update return failed:", error.message);
      setProcessing(false);
      return;
    }

    // Log refund if approved with amount
    if (status === "approved" && refundAmount) {
      const ret = returns.find((r) => r.id === id);
      await supabase.from("refund_log").insert({
        order_id: ret?.order_id,
        return_request_id: id,
        amount: parseFloat(refundAmount),
        reason: adminNotes || "Return approved",
      });

      // Update order payment status
      if (ret) {
        await supabase.from("orders").update({
          payment_status: "partially_refunded",
        }).eq("id", ret.order_id);

        // Restore inventory for returned items
        const { data: orderItems } = await supabase
          .from("order_items")
          .select("variant_id, quantity")
          .eq("order_id", ret.order_id);

        if (orderItems) {
          for (const item of orderItems) {
            if (item.variant_id) {
              const { data: v } = await supabase
                .from("product_variants")
                .select("stock_quantity")
                .eq("id", item.variant_id)
                .single();
              if (v) {
                await supabase
                  .from("product_variants")
                  .update({ stock_quantity: v.stock_quantity + item.quantity })
                  .eq("id", item.variant_id);
              }
            }
          }
        }
      }
    }

    await logAdminAction(`return_${status}`, "return_request", id, { notes: adminNotes });
    setExpandedId(null);
    setAdminNotes("");
    setRefundAmount("");
    setProcessing(false);
    loadReturns();
    loadCounts();
  }

  function handleExport() {
    exportCsv(
      "returns",
      ["ID", "Order", "Email", "Reason", "Description", "Status", "Refund Amount", "Admin Notes", "Date"],
      returns.map((r) => [
        r.id.slice(0, 8),
        r.order_id.slice(0, 8),
        r.email,
        REASONS[r.reason] ?? r.reason,
        r.description,
        r.status,
        r.refund_amount,
        r.admin_notes,
        new Date(r.created_at).toLocaleDateString(),
      ])
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{t("admin.returns.title")}</h1>
          <p className="text-sm text-muted mt-1">{t("admin.returns.subtitle")}</p>
        </div>
        <button onClick={handleExport} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-border rounded-md hover:bg-surface transition-colors">
          <Download size={14} /> {t("admin.returns.exportCsv")}
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 border-b border-border mb-6">
        {STATUS_TABS.map((st) => (
          <button
            key={st.key}
            onClick={() => setTab(st.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === st.key
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {t(st.labelKey)}
            {counts[st.key] ? (
              <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                st.key === "pending" ? "bg-amber-100 text-amber-700" : "bg-surface text-muted"
              }`}>
                {counts[st.key]}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Returns List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white border border-border rounded-lg p-5">
              <div className="h-4 w-48 bg-surface rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : returns.length === 0 ? (
        <div className="bg-white border border-border rounded-lg p-12 text-center">
          <Package size={32} className="mx-auto text-muted mb-3" />
          <p className="text-sm text-muted">
            {t("admin.returns.noReturns", {
              context: tab !== "all" ? t("admin.returns.noReturnsWithStatus", { status: tab }) : t("admin.returns.noReturnsYet"),
            })}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {returns.map((ret) => {
            const Icon = statusIcon[ret.status] ?? Clock;
            const expanded = expandedId === ret.id;

            return (
              <div key={ret.id} className="bg-white border border-border rounded-lg overflow-hidden">
                {/* Header row */}
                <button
                  onClick={() => {
                    setExpandedId(expanded ? null : ret.id);
                    setAdminNotes(ret.admin_notes ?? "");
                    setRefundAmount(ret.refund_amount?.toString() ?? "");
                  }}
                  className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-surface/30 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusColor[ret.status]}`}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {t("admin.returns.returnTitle", { id: ret.id.slice(0, 8) })}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${statusColor[ret.status]}`}>
                        {ret.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted mt-0.5">
                      {t("admin.returns.order")}{" "}
                      <Link href={`/admin/orders/${ret.order_id}`} className="text-accent hover:underline" onClick={(e) => e.stopPropagation()}>
                        #{ret.order_id.slice(0, 8)}
                      </Link>
                      {" "}&middot; {ret.email} &middot; {REASONS[ret.reason] ?? ret.reason}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted">{new Date(ret.created_at).toLocaleDateString()}</p>
                    {ret.order_total && <p className="text-sm font-medium text-foreground">{formatPrice(ret.order_total)}</p>}
                  </div>
                  {expanded ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
                </button>

                {/* Expanded content */}
                {expanded && (
                  <div className="px-5 pb-5 border-t border-border/50 pt-4 space-y-4">
                    {/* Description */}
                    {ret.description && (
                      <div>
                        <p className="text-xs font-semibold text-muted uppercase mb-1">{t("admin.returns.customerDescription")}</p>
                        <p className="text-sm text-foreground bg-surface/50 rounded-md p-3">{ret.description}</p>
                      </div>
                    )}

                    {/* Admin Notes */}
                    <div>
                      <p className="text-xs font-semibold text-muted uppercase mb-1">{t("admin.returns.adminNotes")}</p>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder={t("admin.returns.adminNotesPlaceholder")}
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent resize-none"
                        disabled={ret.status === "completed" || ret.status === "rejected"}
                      />
                    </div>

                    {/* Refund Amount (for pending/approved) */}
                    {(ret.status === "pending" || ret.status === "approved") && (
                      <div>
                        <p className="text-xs font-semibold text-muted uppercase mb-1">{t("admin.returns.refundAmount")}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted">$</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max={ret.order_total ?? undefined}
                            value={refundAmount}
                            onChange={(e) => setRefundAmount(e.target.value)}
                            placeholder={ret.order_total ? `Max ${formatPrice(ret.order_total)}` : "0.00"}
                            className="w-40 px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
                          />
                          {ret.order_total && (
                            <button
                              onClick={() => setRefundAmount(ret.order_total!.toString())}
                              className="text-xs text-accent hover:underline"
                            >
                              {t("admin.returns.fullRefund")}
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Existing refund info */}
                    {ret.refund_amount && ret.status !== "pending" && (
                      <div className="bg-success/5 border border-success/20 rounded-md p-3">
                        <p className="text-sm text-success font-medium">{t("admin.returns.refundLabel", { amount: formatPrice(ret.refund_amount) })}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {ret.status === "pending" && (
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => updateReturn(ret.id, "approved")}
                          disabled={processing}
                          className="inline-flex items-center gap-2 bg-success text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-success/90 disabled:opacity-60"
                        >
                          <CheckCircle size={14} /> {refundAmount ? t("admin.returns.approveAndRefund", { amount: formatPrice(parseFloat(refundAmount)) }) : t("admin.returns.approve")}
                        </button>
                        <button
                          onClick={() => updateReturn(ret.id, "rejected")}
                          disabled={processing}
                          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-sale border border-sale/30 rounded-md hover:bg-sale/5 disabled:opacity-60"
                        >
                          <XCircle size={14} /> {t("admin.returns.reject")}
                        </button>
                      </div>
                    )}

                    {ret.status === "approved" && (
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => updateReturn(ret.id, "completed")}
                          disabled={processing}
                          className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-accent-dark disabled:opacity-60"
                        >
                          <Package size={14} /> {t("admin.returns.markCompleted")}
                        </button>
                      </div>
                    )}

                    {(ret.status === "rejected" || ret.status === "completed") && ret.admin_notes && (
                      <div className="bg-surface/50 rounded-md p-3">
                        <p className="text-xs font-semibold text-muted mb-1">{t("admin.returns.resolutionNotes")}</p>
                        <p className="text-sm text-foreground">{ret.admin_notes}</p>
                      </div>
                    )}
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
