"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  AlertCircle, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp,
  FileText, Save,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase/client";
import { logAdminAction } from "@/lib/audit-log";
import { formatPrice } from "@/lib/utils";

interface Chargeback {
  id: string;
  order_id: string;
  stripe_dispute_id: string | null;
  stripe_charge_id: string | null;
  amount: number;
  currency: string;
  reason: string;
  status: "needs_response" | "under_review" | "won" | "lost";
  evidence_due_by: string | null;
  admin_notes: string | null;
  evidence_submitted: boolean;
  created_at: string;
  updated_at: string;
}

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "needs_response", label: "Needs Response" },
  { key: "under_review", label: "Under Review" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" },
] as const;

const STATUS_COLOR: Record<string, string> = {
  needs_response: "bg-sale/10 text-sale",
  under_review: "bg-amber-50 text-amber-600",
  won: "bg-success/10 text-success",
  lost: "bg-surface text-muted",
};

const STATUS_ICON: Record<string, typeof Clock> = {
  needs_response: AlertCircle,
  under_review: Clock,
  won: CheckCircle,
  lost: XCircle,
};

function deadlineUrgency(dueBy: string | null): string {
  if (!dueBy) return "text-muted";
  const diff = new Date(dueBy).getTime() - Date.now();
  const days = diff / (1000 * 60 * 60 * 24);
  if (days < 0) return "text-muted line-through";
  if (days <= 2) return "text-sale font-bold";
  if (days <= 7) return "text-amber-600 font-medium";
  return "text-foreground";
}

function deadlineLabel(dueBy: string | null): string {
  if (!dueBy) return "No deadline";
  const diff = new Date(dueBy).getTime() - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return "Expired";
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `${days} days left`;
}

export default function AdminChargebacksPage() {
  const { t } = useTranslation();
  const [chargebacks, setChargebacks] = useState<Chargeback[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

  const loadChargebacks = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("chargebacks")
      .select("*")
      .order("created_at", { ascending: false });

    if (tab !== "all") {
      query = query.eq("status", tab);
    }

    const { data } = await query.limit(200);
    setChargebacks((data ?? []) as Chargeback[]);
    setLoading(false);
  }, [tab]);

  const loadCounts = useCallback(async () => {
    const { data } = await supabase.from("chargebacks").select("status");
    const c: Record<string, number> = { all: 0, needs_response: 0, under_review: 0, won: 0, lost: 0 };
    data?.forEach((r) => {
      c[r.status] = (c[r.status] ?? 0) + 1;
      c.all++;
    });
    setCounts(c);
  }, []);

  useEffect(() => { loadChargebacks(); }, [loadChargebacks]);
  useEffect(() => { loadCounts(); }, [loadCounts]);

  async function saveNotes(cb: Chargeback) {
    setSaving(cb.id);
    const { error } = await supabase
      .from("chargebacks")
      .update({
        admin_notes: editNotes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cb.id);

    if (error) {
      console.error("Save notes failed:", error.message);
      setSaving(null);
      return;
    }

    await logAdminAction("update_chargeback_notes", "chargeback", cb.id, { notes: editNotes });
    setSaving(null);
    loadChargebacks();
  }

  async function toggleEvidenceSubmitted(cb: Chargeback) {
    setSaving(cb.id);
    const newVal = !cb.evidence_submitted;
    const { error } = await supabase
      .from("chargebacks")
      .update({
        evidence_submitted: newVal,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cb.id);

    if (error) {
      console.error("Toggle evidence failed:", error.message);
      setSaving(null);
      return;
    }

    await logAdminAction(
      newVal ? "mark_evidence_submitted" : "unmark_evidence_submitted",
      "chargeback",
      cb.id,
      { stripe_dispute_id: cb.stripe_dispute_id }
    );
    setSaving(null);
    loadChargebacks();
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {t("admin.chargebacks.title", "Chargebacks")}
          </h1>
          <p className="text-sm text-muted mt-1">
            {t("admin.chargebacks.subtitle", "Manage disputes and submit evidence")}
          </p>
        </div>
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
            {t(`admin.chargebacks.tab_${st.key}`, st.label)}
            {counts[st.key] ? (
              <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                st.key === "needs_response" ? "bg-sale/10 text-sale" : "bg-surface text-muted"
              }`}>
                {counts[st.key]}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Chargebacks List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white border border-border rounded-lg p-5">
              <div className="h-4 w-48 bg-surface rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : chargebacks.length === 0 ? (
        <div className="bg-white border border-border rounded-lg p-12 text-center">
          <CheckCircle size={32} className="mx-auto text-muted mb-3" />
          <p className="text-sm text-muted">
            {t("admin.chargebacks.noChargebacks", "No chargebacks found")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {chargebacks.map((cb) => {
            const Icon = STATUS_ICON[cb.status] ?? Clock;
            const expanded = expandedId === cb.id;

            return (
              <div key={cb.id} className="bg-white border border-border rounded-lg overflow-hidden">
                {/* Header row */}
                <button
                  onClick={() => {
                    setExpandedId(expanded ? null : cb.id);
                    setEditNotes(cb.admin_notes ?? "");
                  }}
                  className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-surface/30 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${STATUS_COLOR[cb.status]}`}>
                    <Icon size={14} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {formatPrice(cb.amount, cb.currency)}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${STATUS_COLOR[cb.status]}`}>
                        {cb.status.replace("_", " ")}
                      </span>
                      {cb.evidence_submitted && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-accent/10 text-accent">
                          {t("admin.chargebacks.evidenceSent", "Evidence Sent")}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted mt-0.5">
                      {t("admin.chargebacks.order", "Order")}{" "}
                      <Link
                        href={`/admin/orders/${cb.order_id}`}
                        className="text-accent hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        #{cb.order_id.slice(0, 8)}
                      </Link>
                      {" "}&middot; {cb.reason}
                      {cb.stripe_dispute_id && (
                        <> &middot; {cb.stripe_dispute_id}</>
                      )}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    {cb.evidence_due_by && (
                      <p className={`text-xs ${deadlineUrgency(cb.evidence_due_by)}`}>
                        {deadlineLabel(cb.evidence_due_by)}
                      </p>
                    )}
                    <p className="text-xs text-muted">
                      {new Date(cb.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  {expanded ? <ChevronUp size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
                </button>

                {/* Expanded content */}
                {expanded && (
                  <div className="px-5 pb-5 border-t border-border/50 pt-4 space-y-4">
                    {/* Stripe IDs */}
                    <div className="grid grid-cols-2 gap-4">
                      {cb.stripe_dispute_id && (
                        <div>
                          <p className="text-xs font-semibold text-muted uppercase mb-1">
                            {t("admin.chargebacks.disputeId", "Dispute ID")}
                          </p>
                          <p className="text-sm text-foreground font-mono bg-surface/50 rounded-md px-3 py-2">
                            {cb.stripe_dispute_id}
                          </p>
                        </div>
                      )}
                      {cb.stripe_charge_id && (
                        <div>
                          <p className="text-xs font-semibold text-muted uppercase mb-1">
                            {t("admin.chargebacks.chargeId", "Charge ID")}
                          </p>
                          <p className="text-sm text-foreground font-mono bg-surface/50 rounded-md px-3 py-2">
                            {cb.stripe_charge_id}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Deadline */}
                    {cb.evidence_due_by && (
                      <div className={`border rounded-md p-3 ${
                        deadlineUrgency(cb.evidence_due_by).includes("sale")
                          ? "bg-sale/5 border-sale/20"
                          : deadlineUrgency(cb.evidence_due_by).includes("amber")
                          ? "bg-amber-50 border-amber-200"
                          : "bg-surface/50 border-border"
                      }`}>
                        <p className={`text-sm font-medium ${deadlineUrgency(cb.evidence_due_by)}`}>
                          {t("admin.chargebacks.evidenceDue", "Evidence due by")}{" "}
                          {new Date(cb.evidence_due_by).toLocaleDateString(undefined, {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                          {" "}&middot; {deadlineLabel(cb.evidence_due_by)}
                        </p>
                      </div>
                    )}

                    {/* Admin Notes */}
                    <div>
                      <p className="text-xs font-semibold text-muted uppercase mb-1">
                        {t("admin.chargebacks.adminNotes", "Admin Notes")}
                      </p>
                      <textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder={t("admin.chargebacks.notesPlaceholder", "Add notes about this dispute...")}
                        rows={3}
                        className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent resize-none"
                      />
                      <button
                        onClick={() => saveNotes(cb)}
                        disabled={saving === cb.id}
                        className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent-dark disabled:opacity-60"
                      >
                        <Save size={14} /> {t("admin.chargebacks.saveNotes", "Save Notes")}
                      </button>
                    </div>

                    {/* Evidence toggle */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => toggleEvidenceSubmitted(cb)}
                        disabled={saving === cb.id}
                        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md disabled:opacity-60 ${
                          cb.evidence_submitted
                            ? "text-amber-600 border border-amber-300 hover:bg-amber-50"
                            : "bg-success text-white hover:bg-success/90"
                        }`}
                      >
                        <FileText size={14} />
                        {cb.evidence_submitted
                          ? t("admin.chargebacks.unmarkEvidence", "Unmark Evidence Submitted")
                          : t("admin.chargebacks.markEvidence", "Mark Evidence Submitted")}
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
