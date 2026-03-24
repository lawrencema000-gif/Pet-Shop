"use client";

import { useState, useEffect } from "react";
import { Download, Trash2, Shield } from "lucide-react";
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

export default function AdminNewsletterPage() {
  const { hasPermission, isSuperAdmin, loaded } = useStaffPermissions();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;

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
        <button onClick={exportCSV} disabled={subscribers.length === 0} className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2.5 text-sm font-medium rounded-md hover:bg-accent-dark disabled:opacity-60">
          <Download size={16} /> Export CSV
        </button>
      </div>
      <DataTable columns={columns} data={subscribers} loading={loading} emptyTitle="No subscribers yet" />

      {/* Pagination */}
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

      <ConfirmDialog isOpen={!!deleteId} title="Remove Subscriber" message="This will remove this email from the subscriber list." confirmLabel="Remove" variant="danger" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
