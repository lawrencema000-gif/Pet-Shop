import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { ShippingAddress } from "@/types/order";

import { SHIPPING_COST, FREE_SHIPPING_THRESHOLD, TAX_RATE } from "@/lib/constants";

interface CheckoutItem {
  product_id: string;
  variant_id: string | null;
  quantity: number;
}

interface CheckoutBody {
  items: CheckoutItem[];
  email: string;
  shipping_address: ShippingAddress;
  coupon_code?: string;
  idempotency_key?: string;
}

export async function POST(request: Request) {
  try {
    const body: CheckoutBody = await request.json();
    const { items, email, shipping_address, coupon_code, idempotency_key } = body;

    // Basic validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    if (
      !shipping_address ||
      !shipping_address.line1 ||
      !shipping_address.city ||
      !shipping_address.state ||
      !shipping_address.zip ||
      !shipping_address.country
    ) {
      return NextResponse.json(
        { error: "Complete shipping address is required" },
        { status: 400 }
      );
    }

    // Validate quantities client-side too
    for (const item of items) {
      if (!item.product_id || item.quantity < 1 || !Number.isInteger(item.quantity)) {
        return NextResponse.json(
          { error: "Invalid item in cart" },
          { status: 400 }
        );
      }
    }

    const supabase = createServerSupabaseClient();

    // Get authenticated user (optional — guest checkout allowed)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Call the atomic checkout function — handles stock validation,
    // order creation, items insertion, stock decrement, and coupon usage
    // all in a single database transaction.
    const { data, error } = await supabase.rpc("process_checkout", {
      p_user_id: user?.id ?? null,
      p_email: email,
      p_items: items.map((item) => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
      })),
      p_shipping_address: shipping_address,
      p_coupon_code: coupon_code ?? null,
      p_idempotency_key: idempotency_key ?? null,
      p_shipping_cost: SHIPPING_COST,
      p_tax_rate: TAX_RATE,
      p_free_shipping_threshold: FREE_SHIPPING_THRESHOLD,
    });

    if (error) {
      console.error("Checkout error:", error);
      // Parse user-friendly messages from RAISE EXCEPTION
      const msg = error.message || "Failed to process order";
      const isUserError = msg.includes("Insufficient stock") ||
        msg.includes("not found") ||
        msg.includes("unavailable");
      return NextResponse.json(
        { error: msg },
        { status: isUserError ? 400 : 500 }
      );
    }

    return NextResponse.json({
      order_id: data.order_id,
      subtotal: data.subtotal,
      discount_amount: data.discount_amount,
      shipping_amount: data.shipping_amount,
      tax_amount: data.tax_amount,
      total: data.total,
      duplicate: data.duplicate ?? false,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
