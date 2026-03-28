"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  Clock,
  AlertTriangle,
  Plus,
  ArrowRight,
  RotateCcw,
  MessageSquare,
  Ticket,
  XCircle,
  Bell,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { StatsCard } from "@/components/admin/StatsCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatPrice } from "@/lib/utils";

interface DashboardStats {
  totalRevenue: number;
  ordersToday: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
  lowStockCount: number;
}

interface RecentOrder {
  id: string;
  email: string;
  total: number;
  status: string;
  created_at: string;
}

interface LowStockItem {
  id: string;
  name: string;
  variant_name: string;
  stock_quantity: number;
}

interface Alert {
  id: string;
  type: "return" | "review" | "coupon" | "cancelled";
  icon: typeof Clock;
  color: string;
  title: string;
  detail: string;
  href: string;
  time: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [
        { count: productCount },
        { count: customerCount },
        { data: orders },
        { count: pendingCount },
        { data: variants },
        { data: recent },
      ] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "customer"),
        supabase.from("orders").select("total"),
        supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("product_variants").select("id, name, stock_quantity, product_id").lte("stock_quantity", 10).order("stock_quantity", { ascending: true }).limit(10),
        supabase.from("orders").select("id, email, total, status, created_at").order("created_at", { ascending: false }).limit(10),
      ]);

      const todayOrders = recent?.filter(
        (o) => new Date(o.created_at) >= today
      ).length ?? 0;

      const totalRev = orders?.reduce((sum, o) => sum + (Number(o.total) || 0), 0) ?? 0;

      // Get product names for low stock variants
      let lowStockItems: LowStockItem[] = [];
      if (variants && variants.length > 0) {
        const productIds = Array.from(new Set(variants.map((v) => v.product_id)));
        const { data: products } = await supabase
          .from("products")
          .select("id, name")
          .in("id", productIds);
        const nameMap = new Map(products?.map((p) => [p.id, p.name]) ?? []);
        lowStockItems = variants.map((v) => ({
          id: v.id,
          name: nameMap.get(v.product_id) ?? "Unknown",
          variant_name: v.name,
          stock_quantity: v.stock_quantity,
        }));
      }

      setStats({
        totalRevenue: totalRev,
        ordersToday: todayOrders,
        totalProducts: productCount ?? 0,
        totalCustomers: customerCount ?? 0,
        pendingOrders: pendingCount ?? 0,
        lowStockCount: variants?.length ?? 0,
      });
      setRecentOrders(recent ?? []);
      setLowStock(lowStockItems);

      // Fetch alerts
      const alertItems: Alert[] = [];

      // Pending returns
      const { data: pendingReturns } = await supabase
        .from("return_requests")
        .select("id, order_id, email, created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5);
      pendingReturns?.forEach((r) => {
        alertItems.push({
          id: `return-${r.id}`,
          type: "return",
          icon: RotateCcw,
          color: "text-amber-500",
          title: "Pending Return",
          detail: `${r.email} — Order #${r.order_id.slice(0, 8)}`,
          href: "/admin/returns",
          time: new Date(r.created_at).toLocaleDateString(),
        });
      });

      // Unmoderated reviews (pending)
      const { data: pendingReviews } = await supabase
        .from("reviews")
        .select("id, title, rating, created_at")
        .eq("is_approved", false)
        .order("created_at", { ascending: false })
        .limit(5);
      pendingReviews?.forEach((r) => {
        alertItems.push({
          id: `review-${r.id}`,
          type: "review",
          icon: MessageSquare,
          color: "text-blue-500",
          title: "Review Pending Approval",
          detail: `${"★".repeat(r.rating)} ${r.title ?? "No title"}`,
          href: "/admin/reviews",
          time: new Date(r.created_at).toLocaleDateString(),
        });
      });

      // Expiring coupons (within 7 days)
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      const { data: expiringCoupons } = await supabase
        .from("coupons")
        .select("id, code, expires_at")
        .eq("is_active", true)
        .not("expires_at", "is", null)
        .lte("expires_at", weekFromNow.toISOString())
        .gte("expires_at", new Date().toISOString())
        .limit(5);
      expiringCoupons?.forEach((c) => {
        alertItems.push({
          id: `coupon-${c.id}`,
          type: "coupon",
          icon: Ticket,
          color: "text-purple-500",
          title: "Coupon Expiring Soon",
          detail: `${c.code} expires ${new Date(c.expires_at!).toLocaleDateString()}`,
          href: "/admin/coupons",
          time: new Date(c.expires_at!).toLocaleDateString(),
        });
      });

      // Recent cancelled orders (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { data: cancelledOrders } = await supabase
        .from("orders")
        .select("id, email, total, created_at")
        .eq("status", "cancelled")
        .gte("created_at", weekAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(3);
      cancelledOrders?.forEach((o) => {
        alertItems.push({
          id: `cancelled-${o.id}`,
          type: "cancelled",
          icon: XCircle,
          color: "text-sale",
          title: "Order Cancelled",
          detail: `#${o.id.slice(0, 8)} — ${formatPrice(o.total)}`,
          href: `/admin/orders/${o.id}`,
          time: new Date(o.created_at).toLocaleDateString(),
        });
      });

      setAlerts(alertItems);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted mt-1">Welcome back to your store admin</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2.5 text-sm font-medium rounded-md hover:bg-accent-dark transition-colors"
        >
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatsCard icon={DollarSign} label="Total Revenue" value={formatPrice(stats?.totalRevenue ?? 0)} loading={loading} />
        <StatsCard icon={ShoppingBag} label="Orders Today" value={stats?.ordersToday ?? 0} loading={loading} />
        <StatsCard icon={Package} label="Products" value={stats?.totalProducts ?? 0} loading={loading} />
        <StatsCard icon={Users} label="Customers" value={stats?.totalCustomers ?? 0} loading={loading} />
        <StatsCard icon={Clock} label="Pending Orders" value={stats?.pendingOrders ?? 0} loading={loading} />
        <StatsCard icon={AlertTriangle} label="Low Stock" value={stats?.lowStockCount ?? 0} loading={loading} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white border border-border rounded-lg">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-accent hover:underline flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-border/50">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-5 py-3 flex items-center gap-3">
                    <div className="h-4 w-20 bg-surface rounded animate-pulse" />
                    <div className="h-4 w-32 bg-surface rounded animate-pulse flex-1" />
                    <div className="h-4 w-16 bg-surface rounded animate-pulse" />
                  </div>
                ))
              : recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-surface/50 transition-colors"
                  >
                    <span className="text-xs font-mono text-muted w-20 shrink-0">
                      #{order.id.slice(0, 8)}
                    </span>
                    <span className="text-sm text-foreground truncate flex-1">{order.email}</span>
                    <StatusBadge status={order.status} />
                    <span className="text-sm font-medium text-foreground w-20 text-right">
                      {formatPrice(order.total)}
                    </span>
                  </Link>
                ))}
            {!loading && recentOrders.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-muted">No orders yet</div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white border border-border rounded-lg">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Low Stock Alerts</h2>
            <Link href="/admin/inventory" className="text-xs text-accent hover:underline flex items-center gap-1">
              View All <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-border/50">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-5 py-3">
                    <div className="h-4 w-48 bg-surface rounded animate-pulse" />
                  </div>
                ))
              : lowStock.map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm text-foreground">{item.name}</p>
                      <p className="text-xs text-muted">{item.variant_name}</p>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        item.stock_quantity === 0
                          ? "bg-sale/10 text-sale"
                          : "bg-warning/10 text-warning"
                      }`}
                    >
                      {item.stock_quantity === 0 ? "Out of stock" : `${item.stock_quantity} left`}
                    </span>
                  </div>
                ))}
            {!loading && lowStock.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-muted">All stock levels healthy</div>
            )}
          </div>
        </div>
      </div>

      {/* Alerts Panel */}
      {alerts.length > 0 && (
        <div className="mt-6 bg-white border border-border rounded-lg">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
            <Bell size={16} className="text-amber-500" />
            <h2 className="text-sm font-semibold text-foreground">Alerts</h2>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">{alerts.length}</span>
          </div>
          <div className="divide-y divide-border/50">
            {alerts.map((alert) => {
              const Icon = alert.icon;
              return (
                <Link
                  key={alert.id}
                  href={alert.href}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-surface/50 transition-colors"
                >
                  <Icon size={16} className={alert.color} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{alert.title}</p>
                    <p className="text-xs text-muted truncate">{alert.detail}</p>
                  </div>
                  <span className="text-xs text-muted shrink-0">{alert.time}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Add Product", href: "/admin/products/new", icon: Plus },
          { label: "Manage Orders", href: "/admin/orders", icon: ShoppingBag },
          { label: "View Analytics", href: "/admin/analytics", icon: DollarSign },
          { label: "Store Settings", href: "/admin/settings", icon: Package },
        ].map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex items-center gap-3 bg-white border border-border rounded-lg px-4 py-3 hover:shadow-card transition-shadow"
          >
            <action.icon size={18} className="text-accent" />
            <span className="text-sm font-medium text-foreground">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
