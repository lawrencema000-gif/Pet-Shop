"use client";

import { useState, useEffect } from "react";
import {
  Download, Trash2, Shield, Send, Eye, Mail, Users, CheckCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { logAdminAction } from "@/lib/audit-log";
import { useStaffPermissions } from "@/hooks/useStaffPermissions";

interface Subscriber {
  id: string;
  email: string;
  source: string | null;
  subscribed_at: string;
}

type Tab = "subscribers" | "compose";

export default function AdminNewsletterPage() {
  const { hasPermission, isSuperAdmin, loaded } = useStaffPermissions();
  const [tab, setTab] = useState<Tab>("subscribers");

  // Subscribers state
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

  // Campaign state
  const [subject, setSubject] = useState("");
  const [preheader, setPreheader] = useState("");
  const [body, setBody] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number } | null>(null);
  const [confirmSend, setConfirmSend] = useState(false);

  async function load(p = page) {
    setLoading(true);
    const from = p * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, count } = await supabase
      .from("newsletter_subscribers")
      .select("*", { count: "exact" })
      .order("subscribed_at", { ascending: false })
      .range(from, to);
    setSubscribers((data ?? []) as Subscriber[]);
    setTotal(count ?? 0);
    setLoading(false);
  }

  useEffect(() => { load(page); }, [page]);

  function exportCSV() {
    const csv = ["Email,Source,Date"]
      .concat(subscribers.map((s) => `${s.email},${s.source ?? ""},${new Date(s.subscribed_at).toISOString()}`))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newsletter_subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleDelete() {
    if (!deleteId) return;
    const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", deleteId);
    if (error) { console.error("Delete subscriber failed:", error.message); return; }
    await logAdminAction("delete_subscriber", "newsletter", deleteId);
    setDeleteId(null);
    load();
  }

  async function handleSendCampaign() {
    setConfirmSend(false);
    setSending(true);
    setSendResult(null);

    // Fetch all subscriber emails
    const { data: allSubs } = await supabase
      .from("newsletter_subscribers")
      .select("email")
      .limit(5000);

    const emails = allSubs?.map((s) => s.email) ?? [];
    if (emails.length === 0) {
      setSending(false);
      alert("No subscribers to send to.");
      return;
    }

    // Convert markdown-style body to simple HTML
    const htmlBody = body
      .split("\n\n")
      .map((p) => `<p style="margin:0 0 16px">${p.replace(/\n/g, "<br>")}</p>`)
      .join("");

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
          type: "newsletter_campaign",
          subject,
          body: htmlBody,
          preheader,
          emails,
        }),
      });
      const result = await res.json();
      setSendResult({ sent: result.sent ?? 0, failed: result.failed ?? 0 });
      await logAdminAction("send_newsletter", "newsletter", "campaign", {
        subject,
        recipients: emails.length,
        sent: result.sent,
        failed: result.failed,
      });
    } catch {
      setSendResult({ sent: 0, failed: emails.length });
    }
    setSending(false);
  }

  const columns: Column<Subscriber>[] = [
    { key: "email", label: "Email", sortable: true, render: (row) => <span className="text-sm font-medium">{row.email}</span> },
    { key: "source", label: "Source", render: (row) => <span className="text-xs text-muted capitalize">{row.source?.replace("_", " ") ?? "—"}</span> },
    {
      key: "subscribed_at",
      label: "Date",
      sortable: true,
      render: (row) => <span className="text-xs text-muted">{new Date(row.subscribed_at).toLocaleDateString()}</span>,
    },
    {
      key: "actions",
      label: "",
      className: "w-10",
      render: (row) => (
        <button onClick={() => setDeleteId(row.id)} className="p-1.5 hover:bg-sale/10 rounded">
          <Trash2 size={14} className="text-muted hover:text-sale" />
        </button>
      ),
    },
  ];

  if (loaded && !isSuperAdmin && !hasPermission("newsletter:read")) {
    return (
      <div className="text-center py-20">
        <Shield size={40} className="text-muted mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-foreground">Access Restricted</h2>
        <p className="text-sm text-muted mt-1">You don&apos;t have permission to view newsletter subscribers.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Newsletter</h1>
          <p className="text-sm text-muted mt-1">{total} subscribers</p>
        </div>
        {tab === "subscribers" && (
          <button onClick={exportCSV} disabled={subscribers.length === 0} className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2.5 text-sm font-medium rounded-md hover:bg-accent-dark disabled:opacity-60">
            <Download size={16} /> Export CSV
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-6">
        <button
          onClick={() => setTab("subscribers")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            tab === "subscribers" ? "border-accent text-accent" : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          <Users size={14} /> Subscribers
        </button>
        <button
          onClick={() => setTab("compose")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            tab === "compose" ? "border-accent text-accent" : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          <Mail size={14} /> Compose Campaign
        </button>
      </div>

      {/* Subscribers Tab */}
      {tab === "subscribers" && (
        <>
          <DataTable columns={columns} data={subscribers} loading={loading} emptyTitle="No subscribers yet" />
          {total > PAGE_SIZE && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-muted">
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-surface disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={(page + 1) * PAGE_SIZE >= total}
                  className="px-3 py-1.5 text-sm border border-border rounded-md hover:bg-surface disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Compose Campaign Tab */}
      {tab === "compose" && (
        <div className="max-w-3xl">
          {sendResult ? (
            <div className="bg-white border border-border rounded-lg p-8 text-center">
              <CheckCircle size={40} className="mx-auto text-success mb-3" />
              <h2 className="text-lg font-semibold text-foreground mb-2">Campaign Sent!</h2>
              <p className="text-sm text-muted">
                Successfully sent to <span className="font-semibold text-success">{sendResult.sent}</span> subscriber{sendResult.sent !== 1 ? "s" : ""}.
                {sendResult.failed > 0 && (
                  <> <span className="font-semibold text-sale">{sendResult.failed}</span> failed.</>
                )}
              </p>
              <button
                onClick={() => { setSendResult(null); setSubject(""); setBody(""); setPreheader(""); }}
                className="mt-4 inline-flex items-center gap-2 bg-accent text-white px-4 py-2.5 text-sm font-medium rounded-md hover:bg-accent-dark"
              >
                Compose Another
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="bg-white border border-border rounded-lg p-6 space-y-5">
                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Subject Line *</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
                    placeholder="e.g. New arrivals for your furry friend!"
                  />
                </div>

                {/* Preheader */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Preheader Text</label>
                  <input
                    type="text"
                    maxLength={120}
                    value={preheader}
                    onChange={(e) => setPreheader(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
                    placeholder="Preview text shown in inbox (optional)"
                  />
                  <p className="text-xs text-muted mt-1">{preheader.length}/120 characters</p>
                </div>

                {/* Body */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email Body *</label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={12}
                    className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent resize-y font-mono"
                    placeholder={"Write your email here...\n\nSeparate paragraphs with blank lines.\nLine breaks within a paragraph are preserved."}
                  />
                  <p className="text-xs text-muted mt-1">Plain text — paragraphs separated by blank lines. Will be wrapped in a branded PETLIBRO email template with a &quot;Shop Now&quot; button.</p>
                </div>
              </div>

              {/* Preview */}
              {previewing && body && (
                <div className="bg-white border border-border rounded-lg overflow-hidden">
                  <div className="px-5 py-3 border-b border-border bg-surface/50 flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted uppercase">Email Preview</p>
                    <button onClick={() => setPreviewing(false)} className="text-xs text-muted hover:text-foreground">Close</button>
                  </div>
                  <div className="p-6">
                    <div className="max-w-md mx-auto">
                      <div className="text-center mb-4">
                        <p className="text-lg font-display font-bold text-foreground">PETLIBRO</p>
                      </div>
                      <p className="text-xs text-muted mb-4">Subject: <span className="font-medium text-foreground">{subject || "(no subject)"}</span></p>
                      <div className="text-sm text-foreground leading-relaxed">
                        {body.split("\n\n").map((para, i) => (
                          <p key={i} className="mb-3">{para.split("\n").map((line, j) => (
                            <span key={j}>{line}{j < para.split("\n").length - 1 && <br />}</span>
                          ))}</p>
                        ))}
                      </div>
                      <div className="text-center mt-6">
                        <span className="inline-block bg-accent text-white px-6 py-2.5 rounded-lg text-sm font-semibold">Shop Now</span>
                      </div>
                      <p className="text-[10px] text-muted text-center mt-6">You&apos;re receiving this because you subscribed to the PETLIBRO newsletter.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Recipient info */}
              <div className="bg-surface/50 border border-border rounded-lg p-4 flex items-center gap-3">
                <Users size={16} className="text-muted shrink-0" />
                <p className="text-sm text-foreground">
                  This campaign will be sent to <span className="font-semibold">{total}</span> subscriber{total !== 1 ? "s" : ""}.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPreviewing(!previewing)}
                  disabled={!body}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border border-border rounded-md hover:bg-surface transition-colors disabled:opacity-40"
                >
                  <Eye size={14} /> {previewing ? "Hide Preview" : "Preview"}
                </button>
                <button
                  onClick={() => setConfirmSend(true)}
                  disabled={!subject || !body || sending || total === 0}
                  className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2.5 text-sm font-medium rounded-md hover:bg-accent-dark transition-colors disabled:opacity-60"
                >
                  <Send size={14} /> {sending ? "Sending..." : `Send to ${total} Subscriber${total !== 1 ? "s" : ""}`}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog isOpen={!!deleteId} title="Remove Subscriber" message="This will remove this email from the subscriber list." confirmLabel="Remove" variant="danger" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
      <ConfirmDialog
        isOpen={confirmSend}
        title="Send Campaign"
        message={`This will send "${subject}" to ${total} subscribers. This action cannot be undone.`}
        confirmLabel="Send Now"
        variant="danger"
        onConfirm={handleSendCampaign}
        onCancel={() => setConfirmSend(false)}
      />
    </div>
  );
}
