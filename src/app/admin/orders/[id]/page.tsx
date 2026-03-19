"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Truck, Check, X as XIcon } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatPrice } from "@/lib/utils";
import { logAdminAction } from "@/lib/audit-log";

interface OrderDetail {
  id: string;
  email: string;
  status: string;
  subtotal: number;
  discount_amount: number;
  shipping_amount: number;
  tax_amount: number;
  total: number;
  shipping_address: Record<string, string> | null;
  coupon_code: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface OrderItemDetail {
  id: string;
  product_name: string;
  variant_name: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

const STATUS_FLOW = ["pending", "confirmed", "shipped", "delivered"];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [items, setItems] = useState<OrderItemDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function load() {
      const [{ data: ord }, { data: itms }] = await Promise.all([
        supabase.from("orders").select("*").eq("id", id).single(),
        supabase.from("order_items").select("*").eq("order_id", id),
      ]);
      setOrder(ord);
      setItems(itms ?? []);
      setLoading(false);
    }
    load();
  }, [id]);

  async function updateStatus(newStatus: string) {
    if (!order) return;
    setUpdating(true);
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", id);
    if (!error) {
      await logAdminAction("update_order_status", "order", id, { from: order.status, to: newStatus });
      setOrder({ ...order, status: newStatus });
    }
    setUpdating(false);
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!order) {
    return <div className="text-center py-20"><p className="text-muted">Order not found</p></div>;
  }

  const addr = order.shipping_address;
  const currentIdx = STATUS_FLOW.indexOf(order.status);
  const nextStatus = currentIdx >= 0 && currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/orders" className="p-2 hover:bg-surface rounded-md transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-display font-bold text-foreground">
            Order #{id.slice(0, 8)}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <StatusBadge status={order.status} />
            <span className="text-xs text-muted">
              {new Date(order.created_at).toLocaleString()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {nextStatus && (
            <button
              onClick={() => updateStatus(nextStatus)}
              disabled={updating}
              className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2 text-sm font-medium rounded-md hover:bg-accent-dark transition-colors disabled:opacity-60"
            >
              {nextStatus === "confirmed" && <Check size={14} />}
              {nextStatus === "shipped" && <Truck size={14} />}
              {nextStatus === "delivered" && <Check size={14} />}
              Mark as {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
            </button>
          )}
          {order.status !== "cancelled" && (
            <button
              onClick={() => updateStatus("cancelled")}
              disabled={updating}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-sale border border-sale/30 rounded-md hover:bg-sale/5 transition-colors disabled:opacity-60"
            >
              <XIcon size={14} /> Cancel
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-border rounded-lg">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Items ({items.length})</h2>
            </div>
            <div className="divide-y divide-border/50">
              {items.map((item) => (
                <div key={item.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.product_name}</p>
                    {item.variant_name && <p className="text-xs text-muted">{item.variant_name}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-foreground">{item.quantity} × {formatPrice(item.unit_price)}</p>
                    <p className="text-sm font-medium">{formatPrice(item.total_price)}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Totals */}
            <div className="border-t border-border px-5 py-4 space-y-1.5">
              <div className="flex justify-between text-sm"><span className="text-muted">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              {order.discount_amount > 0 && <div className="flex justify-between text-sm"><span className="text-muted">Discount{order.coupon_code && ` (${order.coupon_code})`}</span><span className="text-success">-{formatPrice(order.discount_amount)}</span></div>}
              <div className="flex justify-between text-sm"><span className="text-muted">Shipping</span><span>{order.shipping_amount === 0 ? "Free" : formatPrice(order.shipping_amount)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted">Tax</span><span>{formatPrice(order.tax_amount)}</span></div>
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-border"><span>Total</span><span>{formatPrice(order.total)}</span></div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Customer */}
          <div className="bg-white border border-border rounded-lg p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Customer</h3>
            <p className="text-sm text-foreground">{order.email}</p>
          </div>

          {/* Shipping Address */}
          {addr && (
            <div className="bg-white border border-border rounded-lg p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Shipping Address</h3>
              <div className="text-sm text-muted space-y-0.5">
                <p>{addr.line1}</p>
                {addr.line2 && <p>{addr.line2}</p>}
                <p>{addr.city}, {addr.state} {addr.zip}</p>
                <p>{addr.country}</p>
              </div>
            </div>
          )}

          {/* Notes */}
          {order.notes && (
            <div className="bg-white border border-border rounded-lg p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Notes</h3>
              <p className="text-sm text-muted">{order.notes}</p>
            </div>
          )}

          {/* Status Timeline */}
          <div className="bg-white border border-border rounded-lg p-5">
            <h3 className="text-sm font-semibold text-foreground mb-3">Status</h3>
            <div className="space-y-3">
              {STATUS_FLOW.map((s, i) => {
                const reached = currentIdx >= i;
                return (
                  <div key={s} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${reached ? "bg-accent text-white" : "bg-surface text-muted"}`}>
                      {reached ? <Check size={12} /> : i + 1}
                    </div>
                    <span className={`text-sm capitalize ${reached ? "text-foreground font-medium" : "text-muted"}`}>
                      {s}
                    </span>
                  </div>
                );
              })}
              {order.status === "cancelled" && (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-sale text-white flex items-center justify-center"><XIcon size={12} /></div>
                  <span className="text-sm text-sale font-medium">Cancelled</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
