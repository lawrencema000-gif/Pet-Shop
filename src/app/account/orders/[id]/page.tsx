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
  ExternalLink,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { supabase } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import type { Order, OrderItem } from "@/types/order";

const STATUS_VARIANT: Record<string, "default" | "sale" | "new" | "popular"> = {
  pending: "default",
  confirmed: "default",
  shipped: "popular",
  delivered: "new",
  cancelled: "sale",
};

const STATUS_ORDER = ["pending", "confirmed", "shipped", "delivered"];

export default function OrderDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);

  const TIMELINE_STEPS = [
    { key: "pending", label: t('orderDetail.pending'), icon: Clock },
    { key: "confirmed", label: t('orderDetail.processing'), icon: Package },
    { key: "shipped", label: t('orderDetail.shipped'), icon: Truck },
    { key: "delivered", label: t('orderDetail.delivered'), icon: CheckCircle2 },
  ];

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
        {t('orderDetail.backToOrders')}
      </Link>

      {/* Order Header */}
      <div className="bg-background rounded-md border border-border p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
          <h1 className="text-2xl font-bold text-foreground">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <Badge variant={STATUS_VARIANT[order.status] || "default"}>
            {order.status}
          </Badge>
        </div>
        <p className="text-sm text-muted">
          {t('orderDetail.placedOn', {
            date: new Date(order.created_at).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          })}
        </p>
      </div>

      {/* Status Timeline */}
      {!isCancelled && (
        <div className="bg-background rounded-md border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">{t('orderDetail.orderStatus')}</h2>
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
          <p className="text-sale font-medium">{t('orderDetail.cancelledMessage')}</p>
        </div>
      )}

      {/* Tracking Info */}
      {order.tracking_number && (
        <div className="bg-background rounded-md border border-border p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Truck size={18} className="text-accent" />
            <h2 className="text-lg font-semibold text-foreground">{t('trackOrder.shippingInfo')}</h2>
          </div>
          <div className="space-y-2 text-sm">
            {order.carrier && (
              <div className="flex justify-between">
                <span className="text-muted">{t('trackOrder.carrier')}</span>
                <span className="text-foreground font-medium">{order.carrier}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted">{t('trackOrder.trackingNumber')}</span>
              <span className="text-foreground font-mono text-xs">{order.tracking_number}</span>
            </div>
            {order.shipped_at && (
              <div className="flex justify-between">
                <span className="text-muted">{t('trackOrder.shippedDate')}</span>
                <span className="text-foreground">
                  {new Date(order.shipped_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </span>
              </div>
            )}
            {order.delivered_at && (
              <div className="flex justify-between">
                <span className="text-muted">{t('trackOrder.deliveredDate')}</span>
                <span className="text-foreground">
                  {new Date(order.delivered_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </span>
              </div>
            )}
            {order.tracking_url && (
              <a
                href={order.tracking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 mt-2 bg-accent text-white text-sm font-medium rounded hover:bg-accent/90 transition-colors"
              >
                {t('trackOrder.trackPackage')}
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Order Items */}
      <div className="bg-background rounded-md border border-border p-6 mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">{t('orderDetail.items')}</h2>
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
                <p className="text-xs text-muted mt-0.5">{t('orderDetail.qty', { count: item.quantity })}</p>
              </div>
              <p className="font-semibold text-foreground text-sm shrink-0">
                {formatPrice(item.total_price)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="bg-background rounded-md border border-border p-6 mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">{t('orderDetail.orderSummary')}</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">{t('orderDetail.subtotal')}</span>
            <span className="text-foreground">{formatPrice(order.subtotal)}</span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted">
                {t('orderDetail.discount')}{order.coupon_code && ` (${order.coupon_code})`}
              </span>
              <span className="text-success">-{formatPrice(order.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted">{t('orderDetail.shipping')}</span>
            <span className="text-foreground">
              {order.shipping_amount === 0 ? t('orderDetail.free') : formatPrice(order.shipping_amount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">{t('orderDetail.tax')}</span>
            <span className="text-foreground">{formatPrice(order.tax_amount)}</span>
          </div>
          <div className="border-t border-border pt-2 mt-2 flex justify-between">
            <span className="font-semibold text-foreground">{t('orderDetail.total')}</span>
            <span className="font-bold text-foreground text-base">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Download Invoice */}
      <div className="mb-6">
        <button
          onClick={() => {
            const w = window.open("", "_blank");
            if (!w) return;
            const addr = order.shipping_address;
            w.document.write(`<!DOCTYPE html><html><head><title>Invoice #${order.id.slice(0, 8).toUpperCase()}</title>
<style>body{font-family:system-ui,sans-serif;max-width:700px;margin:40px auto;padding:20px;color:#1a1a1a}
h1{font-size:24px;margin-bottom:4px}table{width:100%;border-collapse:collapse;margin:20px 0}
th,td{text-align:left;padding:8px 12px;border-bottom:1px solid #e5e5e5;font-size:14px}
th{font-weight:600;background:#f9f9f9}.total{font-weight:700;font-size:16px}
.meta{color:#666;font-size:13px}.right{text-align:right}@media print{body{margin:0}}</style></head><body>
<h1>Pet and Angels</h1>
<p class="meta">Invoice #${order.id.slice(0, 8).toUpperCase()}</p>
<p class="meta">Date: ${new Date(order.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
<p class="meta">Email: ${order.email}</p>
${addr ? `<p class="meta">Ship to: ${addr.line1}${addr.line2 ? ", " + addr.line2 : ""}, ${addr.city}, ${addr.state} ${addr.zip}</p>` : ""}
<table><thead><tr><th>Item</th><th>Qty</th><th class="right">Price</th></tr></thead><tbody>
${items.map((i) => `<tr><td>${i.product_name}${i.variant_name ? " — " + i.variant_name : ""}</td><td>${i.quantity}</td><td class="right">$${i.total_price.toFixed(2)}</td></tr>`).join("")}
</tbody></table>
<table><tbody>
<tr><td>Subtotal</td><td class="right">$${order.subtotal.toFixed(2)}</td></tr>
${order.discount_amount > 0 ? `<tr><td>Discount${order.coupon_code ? " (" + order.coupon_code + ")" : ""}</td><td class="right">-$${order.discount_amount.toFixed(2)}</td></tr>` : ""}
<tr><td>Shipping</td><td class="right">${order.shipping_amount === 0 ? "Free" : "$" + order.shipping_amount.toFixed(2)}</td></tr>
<tr><td>Tax</td><td class="right">$${order.tax_amount.toFixed(2)}</td></tr>
<tr class="total"><td>Total</td><td class="right">$${order.total.toFixed(2)}</td></tr>
</tbody></table>
<p class="meta" style="margin-top:40px">Thank you for shopping with Pet and Angels!</p>
</body></html>`);
            w.document.close();
            w.print();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-surface transition-colors"
        >
          <FileText size={16} />
          Download Invoice
        </button>
      </div>

      {/* Shipping Address */}
      {order.shipping_address && (
        <div className="bg-background rounded-md border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">{t('orderDetail.shippingAddress')}</h2>
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
        <h3 className="font-semibold text-foreground mb-1">{t('orderDetail.needHelp')}</h3>
        <p className="text-sm text-muted mb-4">
          {t('orderDetail.needHelpDesc')}
        </p>
        <Link href="/support">
          <Button variant="outline" size="sm">
            {t('orderDetail.contactSupport')}
          </Button>
        </Link>
      </div>
    </div>
  );
}
