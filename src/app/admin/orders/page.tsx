"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Eye, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase/client";
import { exportCsv } from "@/lib/csv-export";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatPrice } from "@/lib/utils";

interface OrderRow {
  id: string;
  email: string;
  status: string;
  total: number;
  item_count: number;
  created_at: string;
}

const PAGE_SIZE = 20;

export default function AdminOrdersPage() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("orders")
      .select("id, email, status, total, created_at, order_items(quantity)", { count: "exact" });

    if (search) {
      query = query.ilike("email", `%${search}%`);
    }
    if (statusFilter) {
      query = query.eq("status", statusFilter);
    }

    const from = (page - 1) * PAGE_SIZE;
    const { data, count } = await query
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    const rows: OrderRow[] = (data ?? []).map((o: Record<string, unknown>) => {
      const items = o.order_items as { quantity: number }[] | null;
      return {
        id: o.id as string,
        email: o.email as string,
        status: o.status as string,
        total: Number(o.total),
        item_count: items?.reduce((s, i) => s + i.quantity, 0) ?? 0,
        created_at: o.created_at as string,
      };
    });

    setOrders(rows);
    setTotal(count ?? 0);
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  async function handleExport() {
    const { data } = await supabase
      .from("orders")
      .select("id, email, status, total, subtotal, discount_amount, shipping_amount, tax_amount, coupon_code, tracking_number, carrier, payment_status, created_at")
      .order("created_at", { ascending: false })
      .limit(5000);

    if (!data || data.length === 0) return;

    exportCsv(
      "orders",
      ["Order ID", "Email", "Status", "Payment", "Total", "Subtotal", "Discount", "Shipping", "Tax", "Coupon", "Carrier", "Tracking", "Date"],
      data.map((o) => [
        o.id.slice(0, 8),
        o.email,
        o.status,
        o.payment_status ?? "unpaid",
        o.total,
        o.subtotal,
        o.discount_amount,
        o.shipping_amount,
        o.tax_amount,
        o.coupon_code,
        o.carrier,
        o.tracking_number,
        new Date(o.created_at).toLocaleDateString(),
      ])
    );
  }

  const columns: Column<OrderRow>[] = [
    {
      key: "id",
      label: t("admin.orders.columnOrder"),
      render: (row) => (
        <Link href={`/admin/orders/${row.id}`} className="text-sm font-mono text-accent hover:underline">
          #{row.id.slice(0, 8)}
        </Link>
      ),
    },
    { key: "email", label: t("admin.orders.columnCustomer"), sortable: true, render: (row) => <span className="text-sm">{row.email}</span> },
    { key: "status", label: t("admin.orders.columnStatus"), render: (row) => <StatusBadge status={row.status} /> },
    { key: "item_count", label: t("admin.orders.columnItems"), render: (row) => <span className="text-sm">{row.item_count}</span> },
    { key: "total", label: t("admin.orders.columnTotal"), sortable: true, render: (row) => <span className="text-sm font-medium">{formatPrice(row.total)}</span> },
    {
      key: "created_at",
      label: t("admin.orders.columnDate"),
      sortable: true,
      render: (row) => <span className="text-xs text-muted">{new Date(row.created_at).toLocaleDateString()}</span>,
    },
    {
      key: "actions",
      label: "",
      className: "w-10",
      render: (row) => (
        <Link href={`/admin/orders/${row.id}`} className="p-1.5 hover:bg-surface rounded transition-colors inline-flex">
          <Eye size={14} className="text-muted" />
        </Link>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{t("admin.orders.title")}</h1>
          <p className="text-sm text-muted mt-1">{t("admin.orders.totalOrders", { count: total })}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-border rounded-md hover:bg-surface transition-colors">
            <Download size={14} /> {t("admin.orders.exportCsv")}
          </button>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
        >
          <option value="">{t("admin.orders.allStatuses")}</option>
          <option value="pending">{t("admin.orders.pending")}</option>
          <option value="confirmed">{t("admin.orders.confirmed")}</option>
          <option value="shipped">{t("admin.orders.shipped")}</option>
          <option value="delivered">{t("admin.orders.delivered")}</option>
            <option value="cancelled">{t("admin.orders.cancelled")}</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        searchable
        searchPlaceholder={t("admin.orders.searchByEmail")}
        onSearch={(q) => { setSearch(q); setPage(1); }}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        onPageChange={setPage}
        emptyTitle={t("admin.orders.noOrdersFound")}
      />
    </div>
  );
}
