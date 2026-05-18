"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import { trackEvent } from "@/lib/meta-events";

interface OrderItem {
  product_id: string;
  product_name: string;
  variant_name: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface OrderData {
  id: string;
  email: string;
  total: number;
  subtotal: number;
  shipping_amount: number;
  tax_amount: number;
  discount_amount: number;
  payment_status: string;
  status: string;
  shipping_address: { line1: string; line2?: string; city: string; state: string; zip: string; country: string } | null;
  created_at: string;
  items: OrderItem[];
}

export default function CheckoutSuccessPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const clearCart = useCartStore((s) => s.clearCart);

  const [order, setOrder] = useState<OrderData | null>(null);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Clear cart on mount
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  // Meta Purchase — fire once when order resolves. Keyed by order.id so
  // re-renders / re-polls don't double-fire.
  useEffect(() => {
    if (!order?.id) return;
    trackEvent(
      "Purchase",
      {
        order_id: order.id,
        value: order.total,
        currency: "USD",
        num_items: order.items.reduce((s, i) => s + i.quantity, 0),
        content_ids: order.items.map((i) => i.product_id),
        content_type: "product",
        contents: order.items.map((i) => ({
          id: i.product_id,
          quantity: i.quantity,
          item_price: i.unit_price,
        })),
      },
      { email: order.email },
    );
  }, [order?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const pollStatus = useCallback(async () => {
    if (!sessionId) {
      setError(t('checkoutSuccess.noSessionId'));
      setPending(false);
      return;
    }

    try {
      const res = await fetch(`/api/checkout/session-status?session_id=${sessionId}`);
      const data = await res.json();

      if (data.order) {
        setOrder(data.order);
        setPending(false);
      } else if (data.pending) {
        // Webhook hasn't fired yet, keep polling
        setPending(true);
      } else {
        setError(t('checkoutSuccess.orderNotFound'));
        setPending(false);
      }
    } catch {
      setError(t('checkoutSuccess.statusCheckFailed'));
      setPending(false);
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;

    pollStatus();

    // Poll every 2s for up to 30s
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (attempts > 15 || !pending) {
        clearInterval(interval);
        return;
      }
      pollStatus();
    }, 2000);

    return () => clearInterval(interval);
  }, [sessionId, pollStatus, pending]);

  // Still loading
  if (pending && !order) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <Loader2 size={48} className="text-accent mx-auto mb-6 animate-spin" />
        <h1 className="text-2xl font-bold text-foreground mb-2">{t('checkoutSuccess.processingTitle')}</h1>
        <p className="text-muted">
          {t('checkoutSuccess.processingDesc')}
        </p>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">{t('checkoutSuccess.paymentReceived')}</h1>
        <p className="text-muted mb-4">
          {t('checkoutSuccess.paymentReceivedDesc')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/products">
            <Button variant="outline">{t('common.continueShopping')}</Button>
          </Link>
          <Link href="/account/orders">
            <Button>{t('checkoutSuccess.viewOrders')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Success
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <CheckCircle2 size={64} className="text-success mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">{t('checkoutSuccess.orderConfirmed')}</h1>
        <p className="text-muted">
          {t('checkoutSuccess.confirmationEmail', { email: order?.email })}
        </p>
        <p className="text-sm text-muted mt-1">
          {t('checkoutSuccess.orderId')}{" "}
          <span className="font-mono font-semibold text-foreground">{order?.id.slice(0, 8).toUpperCase()}</span>
        </p>
      </div>

      {order && (
        <div className="space-y-6">
          {/* Items */}
          {order.items && order.items.length > 0 && (
            <div className="bg-background border border-border rounded-lg p-5">
              <h2 className="text-sm font-semibold text-foreground mb-3">Order Items</h2>
              <div className="divide-y divide-border">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between py-2 text-sm">
                    <div>
                      <span className="text-foreground">{item.product_name}</span>
                      {item.variant_name && <span className="text-muted"> — {item.variant_name}</span>}
                      <span className="text-muted"> x{item.quantity}</span>
                    </div>
                    <span className="font-medium text-foreground">{formatPrice(item.total_price)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Totals */}
          <div className="bg-background border border-border rounded-lg p-5">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-success"><span>Discount</span><span>-{formatPrice(order.discount_amount)}</span></div>
              )}
              <div className="flex justify-between"><span className="text-muted">Shipping</span><span>{order.shipping_amount === 0 ? "Free" : formatPrice(order.shipping_amount)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Tax</span><span>{formatPrice(order.tax_amount)}</span></div>
              <div className="flex justify-between border-t border-border pt-2 mt-2">
                <span className="font-bold text-foreground">Total</span>
                <span className="font-bold text-foreground text-lg">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shipping_address && (
            <div className="bg-background border border-border rounded-lg p-5">
              <h2 className="text-sm font-semibold text-foreground mb-2">Shipping To</h2>
              <p className="text-sm text-muted">
                {order.shipping_address.line1}
                {order.shipping_address.line2 && <>, {order.shipping_address.line2}</>}<br />
                {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
        <Link href="/products">
          <Button variant="outline">{t('common.continueShopping')}</Button>
        </Link>
        <Link href="/account/orders">
          <Button>{t('checkoutSuccess.viewOrders')}</Button>
        </Link>
      </div>
    </div>
  );
}
