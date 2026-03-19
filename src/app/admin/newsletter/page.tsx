"use client";

import { useState, useEffect } from "react";
import { Download, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { logAdminAction } from "@/lib/audit-log";

interface Subscriber {
  id: string;
  email: string;
  source: string | null;
  subscribed_at: string;
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function load() {
    const { data, count } = await supabase
      .from("newsletter_subscribers")
      .select("*", { count: "exact" })
      .order("subscribed_at", { ascending: false });
    setSubscribers((data ?? []) as Subscriber[]);
    setTotal(count ?? 0);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

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
    await supabase.from("newsletter_subscribers").delete().eq("id", deleteId);
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
      <ConfirmDialog isOpen={!!deleteId} title="Remove Subscriber" message="This will remove this email from the subscriber list." confirmLabel="Remove" variant="danger" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
