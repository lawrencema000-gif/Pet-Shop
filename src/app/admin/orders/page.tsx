"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
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

  const columns: Column<OrderRow>[] = [
    {
      key: "id",
      label: "Order",
      render: (row) => (
        <Link href={`/admin/orders/${row.id}`} className="text-sm font-mono text-accent hover:underline">
          #{row.id.slice(0, 8)}
        </Link>
      ),
    },
    { key: "email", label: "Customer", sortable: true, render: (row) => <span className="text-sm">{row.email}</span> },
    { key: "status", label: "Status", render: (row) => <StatusBadge status={row.status} /> },
    { key: "item_count", label: "Items", render: (row) => <span className="text-sm">{row.item_count}</span> },
    { key: "total", label: "Total", sortable: true, render: (row) => <span className="text-sm font-medium">{formatPrice(row.total)}</span> },
    {
      key: "created_at",
      label: "Date",
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
          <h1 className="text-2xl font-display font-bold text-foreground">Orders</h1>
          <p className="text-sm text-muted mt-1">{total} total orders</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        searchable
        searchPlaceholder="Search by email..."
        onSearch={(q) => { setSearch(q); setPage(1); }}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        onPageChange={setPage}
        emptyTitle="No orders found"
      />
    </div>
  );
}
