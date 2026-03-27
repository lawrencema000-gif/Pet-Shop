"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Eye, Ban, CheckCircle, Download } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { exportCsv } from "@/lib/csv-export";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { logAdminAction } from "@/lib/audit-log";

interface CustomerRow {
  id: string;
  full_name: string | null;
  phone: string | null;
  is_banned: boolean;
  created_at: string;
  order_count: number;
}

const PAGE_SIZE = 20;

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("profiles")
      .select("id, full_name, phone, is_banned, created_at", { count: "exact" })
      .eq("role", "customer");

    if (search) {
      query = query.ilike("full_name", `%${search}%`);
    }

    const from = (page - 1) * PAGE_SIZE;
    const { data, count } = await query
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    // Get order counts
    const ids = (data ?? []).map((d) => d.id);
    const orderCounts: Record<string, number> = {};
    if (ids.length > 0) {
      const { data: orders } = await supabase.from("orders").select("user_id").in("user_id", ids);
      orders?.forEach((o) => {
        orderCounts[o.user_id] = (orderCounts[o.user_id] ?? 0) + 1;
      });
    }

    setCustomers(
      (data ?? []).map((d) => ({
        ...d,
        order_count: orderCounts[d.id] ?? 0,
      }))
    );
    setTotal(count ?? 0);
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  async function handleExport() {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone, is_banned, created_at")
      .eq("role", "customer")
      .order("created_at", { ascending: false })
      .limit(5000);

    if (!data || data.length === 0) return;

    exportCsv(
      "customers",
      ["Name", "Email", "Phone", "Status", "Joined"],
      data.map((c) => [
        c.full_name,
        c.email,
        c.phone,
        c.is_banned ? "Banned" : "Active",
        new Date(c.created_at).toLocaleDateString(),
      ])
    );
  }

  async function toggleBan(id: string, ban: boolean) {
    const { error } = await supabase.from("profiles").update({ is_banned: ban }).eq("id", id);
    if (error) { console.error("Toggle ban failed:", error.message); return; }
    await logAdminAction(ban ? "ban_customer" : "unban_customer", "profile", id);
    fetchCustomers();
  }

  const columns: Column<CustomerRow>[] = [
    {
      key: "full_name",
      label: "Name",
      sortable: true,
      render: (row) => (
        <Link href={`/admin/customers/${row.id}`} className="text-sm font-medium text-foreground hover:text-accent">
          {row.full_name ?? "—"}
        </Link>
      ),
    },
    { key: "phone", label: "Phone", render: (row) => <span className="text-sm text-muted">{row.phone ?? "—"}</span> },
    { key: "order_count", label: "Orders", render: (row) => <span className="text-sm">{row.order_count}</span> },
    {
      key: "is_banned",
      label: "Status",
      render: (row) => (
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${row.is_banned ? "bg-sale/10 text-sale" : "bg-success/10 text-success"}`}>
          {row.is_banned ? "Banned" : "Active"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Joined",
      render: (row) => <span className="text-xs text-muted">{new Date(row.created_at).toLocaleDateString()}</span>,
    },
    {
      key: "actions",
      label: "",
      className: "w-20",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Link href={`/admin/customers/${row.id}`} className="p-1.5 hover:bg-surface rounded" title="View">
            <Eye size={14} className="text-muted" />
          </Link>
          <button
            onClick={() => toggleBan(row.id, !row.is_banned)}
            className="p-1.5 hover:bg-surface rounded"
            title={row.is_banned ? "Unban" : "Ban"}
          >
            {row.is_banned ? <CheckCircle size={14} className="text-success" /> : <Ban size={14} className="text-muted hover:text-sale" />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Customers</h1>
          <p className="text-sm text-muted mt-1">{total} total customers</p>
        </div>
        <button onClick={handleExport} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-border rounded-md hover:bg-surface transition-colors">
          <Download size={14} /> Export CSV
        </button>
      </div>
      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        searchable
        searchPlaceholder="Search by name..."
        onSearch={(q) => { setSearch(q); setPage(1); }}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        onPageChange={setPage}
        emptyTitle="No customers found"
      />
    </div>
  );
}
