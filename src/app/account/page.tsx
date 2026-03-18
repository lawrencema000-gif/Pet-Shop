"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  ChevronRight,
  ShoppingBag,
  CalendarDays,
  PawPrint,
  User,
  MapPin,
  Settings,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { supabase } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import type { User as AuthUser } from "@supabase/supabase-js";
import type { Order } from "@/types/order";

const STATUS_VARIANT: Record<string, "default" | "sale" | "new" | "popular"> = {
  pending: "default",
  confirmed: "default",
  shipped: "popular",
  delivered: "new",
  cancelled: "sale",
};

const QUICK_LINKS = [
  { href: "/account/profile", label: "Edit Profile", icon: User },
  { href: "/account/addresses", label: "Address Book", icon: MapPin },
  { href: "/account/orders", label: "Order History", icon: Package },
  { href: "/account/pets", label: "Pet Profiles", icon: PawPrint },
  { href: "/account/settings", label: "Settings", icon: Settings },
];

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrderCount, setTotalOrderCount] = useState(0);
  const [petCount, setPetCount] = useState(0);
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

      const [{ data: ordersData }, { count }, { count: petsCount }] =
        await Promise.all([
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
          supabase
            .from("pets")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id),
        ]);

      setOrders((ordersData as Order[]) || []);
      setTotalOrderCount(count || 0);
      setPetCount(petsCount || 0);
      setLoading(false);
    };

    init();
  }, [router]);

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
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Welcome back, {fullName}
        </h1>
        <p className="text-muted mt-1">{user.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
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
        <div className="bg-surface-light rounded-xl p-5 col-span-2 md:col-span-1">
          <div className="flex items-center gap-3 mb-2">
            <PawPrint size={20} className="text-muted" />
            <span className="text-sm text-muted">Pets</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{petCount}</p>
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
                href={`/account/orders/${order.id}`}
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
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Quick Links
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between bg-surface-light rounded-xl p-4 hover:bg-surface transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} className="text-muted" />
                  <span className="font-medium text-foreground">
                    {link.label}
                  </span>
                </div>
                <ChevronRight size={18} className="text-muted" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Need Help */}
      <div className="bg-surface-light rounded-xl p-6 text-center">
        <HelpCircle size={28} className="text-muted mx-auto mb-2" />
        <h3 className="font-semibold text-foreground mb-1">Need Help?</h3>
        <p className="text-sm text-muted mb-4">
          Our support team is here for you and your pets.
        </p>
        <Link href="/support">
          <Button variant="outline" size="sm">
            Contact Support
          </Button>
        </Link>
      </div>
    </div>
  );
}
