"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase/client";
import { formatPrice, cn } from "@/lib/utils";
import type { Order, OrderItem } from "@/types/order";

const STATUS_COLORS: Record<string, string> = {
  pending: "text-yellow-600 bg-yellow-50",
  confirmed: "text-blue-600 bg-blue-50",
  shipped: "text-purple-600 bg-purple-50",
  delivered: "text-success bg-success/10",
  cancelled: "text-red-600 bg-red-50",
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/auth/login?redirect=/account/orders");
        return;
      }

      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setOrders((ordersData as Order[]) || []);
      setLoading(false);
    };

    init();
  }, [router]);

  const toggleOrder = async (orderId: string) => {
    if (expandedId === orderId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(orderId);

    if (!orderItems[orderId]) {
      const { data } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);

      if (data) {
        setOrderItems((prev) => ({ ...prev, [orderId]: data as OrderItem[] }));
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <Link
        href="/account"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Account
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
        Order History
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package size={56} className="text-border mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            No orders yet
          </h2>
          <p className="text-muted mb-6">
            When you place orders, they&apos;ll appear here.
          </p>
          <Link href="/products">
            <Button>Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-background border border-border rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggleOrder(order.id)}
                className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-surface-light transition-colors"
              >
                <div className="flex items-center gap-4 md:gap-6 text-left">
                  <div>
                    <p className="font-semibold text-foreground">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium px-2.5 py-1 rounded-full capitalize",
                      STATUS_COLORS[order.status] || STATUS_COLORS.pending
                    )}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-foreground">
                    {formatPrice(order.total)}
                  </span>
                  {expandedId === order.id ? (
                    <ChevronUp size={18} className="text-muted" />
                  ) : (
                    <ChevronDown size={18} className="text-muted" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {expandedId === order.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-border px-4 md:px-5 py-4">
                      {orderItems[order.id] ? (
                        <div className="space-y-3">
                          {orderItems[order.id].map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between text-sm"
                            >
                              <div>
                                <p className="font-medium text-foreground">
                                  {item.product_name}
                                </p>
                                {item.variant_name && (
                                  <p className="text-xs text-muted">
                                    {item.variant_name}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-foreground">
                                  {formatPrice(item.total_price)}
                                </p>
                                <p className="text-xs text-muted">
                                  Qty: {item.quantity} &times;{" "}
                                  {formatPrice(item.unit_price)}
                                </p>
                              </div>
                            </div>
                          ))}

                          <div className="border-t border-border pt-3 mt-3 space-y-1 text-sm">
                            <div className="flex justify-between text-muted">
                              <span>Subtotal</span>
                              <span>{formatPrice(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-muted">
                              <span>Shipping</span>
                              <span>
                                {order.shipping_amount === 0
                                  ? "Free"
                                  : formatPrice(order.shipping_amount)}
                              </span>
                            </div>
                            <div className="flex justify-between text-muted">
                              <span>Tax</span>
                              <span>{formatPrice(order.tax_amount)}</span>
                            </div>
                            {order.discount_amount > 0 && (
                              <div className="flex justify-between text-success">
                                <span>Discount</span>
                                <span>
                                  -{formatPrice(order.discount_amount)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center py-4">
                          <Loader2
                            size={20}
                            className="animate-spin text-muted"
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
