"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Trash2, Shield, Send, Mail, Eye, EyeOff, CheckCircle, Clock, XCircle,
  BarChart3, Users, MousePointer,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { logAdminAction } from "@/lib/audit-log";
import { useStaffPermissions } from "@/hooks/useStaffPermissions";
import { useTranslation } from "react-i18next";

interface CampaignRow {
  id: string;
  name: string;
  subject: string;
  body_html: string | null;
  body_text: string | null;
  segment: string | null;
  status: "draft" | "scheduled" | "sending" | "sent" | "cancelled";
  scheduled_at: string | null;
  sent_at: string | null;
  total_recipients: number;
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  created_at: string;
}

type Tab = "campaigns" | "create";

const PAGE_SIZE = 20;
const SEGMENTS = ["all", "new_customers", "repeat_customers", "vip", "inactive"];

export default function AdminEmailCampaignsPage() {
  const { t } = useTranslation();
  const { hasPermission, isSuperAdmin, loaded } = useStaffPermissions();

  const [tab, setTab] = useState<Tab>("campaigns");
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Send state
  const [sendId, setSendId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Create form state
  const [formName, setFormName] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formBodyHtml, setFormBodyHtml] = useState("");
  const [formSegment, setFormSegment] = useState("all");
  const [creating, setCreating] = useState(false);

  // Preview
  const [previewId, setPreviewId] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    const from = (page - 1) * PAGE_SIZE;
    const { data, count } = await supabase
      .from("email_campaigns")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    setCampaigns((data ?? []) as CampaignRow[]);
    setTotal(count ?? 0);
    setLoading(false);
  }, [page]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  async function handleDelete() {
    if (!deleteId) return;
    const { error } = await supabase
      .from("email_campaigns")
      .delete()
      .eq("id", deleteId);
    if (error) {
      console.error("Delete campaign failed:", error.message);
      return;
    }
    await logAdminAction("delete_email_campaign", "email_campaign", deleteId);
    setDeleteId(null);
    fetchCampaigns();
  }

  async function handleSend() {
    if (!sendId) return;
    setSending(true);

    const campaign = campaigns.find((c) => c.id === sendId);
    if (!campaign) {
      setSending(false);
      setSendId(null);
      return;
    }

    // Update status to sending
    await supabase
      .from("email_campaigns")
      .update({ status: "sending" })
      .eq("id", sendId);

    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token;

    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: "email_campaign",
          campaign_id: sendId,
          subject: campaign.subject,
          body_html: campaign.body_html,
          body_text: campaign.body_text,
          segment: campaign.segment,
        }),
      });
      const result = await res.json();

      // Update campaign with results
      await supabase
        .from("email_campaigns")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          total_sent: result.sent ?? 0,
          total_recipients: result.total ?? 0,
        })
        .eq("id", sendId);

      await logAdminAction("send_email_campaign", "email_campaign", sendId, {
        subject: campaign.subject,
        sent: result.sent,
      });
    } catch {
      // Revert status on failure
      await supabase
        .from("email_campaigns")
        .update({ status: "draft" })
        .eq("id", sendId);
    }

    setSending(false);
    setSendId(null);
    fetchCampaigns();
  }

  async function handleCreate() {
    if (!formName.trim() || !formSubject.trim()) return;
    setCreating(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { error } = await supabase.from("email_campaigns").insert({
      name: formName.trim(),
      subject: formSubject.trim(),
      body_html: formBodyHtml.trim() || null,
      body_text: null,
      segment: formSegment,
      status: "draft",
      total_recipients: 0,
      total_sent: 0,
      total_opened: 0,
      total_clicked: 0,
      created_by: session?.user?.id,
    });

    if (error) {
      console.error("Create campaign failed:", error.message);
      setCreating(false);
      return;
    }

    await logAdminAction("create_email_campaign", "email_campaign", "new");
    setFormName("");
    setFormSubject("");
    setFormBodyHtml("");
    setFormSegment("all");
    setCreating(false);
    setTab("campaigns");
    fetchCampaigns();
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">
            <CheckCircle size={10} /> Sent
          </span>
        );
      case "sending":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full">
            <Send size={10} /> Sending
          </span>
        );
      case "scheduled":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-warning bg-warning/10 px-2 py-0.5 rounded-full">
            <Clock size={10} /> Scheduled
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-sale bg-sale/10 px-2 py-0.5 rounded-full">
            <XCircle size={10} /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted bg-surface px-2 py-0.5 rounded-full">
            <Clock size={10} /> Draft
          </span>
        );
    }
  };

  const statCell = (icon: React.ReactNode, value: number, label: string) => (
    <div className="flex items-center gap-1.5 text-xs text-muted" title={label}>
      {icon}
      <span>{value}</span>
    </div>
  );

  const columns: Column<CampaignRow>[] = [
    {
      key: "name",
      label: t("admin.emailCampaigns.nameLabel", "Campaign"),
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-foreground">{row.name}</p>
          <p className="text-xs text-muted truncate max-w-[250px]">
            {row.subject}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      label: t("admin.emailCampaigns.statusLabel", "Status"),
      render: (row) => statusBadge(row.status),
    },
    {
      key: "total_sent",
      label: t("admin.emailCampaigns.statsLabel", "Stats"),
      render: (row) => (
        <div className="flex items-center gap-4">
          {statCell(<Users size={12} />, row.total_sent, "Sent")}
          {statCell(<Eye size={12} />, row.total_opened, "Opened")}
          {statCell(<MousePointer size={12} />, row.total_clicked, "Clicked")}
        </div>
      ),
    },
    {
      key: "created_at",
      label: t("admin.emailCampaigns.dateLabel", "Created"),
      render: (row) => (
        <div>
          <span className="text-xs text-muted">
            {new Date(row.created_at).toLocaleDateString()}
          </span>
          {row.sent_at && (
            <p className="text-[10px] text-muted">
              Sent {new Date(row.sent_at).toLocaleDateString()}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "",
      className: "w-32",
      render: (row) => (
        <div className="flex items-center gap-1">
          {/* Preview HTML */}
          {row.body_html && (
            <button
              onClick={() =>
                setPreviewId(previewId === row.id ? null : row.id)
              }
              className="p-1.5 hover:bg-surface rounded text-muted"
              title="Preview"
            >
              {previewId === row.id ? (
                <EyeOff size={14} />
              ) : (
                <Eye size={14} />
              )}
            </button>
          )}
          {/* Send */}
          {row.status === "draft" && (
            <button
              onClick={() => setSendId(row.id)}
              className="p-1.5 hover:bg-accent/10 rounded text-accent"
              title="Send campaign"
            >
              <Send size={14} />
            </button>
          )}
          {/* Delete (only drafts) */}
          {row.status === "draft" && (
            <button
              onClick={() => setDeleteId(row.id)}
              className="p-1.5 hover:bg-sale/10 rounded"
              title="Delete"
            >
              <Trash2 size={14} className="text-muted hover:text-sale" />
            </button>
          )}
        </div>
      ),
    },
  ];

  if (loaded && !isSuperAdmin && !hasPermission("email_campaigns:write")) {
    return (
      <div className="text-center py-20">
        <Shield size={40} className="text-muted mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-foreground">
          {t("admin.emailCampaigns.accessRestricted", "Access Restricted")}
        </h2>
        <p className="text-sm text-muted mt-1">
          {t(
            "admin.emailCampaigns.noPermission",
            "You don't have permission to manage email campaigns."
          )}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {t("admin.emailCampaigns.title", "Email Campaigns")}
          </h1>
          <p className="text-sm text-muted mt-1">
            {t("admin.emailCampaigns.totalCampaigns", {
              count: total,
              defaultValue: `${total} campaigns`,
            })}
          </p>
        </div>
        {tab === "campaigns" && (
          <button
            onClick={() => setTab("create")}
            className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2.5 text-sm font-medium rounded-md hover:bg-accent-dark"
          >
            <Plus size={16} />{" "}
            {t("admin.emailCampaigns.newCampaign", "New Campaign")}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-6">
        <button
          onClick={() => setTab("campaigns")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            tab === "campaigns"
              ? "border-accent text-accent"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          <BarChart3 size={14} />{" "}
          {t("admin.emailCampaigns.campaignsTab", "Campaigns")}
        </button>
        <button
          onClick={() => setTab("create")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            tab === "create"
              ? "border-accent text-accent"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          <Mail size={14} />{" "}
          {t("admin.emailCampaigns.createTab", "Create Campaign")}
        </button>
      </div>

      {/* Campaigns Tab */}
      {tab === "campaigns" && (
        <>
          <DataTable
            columns={columns}
            data={campaigns}
            loading={loading}
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
            onPageChange={setPage}
            emptyTitle={t(
              "admin.emailCampaigns.noCampaignsFound",
              "No campaigns yet"
            )}
          />
        </>
      )}

      {/* Create Campaign Tab */}
      {tab === "create" && (
        <div className="max-w-3xl">
          <div className="bg-white border border-border rounded-lg p-6 space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t("admin.emailCampaigns.campaignName", "Campaign Name")}
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
                placeholder={t(
                  "admin.emailCampaigns.namePlaceholder",
                  "e.g. Spring Sale 2026"
                )}
              />
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t("admin.emailCampaigns.subjectLine", "Subject Line")}
              </label>
              <input
                type="text"
                value={formSubject}
                onChange={(e) => setFormSubject(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
                placeholder={t(
                  "admin.emailCampaigns.subjectPlaceholder",
                  "Email subject line"
                )}
              />
            </div>

            {/* Segment */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t("admin.emailCampaigns.segment", "Audience Segment")}
              </label>
              <select
                value={formSegment}
                onChange={(e) => setFormSegment(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
              >
                {SEGMENTS.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            {/* Body HTML */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t("admin.emailCampaigns.bodyHtml", "Email Body (HTML)")}
              </label>
              <textarea
                value={formBodyHtml}
                onChange={(e) => setFormBodyHtml(e.target.value)}
                rows={14}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent resize-y font-mono"
                placeholder={t(
                  "admin.emailCampaigns.bodyPlaceholder",
                  "<h1>Hello!</h1>\n<p>Your email content here...</p>"
                )}
              />
              <p className="text-xs text-muted mt-1">
                {t(
                  "admin.emailCampaigns.bodyHelpText",
                  "Write raw HTML for the email body. Use inline styles for compatibility."
                )}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-5">
            <button
              onClick={() => setTab("campaigns")}
              className="px-4 py-2.5 text-sm font-medium border border-border rounded-md hover:bg-surface transition-colors"
            >
              {t("common.cancel", "Cancel")}
            </button>
            <button
              onClick={handleCreate}
              disabled={!formName.trim() || !formSubject.trim() || creating}
              className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2.5 text-sm font-medium rounded-md hover:bg-accent-dark transition-colors disabled:opacity-60"
            >
              <Plus size={14} />
              {creating
                ? t("admin.emailCampaigns.creating", "Creating...")
                : t("admin.emailCampaigns.createDraft", "Create Draft")}
            </button>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteId}
        title={t("admin.emailCampaigns.deleteCampaign", "Delete Campaign")}
        message={t(
          "admin.emailCampaigns.deleteMessage",
          "Are you sure you want to delete this draft campaign? This cannot be undone."
        )}
        confirmLabel={t("common.delete", "Delete")}
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      {/* Send confirm */}
      <ConfirmDialog
        isOpen={!!sendId}
        title={t("admin.emailCampaigns.sendCampaign", "Send Campaign")}
        message={t(
          "admin.emailCampaigns.sendMessage",
          "This will send the campaign to the selected audience segment. Continue?"
        )}
        confirmLabel={
          sending
            ? t("admin.emailCampaigns.sending", "Sending...")
            : t("admin.emailCampaigns.sendNow", "Send Now")
        }
        variant="danger"
        onConfirm={handleSend}
        onCancel={() => setSendId(null)}
      />
    </div>
  );
}
