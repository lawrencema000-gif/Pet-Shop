"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Eye, Ban, CheckCircle, Download, Crown, Repeat, UserPlus, User } from "lucide-react";
import { useTranslation } from "react-i18next";
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

function getSegment(orderCount: number) {
  if (orderCount === 0) return { labelKey: "admin.customers.segmentNew", color: "bg-blue-50 text-blue-600", icon: UserPlus };
  if (orderCount < 5) return { labelKey: "admin.customers.segmentActive", color: "bg-success/10 text-success", icon: User };
  if (orderCount < 10) return { labelKey: "admin.customers.segmentRepeat", color: "bg-amber-50 text-amber-600", icon: Repeat };
  return { labelKey: "admin.customers.segmentVip", color: "bg-purple-50 text-purple-600", icon: Crown };
}

const PAGE_SIZE = 20;

export default function AdminCustomersPage() {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState("all");

  const SEGMENT_FILTERS = [
    { key: "all", label: t("admin.customers.segmentAll") },
    { key: "new", label: t("admin.customers.segmentNew"), min: 0, max: 0 },
    { key: "active", label: t("admin.customers.segmentActive"), min: 1, max: 4 },
    { key: "repeat", label: t("admin.customers.segmentRepeat"), min: 5, max: 9 },
    { key: "vip", label: t("admin.customers.segmentVip"), min: 10, max: Infinity },
  ] as const;

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

    let items = (data ?? []).map((d) => ({
      ...d,
      order_count: orderCounts[d.id] ?? 0,
    }));

    // Client-side segment filter
    const segFilter = SEGMENT_FILTERS.find((f) => f.key === segment);
    if (segFilter && segFilter.key !== "all" && "min" in segFilter) {
      items = items.filter((c) => c.order_count >= segFilter.min && c.order_count <= segFilter.max);
    }

    setCustomers(items);
    setTotal(segFilter && segFilter.key !== "all" ? items.length : (count ?? 0));
    setLoading(false);
  }, [page, search, segment]);

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
        c.is_banned ? t("admin.customers.statusBanned") : t("admin.customers.statusActive"),
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
      label: t("admin.customers.columnName"),
      sortable: true,
      render: (row) => (
        <Link href={`/admin/customers/${row.id}`} className="text-sm font-medium text-foreground hover:text-accent">
          {row.full_name ?? "—"}
        </Link>
      ),
    },
    { key: "phone", label: t("admin.customers.columnPhone"), render: (row) => <span className="text-sm text-muted">{row.phone ?? "—"}</span> },
    { key: "order_count", label: t("admin.customers.columnOrders"), render: (row) => <span className="text-sm">{row.order_count}</span> },
    {
      key: "segment" as keyof CustomerRow,
      label: t("admin.customers.columnSegment"),
      render: (row) => {
        const seg = getSegment(row.order_count);
        const Icon = seg.icon;
        return (
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${seg.color}`}>
            <Icon size={10} /> {t(seg.labelKey)}
          </span>
        );
      },
    },
    {
      key: "is_banned",
      label: t("admin.customers.columnStatus"),
      render: (row) => (
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${row.is_banned ? "bg-sale/10 text-sale" : "bg-success/10 text-success"}`}>
          {row.is_banned ? t("admin.customers.statusBanned") : t("admin.customers.statusActive")}
        </span>
      ),
    },
    {
      key: "created_at",
      label: t("admin.customers.columnJoined"),
      render: (row) => <span className="text-xs text-muted">{new Date(row.created_at).toLocaleDateString()}</span>,
    },
    {
      key: "actions",
      label: "",
      className: "w-20",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Link href={`/admin/customers/${row.id}`} className="p-1.5 hover:bg-surface rounded" title={t("admin.customers.view")}>
            <Eye size={14} className="text-muted" />
          </Link>
          <button
            onClick={() => toggleBan(row.id, !row.is_banned)}
            className="p-1.5 hover:bg-surface rounded"
            title={row.is_banned ? t("admin.customers.unban") : t("admin.customers.ban")}
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
          <h1 className="text-2xl font-display font-bold text-foreground">{t("admin.customers.title")}</h1>
          <p className="text-sm text-muted mt-1">{t("admin.customers.totalCustomers", { count: total })}</p>
        </div>
        <button onClick={handleExport} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-border rounded-md hover:bg-surface transition-colors">
          <Download size={14} /> {t("admin.customers.exportCsv")}
        </button>
      </div>

      {/* Segment Filter */}
      <div className="flex gap-1 border-b border-border mb-6">
        {SEGMENT_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => { setSegment(f.key); setPage(1); }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              segment === f.key
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        searchable
        searchPlaceholder={t("admin.customers.searchByName")}
        onSearch={(q) => { setSearch(q); setPage(1); }}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        onPageChange={setPage}
        emptyTitle={t("admin.customers.noCustomersFound")}
      />
    </div>
  );
}
