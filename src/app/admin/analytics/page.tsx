"use client";

import { useState, useEffect, useMemo } from "react";
import { DollarSign, ShoppingBag, TrendingUp, Package, Shield } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { StatsCard } from "@/components/admin/StatsCard";
import { formatPrice } from "@/lib/utils";
import { useStaffPermissions } from "@/hooks/useStaffPermissions";

type Period = "7d" | "30d" | "90d" | "all";

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
}

interface OrderItem {
  product_name: string;
  quantity: number;
  total_price: number;
}

export default function AdminAnalyticsPage() {
  const { hasPermission, isSuperAdmin, loaded } = useStaffPermissions();
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("30d");

  useEffect(() => {
    async function load() {
      setLoading(true);
      let query = supabase.from("orders").select("id, total, status, created_at");

      if (period !== "all") {
        const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
        const since = new Date();
        since.setDate(since.getDate() - days);
        query = query.gte("created_at", since.toISOString());
      }

      const { data: ords } = await query.order("created_at", { ascending: false });
      setOrders(ords ?? []);

      // Get order items for top products
      const orderIds = (ords ?? []).map((o) => o.id);
      if (orderIds.length > 0) {
        const { data: itms } = await supabase
          .from("order_items")
          .select("product_name, quantity, total_price")
          .in("order_id", orderIds.slice(0, 100));
        setItems(itms ?? []);
      } else {
        setItems([]);
      }
      setLoading(false);
    }
    load();
  }, [period]);

  const stats = useMemo(() => {
    const completed = orders.filter((o) => o.status !== "cancelled");
    const revenue = completed.reduce((s, o) => s + Number(o.total), 0);
    const avgOrder = completed.length > 0 ? revenue / completed.length : 0;
    const cancelled = orders.filter((o) => o.status === "cancelled").length;
    return {
      totalOrders: orders.length,
      revenue,
      avgOrder,
      cancelRate: orders.length > 0 ? ((cancelled / orders.length) * 100).toFixed(1) : "0",
    };
  }, [orders]);

  const topProducts = useMemo(() => {
    const map = new Map<string, { qty: number; revenue: number }>();
    items.forEach((item) => {
      const prev = map.get(item.product_name) ?? { qty: 0, revenue: 0 };
      map.set(item.product_name, {
        qty: prev.qty + item.quantity,
        revenue: prev.revenue + Number(item.total_price),
      });
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 10);
  }, [items]);

  // Daily revenue for chart
  const dailyRevenue = useMemo(() => {
    const map = new Map<string, number>();
    orders
      .filter((o) => o.status !== "cancelled")
      .forEach((o) => {
        const day = new Date(o.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        map.set(day, (map.get(day) ?? 0) + Number(o.total));
      });
    const entries = Array.from(map.entries()).reverse().slice(-14);
    const max = Math.max(...entries.map(([, v]) => v), 1);
    return { entries, max };
  }, [orders]);

  if (loaded && !isSuperAdmin && !hasPermission("analytics:read")) {
    return (
      <div className="text-center py-20">
        <Shield size={40} className="text-muted mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-foreground">Access Restricted</h2>
        <p className="text-sm text-muted mt-1">You don&apos;t have permission to view analytics.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted mt-1">Store performance overview</p>
        </div>
        <div className="flex gap-1 bg-surface rounded-md p-0.5">
          {(["7d", "30d", "90d", "all"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                period === p ? "bg-white text-foreground shadow-sm" : "text-muted hover:text-foreground"
              }`}
            >
              {p === "all" ? "All" : p}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard icon={DollarSign} label="Revenue" value={formatPrice(stats.revenue)} loading={loading} />
        <StatsCard icon={ShoppingBag} label="Orders" value={stats.totalOrders} loading={loading} />
        <StatsCard icon={TrendingUp} label="Avg Order" value={formatPrice(stats.avgOrder)} loading={loading} />
        <StatsCard icon={Package} label="Cancel Rate" value={`${stats.cancelRate}%`} loading={loading} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart (CSS bars) */}
        <div className="bg-white border border-border rounded-lg p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Daily Revenue</h2>
          {dailyRevenue.entries.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted">No revenue data for this period</div>
          ) : (
            <div className="flex items-end gap-1 h-48">
              {dailyRevenue.entries.map(([day, val]) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col justify-end h-40">
                    <div
                      className="w-full bg-accent/80 rounded-t-sm transition-all hover:bg-accent"
                      style={{ height: `${(val / dailyRevenue.max) * 100}%`, minHeight: val > 0 ? "4px" : "0" }}
                      title={`${day}: ${formatPrice(val)}`}
                    />
                  </div>
                  <span className="text-[9px] text-muted whitespace-nowrap transform -rotate-45 origin-top-left w-0">{day}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white border border-border rounded-lg">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Top Products by Revenue</h2>
          </div>
          <div className="divide-y divide-border/50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-5 py-3"><div className="h-4 bg-surface rounded animate-pulse w-3/4" /></div>
              ))
            ) : topProducts.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted">No product data</div>
            ) : (
              topProducts.map(([name, data], i) => (
                <div key={name} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted w-5">{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{name}</p>
                      <p className="text-xs text-muted">{data.qty} sold</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{formatPrice(data.revenue)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
