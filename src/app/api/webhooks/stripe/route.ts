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
    if (!webhookSecret || webhookSecret === "whsec_PLACEHOLDER") {
      console.error("STRIPE_WEBHOOK_SECRET not configured — rejecting webhook");
      return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
    }
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata ?? {};
    const supabase = createAdminSupabaseClient();

    // ─── Membership checkout (subscription mode w/ membership metadata) ───
    // Note: subscription_data.metadata sits on the Subscription, not the Session,
    // so we identify membership checkouts by mode=subscription + retrieve the subscription.
    if (session.mode === "subscription" && session.subscription) {
      try {
        const subId = session.subscription as string;
        const sub = await stripe.subscriptions.retrieve(subId);
        const subMeta = sub.metadata ?? {};
        if (subMeta.type === "membership" && subMeta.supabase_user_id && subMeta.plan_id) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const sa = sub as any;
          const trialEnd = sa.trial_end ? new Date(sa.trial_end * 1000).toISOString() : null;
          await supabase.from("memberships").upsert(
            {
              user_id: subMeta.supabase_user_id,
              plan_id: subMeta.plan_id,
              stripe_subscription_id: subId,
              stripe_customer_id: sub.customer as string,
              status: sub.status,
              current_period_start: new Date(sa.current_period_start * 1000).toISOString(),
              current_period_end: new Date(sa.current_period_end * 1000).toISOString(),
              trial_end: trialEnd,
              cancel_at_period_end: sub.cancel_at_period_end,
            },
            { onConflict: "user_id" },
          );
          return NextResponse.json({ received: true, type: "membership_created" });
        }
      } catch (err) {
        console.error("Membership checkout webhook error:", err);
      }
    }

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
            // Auto-refund due to order processing failure
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

    // Mark abandoned cart as recovered if exists
    await supabase
      .from("abandoned_carts")
      .update({ recovered: true, recovered_at: new Date().toISOString(), recovered_order_id: data.order_id })
      .eq("email", email)
      .eq("recovered", false);

    // Award loyalty points + update lifetime spend / tier — logged-in users only
    try {
      const { data: orderRow } = await supabase
        .from("orders")
        .select("user_id, total")
        .eq("id", data.order_id)
        .single();
      if (orderRow?.user_id && orderRow.total) {
        // Look up tier/membership multiplier
        const { data: prof } = await supabase
          .from("profiles")
          .select("membership_tier")
          .eq("id", orderRow.user_id)
          .maybeSingle();

        const [{ data: tier }, { data: isPremium }] = await Promise.all([
          supabase
            .from("membership_tiers")
            .select("points_earn_multiplier")
            .eq("slug", prof?.membership_tier ?? "bronze")
            .maybeSingle(),
          supabase.rpc("is_active_premium_member", { p_user_id: orderRow.user_id }),
        ]);

        const tierMult = Number(tier?.points_earn_multiplier ?? 1);
        const premiumMult = isPremium === true ? 1.5 : 1; // matches Pet+ plan default
        const multiplier = Math.max(tierMult, premiumMult);

        const pointsToAward = Math.floor(orderRow.total * multiplier);
        if (pointsToAward > 0) {
          await supabase.rpc("award_points", {
            p_user_id: orderRow.user_id,
            p_amount: pointsToAward,
            p_type: "order_earn",
            p_reason: `Earned for order #${data.order_id.slice(0, 8)} (×${multiplier})`,
            p_order_id: data.order_id,
          });
          await supabase
            .from("orders")
            .update({ points_earned: pointsToAward })
            .eq("id", data.order_id);
        }

        // Update lifetime spend → recalc tier
        await supabase.rpc("update_lifetime_spend", {
          p_user_id: orderRow.user_id,
          p_order_id: data.order_id,
        });
      }
    } catch (pErr) {
      console.error("Points/tier award failed:", pErr);
    }

    // Award referral bonus on referred user's first paid order
    try {
      const { data: orderRow } = await supabase
        .from("orders")
        .select("user_id")
        .eq("id", data.order_id)
        .single();
      if (orderRow?.user_id) {
        // Check if this user is referred + this is their first paid order
        const { count: priorOrders } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("user_id", orderRow.user_id)
          .eq("payment_status", "paid")
          .neq("id", data.order_id);
        if ((priorOrders ?? 0) === 0) {
          await supabase.rpc("award_referral_bonus", {
            p_referred_user_id: orderRow.user_id,
            p_order_id: data.order_id,
          });
        }
      }
    } catch (rErr) {
      console.error("Referral bonus failed:", rErr);
    }

    // Record affiliate conversion if cookie present
    try {
      const cookieHeader = req.headers.get("cookie") || "";
      const affMatch = cookieHeader.match(/aff_ref=([^;]+)/);
      if (affMatch) {
        const decoded = decodeURIComponent(affMatch[1]);
        try {
          const parsed = JSON.parse(decoded);
          if (parsed?.code) {
            await supabase.rpc("record_affiliate_conversion", {
              p_affiliate_code: parsed.code,
              p_order_id: data.order_id,
              p_click_id: parsed.click_id ?? null,
            });
          }
        } catch {
          // cookie wasn't JSON; ignore
        }
      }
    } catch (aErr) {
      console.error("Affiliate conversion failed:", aErr);
    }

    // Fire-and-forget: send order confirmation email
    if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.startsWith("re_placeholder")) {
      // Fetch actual order items with product names and prices from DB
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("product_name, quantity, unit_price")
        .eq("order_id", data.order_id);

      import("@/lib/email").then(({ sendOrderConfirmation }) => {
        sendOrderConfirmation({
          orderId: data.order_id,
          email,
          items: (orderItems ?? []).map((oi) => ({
            name: oi.product_name,
            quantity: oi.quantity,
            price: oi.unit_price,
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

  // ─── Subscription lifecycle events ──────────────────
  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted" ||
    event.type === "invoice.paid" ||
    event.type === "invoice.payment_failed"
  ) {
    const supabase = createAdminSupabaseClient();
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const obj = event.data.object as any;
      const stripeSubId = obj.subscription || obj.id;
      if (!stripeSubId || typeof stripeSubId !== "string") {
        return NextResponse.json({ received: true });
      }

      const sub = await stripe.subscriptions.retrieve(stripeSubId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sa = sub as any;
      const periodStart = new Date(sa.current_period_start * 1000).toISOString();
      const periodEnd = new Date(sa.current_period_end * 1000).toISOString();
      const cancelledAt = sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null;

      // ── Membership branch (Pet+ subscription) ──
      if (sub.metadata?.type === "membership") {
        const membershipUpdates: Record<string, unknown> = {
          status: sub.status,
          current_period_start: periodStart,
          current_period_end: periodEnd,
          trial_end: sa.trial_end ? new Date(sa.trial_end * 1000).toISOString() : null,
          cancel_at_period_end: sub.cancel_at_period_end,
          cancelled_at: cancelledAt,
        };
        if (event.type === "customer.subscription.deleted") {
          membershipUpdates.status = "cancelled";
        }
        await supabase
          .from("memberships")
          .update(membershipUpdates)
          .eq("stripe_subscription_id", stripeSubId);

        return NextResponse.json({ received: true, type: "membership_synced" });
      }

      // ── Product subscription branch (existing logic) ──
      const updates: Record<string, unknown> = {
        status: sub.status,
        current_period_start: periodStart,
        current_period_end: periodEnd,
        next_billing_date: periodEnd,
        cancel_at_period_end: sub.cancel_at_period_end,
        cancelled_at: cancelledAt,
      };

      const { data: dbSub } = await supabase
        .from("subscriptions")
        .update(updates)
        .eq("stripe_subscription_id", stripeSubId)
        .select("id, total_billed_count")
        .maybeSingle();

      // Increment billed count + log event on successful invoice
      if (event.type === "invoice.paid" && dbSub) {
        await supabase
          .from("subscriptions")
          .update({ total_billed_count: (dbSub.total_billed_count ?? 0) + 1 })
          .eq("id", dbSub.id);

        await supabase.from("subscription_events").insert({
          subscription_id: dbSub.id,
          event_type: "renewed",
          amount_usd: (obj.amount_paid ?? 0) / 100,
        });
      } else if (event.type === "invoice.payment_failed" && dbSub) {
        await supabase.from("subscription_events").insert({
          subscription_id: dbSub.id,
          event_type: "payment_failed",
        });
      } else if (event.type === "customer.subscription.deleted" && dbSub) {
        await supabase
          .from("subscriptions")
          .update({ status: "cancelled" })
          .eq("id", dbSub.id);
      }
    } catch (err) {
      console.error("subscription webhook error:", err);
    }
  }

  return NextResponse.json({ received: true });
}
