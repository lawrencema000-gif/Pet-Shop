import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-server";
import { SHIPPING_COST, TAX_RATE, FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import type Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (webhookSecret && webhookSecret !== "whsec_PLACEHOLDER") {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      // Dev mode: parse without verification
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata ?? {};
    const supabase = createAdminSupabaseClient();

    // Check if order already created (idempotency)
    const existingCheck = await supabase
      .from("orders")
      .select("id")
      .eq("stripe_checkout_session_id", session.id)
      .maybeSingle();

    if (existingCheck.data) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    // Parse checkout data — either from metadata or pending_checkouts table
    let items: { product_id: string; variant_id: string | null; quantity: number }[];
    let shippingAddress: Record<string, string>;
    let email: string;
    let userId: string | null;
    let couponCode: string | null;
    let idempotencyKey: string | null;

    if (metadata.pending_checkout_id) {
      // Data was stored in pending_checkouts table (overflow case)
      const { data: pending } = await supabase
        .from("pending_checkouts")
        .select("*")
        .eq("id", metadata.pending_checkout_id)
        .single();

      if (!pending) {
        console.error("Pending checkout not found:", metadata.pending_checkout_id);
        return NextResponse.json({ error: "Pending checkout not found" }, { status: 500 });
      }

      items = pending.items as typeof items;
      shippingAddress = pending.shipping_address as Record<string, string>;
      email = pending.email;
      userId = pending.user_id;
      couponCode = pending.coupon_code;
      idempotencyKey = pending.idempotency_key;
    } else {
      // Data from Stripe metadata
      items = JSON.parse(metadata.items || "[]");
      shippingAddress = JSON.parse(metadata.shipping_address || "{}");
      email = metadata.email || session.customer_email || "";
      userId = metadata.user_id || null;
      couponCode = metadata.coupon_code || null;
      idempotencyKey = metadata.idempotency_key || null;
    }

    // Call the existing atomic checkout RPC
    const { data, error } = await supabase.rpc("process_checkout", {
      p_user_id: userId || null,
      p_email: email,
      p_items: items,
      p_shipping_address: shippingAddress,
      p_coupon_code: couponCode,
      p_idempotency_key: idempotencyKey,
      p_shipping_cost: SHIPPING_COST,
      p_tax_rate: TAX_RATE,
      p_free_shipping_threshold: FREE_SHIPPING_THRESHOLD,
    });

    if (error) {
      console.error("process_checkout failed in webhook:", error);

      // Payment was taken but order creation failed — issue refund
      if (session.payment_intent) {
        try {
          await stripe.refunds.create({
            payment_intent: session.payment_intent as string,
            reason: "requested_by_customer",
          });
          console.log("Auto-refund issued for failed order:", session.id);
        } catch (refundErr) {
          console.error("Auto-refund also failed:", refundErr);
        }
      }

      return NextResponse.json({ error: "Order creation failed, refund issued" }, { status: 500 });
    }

    // Update order with Stripe IDs and payment status
    await supabase
      .from("orders")
      .update({
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: (session.payment_intent as string) || null,
        payment_status: "paid",
        status: "confirmed",
      })
      .eq("id", data.order_id);

    // Clean up pending checkout if used
    if (metadata.pending_checkout_id) {
      await supabase.from("pending_checkouts").delete().eq("id", metadata.pending_checkout_id);
    }

    // Fire-and-forget: send order confirmation email
    if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith("re_placeholder")) {
      import("@/lib/email").then(({ sendOrderConfirmation }) => {
        sendOrderConfirmation({
          orderId: data.order_id,
          email,
          items: items.map((i) => ({
            name: i.product_id,
            quantity: i.quantity,
            price: 0,
          })),
          subtotal: data.subtotal,
          shipping: data.shipping_amount,
          tax: data.tax_amount,
          discount: data.discount_amount,
          total: data.total,
          shippingAddress: shippingAddress as unknown as import("@/types/order").ShippingAddress,
        }).catch((err: Error) => console.error("Order email failed:", err));
      });
    }
  }

  return NextResponse.json({ received: true });
}
