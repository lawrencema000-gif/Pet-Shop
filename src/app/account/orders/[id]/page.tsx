"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Package,
  CheckCircle2,
  Truck,
  Clock,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { supabase } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import type { Order, OrderItem } from "@/types/order";

const STATUS_VARIANT: Record<string, "default" | "sale" | "new" | "popular"> = {
  pending: "default",
  confirmed: "default",
  shipped: "popular",
  delivered: "new",
  cancelled: "sale",
};

const TIMELINE_STEPS = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "confirmed", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

const STATUS_ORDER = ["pending", "confirmed", "shipped", "delivered"];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/auth/login?redirect=/account/orders");
        return;
      }

      const orderId = params.id as string;

      const [{ data: orderData }, { data: itemsData }] = await Promise.all([
        supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .eq("user_id", user.id)
          .single(),
        supabase.from("order_items").select("*").eq("order_id", orderId),
      ]);

      if (!orderData) {
        router.replace("/account/orders");
        return;
      }

      setOrder(orderData as Order);
      setItems((itemsData as OrderItem[]) || []);
      setLoading(false);
    };

    init();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-muted" />
      </div>
    );
  }

  if (!order) return null;

  const currentStepIndex = STATUS_ORDER.indexOf(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div>
      {/* Back link */}
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to Orders
      </Link>

      {/* Order Header */}
      <div className="bg-white rounded-xl border border-border p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
          <h1 className="text-2xl font-bold text-foreground">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <Badge variant={STATUS_VARIANT[order.status] || "default"}>
            {order.status}
          </Badge>
        </div>
        <p className="text-sm text-muted">
          Placed on{" "}
          {new Date(order.created_at).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Status Timeline */}
      {!isCancelled && (
        <div className="bg-white rounded-xl border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">Order Status</h2>
          <div className="flex items-center justify-between relative">
            {/* Progress line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
            <div
              className="absolute top-5 left-0 h-0.5 bg-accent transition-all"
              style={{
                width: `${Math.max(0, currentStepIndex) * (100 / (TIMELINE_STEPS.length - 1))}%`,
              }}
            />

            {TIMELINE_STEPS.map((step, i) => {
              const Icon = step.icon;
              const isCompleted = i <= currentStepIndex;
              const isCurrent = i === currentStepIndex;
              return (
                <div key={step.key} className="relative flex flex-col items-center z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isCompleted
                        ? "bg-accent text-white"
                        : "bg-surface-light text-muted border-2 border-border"
                    } ${isCurrent ? "ring-4 ring-accent/20" : ""}`}
                  >
                    <Icon size={18} />
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      isCompleted ? "text-foreground" : "text-muted"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="bg-sale/5 border border-sale/20 rounded-xl p-6 mb-6 text-center">
          <p className="text-sale font-medium">This order has been cancelled.</p>
        </div>
      )}

      {/* Order Items */}
      <div className="bg-white rounded-xl border border-border p-6 mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Items</h2>
        <div className="divide-y divide-border">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
              <div className="w-16 h-16 bg-surface-light rounded-lg flex items-center justify-center shrink-0">
                <Package size={24} className="text-muted" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm truncate">
                  {item.product_name}
                </p>
                {item.variant_name && (
                  <p className="text-xs text-muted mt-0.5">{item.variant_name}</p>
                )}
                <p className="text-xs text-muted mt-0.5">Qty: {item.quantity}</p>
              </div>
              <p className="font-semibold text-foreground text-sm shrink-0">
                {formatPrice(item.total_price)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="bg-white rounded-xl border border-border p-6 mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Order Summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Subtotal</span>
            <span className="text-foreground">{formatPrice(order.subtotal)}</span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted">
                Discount{order.coupon_code && ` (${order.coupon_code})`}
              </span>
              <span className="text-success">-{formatPrice(order.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted">Shipping</span>
            <span className="text-foreground">
              {order.shipping_amount === 0 ? "Free" : formatPrice(order.shipping_amount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Tax</span>
            <span className="text-foreground">{formatPrice(order.tax_amount)}</span>
          </div>
          <div className="border-t border-border pt-2 mt-2 flex justify-between">
            <span className="font-semibold text-foreground">Total</span>
            <span className="font-bold text-foreground text-base">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      {order.shipping_address && (
        <div className="bg-white rounded-xl border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">Shipping Address</h2>
          <p className="text-sm text-muted leading-relaxed">
            {order.shipping_address.line1}
            {order.shipping_address.line2 && <>, {order.shipping_address.line2}</>}
            <br />
            {order.shipping_address.city}, {order.shipping_address.state}{" "}
            {order.shipping_address.zip}
            <br />
            {order.shipping_address.country}
          </p>
        </div>
      )}

      {/* Need Help */}
      <div className="bg-surface-light rounded-xl p-6 text-center">
        <HelpCircle size={28} className="text-muted mx-auto mb-2" />
        <h3 className="font-semibold text-foreground mb-1">Need Help?</h3>
        <p className="text-sm text-muted mb-4">
          Having an issue with this order? We&apos;re here to help.
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
