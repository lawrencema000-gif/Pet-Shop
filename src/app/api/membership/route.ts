import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * Membership API.
 *
 * GET   — current user's membership (or null)
 * POST  — { action: "subscribe", plan_slug, success_url?, cancel_url? }
 *           returns Stripe Checkout URL
 *       — { action: "cancel" }   sets cancel_at_period_end
 *       — { action: "resume" }   clears cancel flag
 */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.petandangel.com";

export async function GET() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ membership: null });

  const { data } = await supabase
    .from("memberships")
    .select("*, plan:membership_plans(slug, name, price_usd, interval, features)")
    .eq("user_id", user.id)
    .maybeSingle();

  return NextResponse.json({ membership: data ?? null });
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit(`membership:${ip}`, 20, 60_000);
  if (!rl.success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const supabase = createServerSupabaseClient();
  const adminSupabase = createAdminSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { action } = body;

  // Get / create Stripe customer
  const { data: profile } = await adminSupabase
    .from("profiles")
    .select("stripe_customer_id, email, full_name")
    .eq("id", user.id)
    .maybeSingle();

  let customerId = profile?.stripe_customer_id as string | null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email || user.email || undefined,
      name: profile?.full_name || undefined,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await adminSupabase
      .from("profiles")
      .update({ stripe_customer_id: customer.id })
      .eq("id", user.id);
  }

  // ─── SUBSCRIBE ────────────────────────────────────────
  if (action === "subscribe") {
    const { plan_slug, success_url, cancel_url } = body;
    if (!plan_slug) return NextResponse.json({ error: "Missing plan_slug" }, { status: 400 });

    const { data: plan } = await adminSupabase
      .from("membership_plans")
      .select("*")
      .eq("slug", plan_slug)
      .eq("is_active", true)
      .single();
    if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

    // Block if already an active membership
    const { data: existing } = await adminSupabase
      .from("memberships")
      .select("id, status")
      .eq("user_id", user.id)
      .in("status", ["trialing", "active", "past_due"])
      .maybeSingle();
    if (existing) {
      return NextResponse.json(
        { error: "You already have an active membership. Cancel it first to switch plans." },
        { status: 400 },
      );
    }

    // Cache Stripe Product + Price on first checkout
    let priceId = plan.stripe_price_id;
    if (!priceId) {
      let productId = plan.stripe_product_id;
      if (!productId) {
        const stripeProduct = await stripe.products.create({
          name: plan.name,
          description: plan.description ?? undefined,
          metadata: { plan_slug: plan.slug },
        });
        productId = stripeProduct.id;
      }
      const stripePrice = await stripe.prices.create({
        currency: "usd",
        unit_amount: Math.round(plan.price_usd * 100),
        recurring: {
          interval: plan.interval as "month" | "year",
          interval_count: plan.interval_count || 1,
        },
        product: productId,
      });
      priceId = stripePrice.id;
      await adminSupabase
        .from("membership_plans")
        .update({ stripe_product_id: productId, stripe_price_id: priceId })
        .eq("id", plan.id);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: plan.trial_days || undefined,
        metadata: {
          type: "membership",
          supabase_user_id: user.id,
          plan_id: plan.id,
          plan_slug: plan.slug,
        },
      },
      success_url: success_url || `${SITE_URL}/account/membership?sub=success`,
      cancel_url: cancel_url || `${SITE_URL}/membership?sub=cancel`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    });

    return NextResponse.json({ url: session.url, session_id: session.id });
  }

  // ─── CANCEL ────────────────────────────────────────
  if (action === "cancel") {
    const { data: m } = await adminSupabase
      .from("memberships")
      .select("id, stripe_subscription_id")
      .eq("user_id", user.id)
      .single();
    if (!m) return NextResponse.json({ error: "No active membership" }, { status: 404 });
    if (m.stripe_subscription_id) {
      await stripe.subscriptions.update(m.stripe_subscription_id, { cancel_at_period_end: true });
    }
    await adminSupabase
      .from("memberships")
      .update({ cancel_at_period_end: true, cancelled_at: new Date().toISOString() })
      .eq("id", m.id);
    return NextResponse.json({ success: true });
  }

  // ─── RESUME ────────────────────────────────────────
  if (action === "resume") {
    const { data: m } = await adminSupabase
      .from("memberships")
      .select("id, stripe_subscription_id")
      .eq("user_id", user.id)
      .single();
    if (!m) return NextResponse.json({ error: "No active membership" }, { status: 404 });
    if (m.stripe_subscription_id) {
      await stripe.subscriptions.update(m.stripe_subscription_id, { cancel_at_period_end: false });
    }
    await adminSupabase
      .from("memberships")
      .update({ cancel_at_period_end: false, cancelled_at: null })
      .eq("id", m.id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
