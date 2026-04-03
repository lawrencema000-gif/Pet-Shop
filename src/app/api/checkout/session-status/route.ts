import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-server";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  // Validate session_id format (Stripe checkout sessions start with cs_)
  if (!sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "Invalid session_id" }, { status: 400 });
  }

  const supabase = createAdminSupabaseClient();

  // Look up order by stripe_checkout_session_id
  const { data: order } = await supabase
    .from("orders")
    .select("id, email, total, subtotal, shipping_amount, tax_amount, discount_amount, payment_status, status, shipping_address, created_at, items:order_items(product_name, variant_name, quantity, unit_price, total_price)")
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle();

  if (order) {
    return NextResponse.json({ order, pending: false });
  }

  // Webhook may not have fired yet — check Stripe session
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return NextResponse.json({
      pending: true,
      payment_status: session.payment_status,
      email: session.customer_email,
    });
  } catch {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
}
