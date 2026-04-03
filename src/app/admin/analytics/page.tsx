"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { DollarSign, ShoppingBag, TrendingUp, Package, Shield, Users, Repeat, UserPlus, Crown } from "lucide-react";
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
  product_id: string;
  product_name: string;
  quantity: number;
  total_price: number;
}

interface CustomerStat {
  total: number;
  newThisPeriod: number;
  returning: number;
  vip: number;
  avgLifetimeValue: number;
}

export default function AdminAnalyticsPage() {
  const { t } = useTranslation();
  const { hasPermission, isSuperAdmin, loaded } = useStaffPermissions();
  const [orders, setOrders] = useState<Order[]>([]);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("30d");
  const [customerStats, setCustomerStats] = useState<CustomerStat>({ total: 0, newThisPeriod: 0, returning: 0, vip: 0, avgLifetimeValue: 0 });

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
          .select("product_id, product_name, quantity, total_price")
          .in("order_id", orderIds.slice(0, 100));
        setItems(itms ?? []);
      } else {
        setItems([]);
      }

      // Customer stats
      const sinceDate = period !== "all" ? new Date() : null;
      if (sinceDate) {
        const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
        sinceDate.setDate(sinceDate.getDate() - days);
      }

      const { data: allProfiles, count: totalCustomers } = await supabase
        .from("profiles")
        .select("id", { count: "exact" })
        .eq("role", "customer");

      const { data: newProfiles } = sinceDate
        ? await supabase.from("profiles").select("id").eq("role", "customer").gte("created_at", sinceDate.toISOString())
        : { data: [] };

      // Count orders per user for returning/VIP
      const { data: userOrders } = await supabase.from("orders").select("user_id, total");
      const userMap = new Map<string, { count: number; total: number }>();
      userOrders?.forEach((o) => {
        if (!o.user_id) return;
        const prev = userMap.get(o.user_id) ?? { count: 0, total: 0 };
        userMap.set(o.user_id, { count: prev.count + 1, total: prev.total + Number(o.total) });
      });
      const returningCount = Array.from(userMap.values()).filter((u) => u.count >= 2).length;
      const vipCount = Array.from(userMap.values()).filter((u) => u.count >= 10).length;
      const totalLTV = Array.from(userMap.values()).reduce((s, u) => s + u.total, 0);

      setCustomerStats({
        total: totalCustomers ?? allProfiles?.length ?? 0,
        newThisPeriod: newProfiles?.length ?? 0,
        returning: returningCount,
        vip: vipCount,
        avgLifetimeValue: userMap.size > 0 ? Math.round((totalLTV / userMap.size) * 100) / 100 : 0,
      });

      setLoading(false);
    }
    load();
  }, [period]);

  const stats = useMemo(() => {
    const completed = orders.filter((o) => o.status !== "cancelled");
    const revenue = Math.round(completed.reduce((s, o) => s + Number(o.total), 0) * 100) / 100;
    const avgOrder = completed.length > 0 ? Math.round((revenue / completed.length) * 100) / 100 : 0;
    const cancelled = orders.filter((o) => o.status === "cancelled").length;
    return {
      totalOrders: orders.length,
      revenue,
      avgOrder,
      cancelRate: orders.length > 0 ? ((cancelled / orders.length) * 100).toFixed(1) : "0",
    };
  }, [orders]);

  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; qty: number; revenue: number }>();
    items.forEach((item) => {
      const key = item.product_id || item.product_name;
      const prev = map.get(key) ?? { name: item.product_name, qty: 0, revenue: 0 };
      map.set(key, {
        name: item.product_name,
        qty: prev.qty + item.quantity,
        revenue: Math.round((prev.revenue + Number(item.total_price)) * 100) / 100,
      });
    });
    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue)
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

  // Order status breakdown
  const statusBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((o) => { map[o.status] = (map[o.status] ?? 0) + 1; });
    const total = orders.length || 1;
    const colors: Record<string, string> = {
      pending: "bg-amber-400", processing: "bg-blue-400", shipped: "bg-accent",
      delivered: "bg-success", completed: "bg-emerald-500", cancelled: "bg-sale", refunded: "bg-purple-400",
    };
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .map(([status, count]) => ({
        status,
        count,
        pct: ((count / total) * 100).toFixed(1),
        color: colors[status] ?? "bg-gray-400",
      }));
  }, [orders]);

  // Hourly order distribution
  const hourlyDist = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
    orders.forEach((o) => {
      const h = new Date(o.created_at).getHours();
      hours[h].count++;
    });
    const max = Math.max(...hours.map((h) => h.count), 1);
    return { hours, max };
  }, [orders]);

  // Weekly distribution
  const weeklyDist = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts = Array(7).fill(0);
    orders.forEach((o) => {
      counts[new Date(o.created_at).getDay()]++;
    });
    const max = Math.max(...counts, 1);
    return days.map((d, i) => ({ day: d, count: counts[i], pct: (counts[i] / max) * 100 }));
  }, [orders]);

  if (loaded && !isSuperAdmin && !hasPermission("analytics:read")) {
    return (
      <div className="text-center py-20">
        <Shield size={40} className="text-muted mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-foreground">{t("admin.analytics.accessRestricted")}</h2>
        <p className="text-sm text-muted mt-1">{t("admin.analytics.noPermission")}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{t("admin.analytics.title")}</h1>
          <p className="text-sm text-muted mt-1">{t("admin.analytics.subtitle")}</p>
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
              {p === "all" ? t("admin.analytics.all") : p}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard icon={DollarSign} label={t("admin.analytics.revenue")} value={formatPrice(stats.revenue)} loading={loading} />
        <StatsCard icon={ShoppingBag} label={t("admin.analytics.orders")} value={stats.totalOrders} loading={loading} />
        <StatsCard icon={TrendingUp} label={t("admin.analytics.avgOrder")} value={formatPrice(stats.avgOrder)} loading={loading} />
        <StatsCard icon={Package} label={t("admin.analytics.cancelRate")} value={`${stats.cancelRate}%`} loading={loading} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart (CSS bars) */}
        <div className="bg-white border border-border rounded-lg p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">{t("admin.analytics.dailyRevenue")}</h2>
          {dailyRevenue.entries.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted">{t("admin.analytics.noRevenueData")}</div>
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
            <h2 className="text-sm font-semibold text-foreground">{t("admin.analytics.topProductsByRevenue")}</h2>
          </div>
          <div className="divide-y divide-border/50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-5 py-3"><div className="h-4 bg-surface rounded animate-pulse w-3/4" /></div>
              ))
            ) : topProducts.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted">{t("admin.analytics.noProductData")}</div>
            ) : (
              topProducts.map((product, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted w-5">{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{product.name}</p>
                      <p className="text-xs text-muted">{t("admin.analytics.sold", { qty: product.qty })}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{formatPrice(product.revenue)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-8 mb-8">
        <StatsCard icon={Users} label={t("admin.analytics.totalCustomers")} value={customerStats.total} loading={loading} />
        <StatsCard icon={UserPlus} label={t("admin.analytics.new", { period: period === "all" ? t("admin.analytics.all") : period })} value={customerStats.newThisPeriod} loading={loading} />
        <StatsCard icon={Repeat} label={t("admin.analytics.returning")} value={customerStats.returning} loading={loading} />
        <StatsCard icon={Crown} label={t("admin.analytics.vip")} value={customerStats.vip} loading={loading} />
        <StatsCard icon={DollarSign} label={t("admin.analytics.avgLtv")} value={formatPrice(customerStats.avgLifetimeValue)} loading={loading} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        {/* Order Status Breakdown */}
        <div className="bg-white border border-border rounded-lg p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">{t("admin.analytics.orderStatusBreakdown")}</h2>
          {statusBreakdown.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted">{t("admin.analytics.noOrders")}</div>
          ) : (
            <>
              {/* Stacked bar */}
              <div className="flex h-4 rounded-full overflow-hidden mb-4">
                {statusBreakdown.map((s) => (
                  <div
                    key={s.status}
                    className={`${s.color} transition-all`}
                    style={{ width: `${s.pct}%` }}
                    title={`${s.status}: ${s.count} (${s.pct}%)`}
                  />
                ))}
              </div>
              <div className="space-y-2">
                {statusBreakdown.map((s) => (
                  <div key={s.status} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${s.color}`} />
                      <span className="capitalize text-foreground">{s.status}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-muted">{s.count}</span>
                      <span className="text-xs text-muted w-12 text-right">{s.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Day of Week Distribution */}
        <div className="bg-white border border-border rounded-lg p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">{t("admin.analytics.ordersByDayOfWeek")}</h2>
          <div className="space-y-2">
            {weeklyDist.map((d) => (
              <div key={d.day} className="flex items-center gap-3">
                <span className="text-xs font-medium text-muted w-8">{d.day}</span>
                <div className="flex-1 bg-surface rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full bg-accent/70 rounded-full flex items-center pl-2 transition-all"
                    style={{ width: `${Math.max(d.pct, 2)}%` }}
                  >
                    {d.count > 0 && <span className="text-[10px] font-medium text-white">{d.count}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hourly Heatmap */}
      <div className="bg-white border border-border rounded-lg p-5 mt-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">{t("admin.analytics.ordersByHourOfDay")}</h2>
        <div className="flex items-end gap-0.5 h-32">
          {hourlyDist.hours.map((h) => (
            <div key={h.hour} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col justify-end h-24">
                <div
                  className="w-full rounded-t-sm transition-all"
                  style={{
                    height: `${(h.count / hourlyDist.max) * 100}%`,
                    minHeight: h.count > 0 ? "3px" : "0",
                    backgroundColor: h.count === 0 ? "transparent"
                      : h.count / hourlyDist.max > 0.7 ? "rgb(var(--accent))"
                      : h.count / hourlyDist.max > 0.3 ? "rgba(var(--accent), 0.6)"
                      : "rgba(var(--accent), 0.3)",
                  }}
                  title={t("admin.analytics.hourlyTooltip", { hour: h.hour, count: h.count })}
                />
              </div>
              <span className="text-[8px] text-muted">{h.hour % 6 === 0 ? `${h.hour}:00` : ""}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-muted mt-1">
          <span>{t("admin.analytics.twelveAm")}</span>
          <span>{t("admin.analytics.sixAm")}</span>
          <span>{t("admin.analytics.twelvePm")}</span>
          <span>{t("admin.analytics.sixPm")}</span>
          <span>{t("admin.analytics.twelveAm")}</span>
        </div>
      </div>
    </div>
  );
}
