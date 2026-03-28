"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";

interface OrderData {
  id: string;
  email: string;
  total: number;
  payment_status: string;
  status: string;
  created_at: string;
}

export default function CheckoutSuccessPage() {
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

  const pollStatus = useCallback(async () => {
    if (!sessionId) {
      setError("No session ID found");
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
        setError("Unable to find your order");
        setPending(false);
      }
    } catch {
      setError("Failed to check order status");
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
        <h1 className="text-2xl font-bold text-foreground mb-2">Processing Your Order</h1>
        <p className="text-muted">
          Your payment was successful. We&apos;re finalizing your order...
        </p>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-2">Payment Received</h1>
        <p className="text-muted mb-4">
          Your payment was successful but we&apos;re still processing your order. You&apos;ll receive a confirmation email shortly.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/products">
            <Button variant="outline">Continue Shopping</Button>
          </Link>
          <Link href="/account/orders">
            <Button>View Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Success
  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div>
        <CheckCircle2 size={64} className="text-success mx-auto mb-6" />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">Order Confirmed!</h1>
      <p className="text-muted mb-2">
        Thank you for your order. We&apos;ll send a confirmation to{" "}
        <span className="font-medium text-foreground">{order?.email}</span>.
      </p>
      <p className="text-sm text-muted mb-2">
        Order ID:{" "}
        <span className="font-mono text-foreground">
          {order?.id.slice(0, 8).toUpperCase()}
        </span>
      </p>
      {order && (
        <p className="text-lg font-bold text-foreground mb-8">
          Total: {formatPrice(order.total)}
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/products">
          <Button variant="outline">Continue Shopping</Button>
        </Link>
        <Link href="/account/orders">
          <Button>View Orders</Button>
        </Link>
      </div>
    </div>
  );
}
