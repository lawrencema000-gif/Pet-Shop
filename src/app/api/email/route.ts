import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendOrderConfirmation, sendOrderShipped, sendContactFormEmail } from "@/lib/email";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type } = body;

    // Contact form — no auth required
    if (type === "contact") {
      const { name, email, subject, message } = body;
      if (!name || !email || !subject || !message) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
      }
      const result = await sendContactFormEmail({ name, email, subject, message });
      return NextResponse.json({ success: true, id: result.data?.id });
    }

    // All other types require admin auth
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.slice(7);
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin
    const { data: adminCheck } = await supabaseAdmin
      .from("admin_role_cache")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (adminCheck?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (type === "order_confirmation") {
      const { orderId } = body;
      if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

      // Fetch order data
      const { data: order } = await supabaseAdmin
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

      const { data: items } = await supabaseAdmin
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);

      // Get customer name
      let customerName: string | undefined;
      if (order.user_id) {
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("full_name")
          .eq("id", order.user_id)
          .single();
        customerName = profile?.full_name ?? undefined;
      }

      const result = await sendOrderConfirmation({
        orderId,
        email: order.email,
        customerName,
        items: (items ?? []).map((i: Record<string, unknown>) => ({
          name: i.product_name as string,
          variant: (i.variant_name as string) ?? undefined,
          quantity: i.quantity as number,
          price: i.unit_price as number,
        })),
        subtotal: Number(order.subtotal),
        shipping: Number(order.shipping_amount),
        tax: Number(order.tax_amount),
        discount: Number(order.discount_amount),
        total: Number(order.total),
        shippingAddress: order.shipping_address ?? undefined,
      });

      if (result.error) {
        return NextResponse.json({ error: result.error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, id: result.data?.id });
    }

    if (type === "order_shipped") {
      const { orderId } = body;
      if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

      const { data: order } = await supabaseAdmin
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

      let customerName: string | undefined;
      if (order.user_id) {
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("full_name")
          .eq("id", order.user_id)
          .single();
        customerName = profile?.full_name ?? undefined;
      }

      const result = await sendOrderShipped({
        orderId,
        email: order.email,
        customerName,
        carrier: order.carrier ?? undefined,
        trackingNumber: order.tracking_number ?? undefined,
        trackingUrl: order.tracking_url ?? undefined,
      });

      if (result.error) {
        return NextResponse.json({ error: result.error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, id: result.data?.id });
    }

    return NextResponse.json({ error: "Unknown email type" }, { status: 400 });
  } catch (err) {
    console.error("Email API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
