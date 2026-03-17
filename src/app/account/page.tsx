"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  LogOut,
  ChevronRight,
  ShoppingBag,
  CalendarDays,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { supabase } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import type { User } from "@supabase/supabase-js";
import type { Order } from "@/types/order";

const STATUS_VARIANT: Record<string, "default" | "sale" | "new" | "popular"> = {
  pending: "default",
  confirmed: "default",
  shipped: "popular",
  delivered: "new",
  cancelled: "sale",
};

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrderCount, setTotalOrderCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/auth/login?redirect=/account");
        return;
      }

      setUser(user);

      const [{ data: ordersData }, { count }] = await Promise.all([
        supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
      ]);

      setOrders((ordersData as Order[]) || []);
      setTotalOrderCount(count || 0);
      setLoading(false);
    };

    init();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-muted" />
      </div>
    );
  }

  if (!user) return null;

  const fullName =
    user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
  const memberSince = new Date(user.created_at).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Welcome back, {fullName}
        </h1>
        <p className="text-muted mt-1">{user.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-surface-light rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingBag size={20} className="text-muted" />
            <span className="text-sm text-muted">Total Orders</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalOrderCount}</p>
        </div>
        <div className="bg-surface-light rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <CalendarDays size={20} className="text-muted" />
            <span className="text-sm text-muted">Member Since</span>
          </div>
          <p className="text-lg font-bold text-foreground">{memberSince}</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Recent Orders
          </h2>
          <Link
            href="/account/orders"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            View All
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-surface-light rounded-xl p-8 text-center">
            <Package size={40} className="text-border mx-auto mb-3" />
            <p className="text-muted mb-4">No orders yet</p>
            <Link href="/products">
              <Button variant="outline" size="sm">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href="/account/orders"
                className="flex items-center justify-between bg-surface-light rounded-xl p-4 hover:bg-surface transition-colors"
              >
                <div>
                  <p className="font-medium text-foreground text-sm">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {new Date(order.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={STATUS_VARIANT[order.status] || "default"}>
                    {order.status}
                  </Badge>
                  <span className="font-semibold text-foreground text-sm">
                    {formatPrice(order.total)}
                  </span>
                  <ChevronRight size={16} className="text-muted" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="space-y-2">
        <Link
          href="/account/orders"
          className="flex items-center justify-between bg-surface-light rounded-xl p-4 hover:bg-surface transition-colors"
        >
          <div className="flex items-center gap-3">
            <Package size={20} className="text-muted" />
            <span className="font-medium text-foreground">Order History</span>
          </div>
          <ChevronRight size={18} className="text-muted" />
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-between bg-surface-light rounded-xl p-4 hover:bg-surface transition-colors"
        >
          <div className="flex items-center gap-3">
            <LogOut size={20} className="text-muted" />
            <span className="font-medium text-foreground">Sign Out</span>
          </div>
          <ChevronRight size={18} className="text-muted" />
        </button>
      </div>
    </div>
  );
}
