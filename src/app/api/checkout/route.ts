import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { ShippingAddress } from "@/types/order";

const SHIPPING_COST = 5.99;
const FREE_SHIPPING_THRESHOLD = 75;
const TAX_RATE = 0.08;

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
}

export async function POST(request: Request) {
  try {
    const body: CheckoutBody = await request.json();
    const { items, email, shipping_address, coupon_code } = body;

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

    const supabase = createServerSupabaseClient();

    // Get authenticated user (optional — guest checkout allowed)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Validate products exist and collect prices
    const productIds = Array.from(new Set(items.map((i) => i.product_id)));
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, base_price, status")
      .in("id", productIds);

    if (productsError) {
      return NextResponse.json(
        { error: "Failed to validate products" },
        { status: 500 }
      );
    }

    const productMap = new Map(
      (products ?? []).map((p) => [p.id, p])
    );

    // Validate variants if any
    const variantIds = items
      .map((i) => i.variant_id)
      .filter((id): id is string => id !== null);

    let variantMap = new Map<
      string,
      { id: string; product_id: string; name: string; price: number }
    >();

    if (variantIds.length > 0) {
      const { data: variants, error: variantsError } = await supabase
        .from("product_variants")
        .select("id, product_id, name, price")
        .in("id", variantIds);

      if (variantsError) {
        return NextResponse.json(
          { error: "Failed to validate variants" },
          { status: 500 }
        );
      }

      variantMap = new Map(
        (variants ?? []).map((v) => [v.id, v])
      );
    }

    // Build order items and calculate subtotal
    let subtotal = 0;
    const orderItems: Array<{
      product_id: string;
      variant_id: string | null;
      product_name: string;
      variant_name: string | null;
      quantity: number;
      unit_price: number;
      total_price: number;
    }> = [];

    for (const item of items) {
      const product = productMap.get(item.product_id);
      if (!product || product.status !== "active") {
        return NextResponse.json(
          { error: `Product not found or unavailable: ${item.product_id}` },
          { status: 400 }
        );
      }

      let unitPrice = product.base_price;
      let variantName: string | null = null;

      if (item.variant_id) {
        const variant = variantMap.get(item.variant_id);
        if (!variant || variant.product_id !== item.product_id) {
          return NextResponse.json(
            { error: `Variant not found: ${item.variant_id}` },
            { status: 400 }
          );
        }
        unitPrice = variant.price;
        variantName = variant.name;
      }

      if (item.quantity < 1 || !Number.isInteger(item.quantity)) {
        return NextResponse.json(
          { error: "Quantity must be a positive integer" },
          { status: 400 }
        );
      }

      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      orderItems.push({
        product_id: item.product_id,
        variant_id: item.variant_id,
        product_name: product.name,
        variant_name: variantName,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
      });
    }

    // Validate coupon code if provided
    let discountAmount = 0;
    if (coupon_code) {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", coupon_code.toUpperCase())
        .eq("is_active", true)
        .single();

      if (coupon) {
        const now = new Date().toISOString();
        const isValid =
          (!coupon.expires_at || coupon.expires_at >= now) &&
          (coupon.max_uses === null ||
            (coupon.current_uses ?? 0) < coupon.max_uses) &&
          (coupon.min_order_amount === null ||
            subtotal >= coupon.min_order_amount);

        if (isValid) {
          if (coupon.discount_type === "percentage") {
            discountAmount = subtotal * (coupon.discount_value / 100);
          } else {
            discountAmount = Math.min(coupon.discount_value, subtotal);
          }
          discountAmount = Math.round(discountAmount * 100) / 100;
        }
      }
    }

    // Calculate totals
    const discountedSubtotal = subtotal - discountAmount;
    const shippingAmount =
      discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const taxAmount =
      Math.round(discountedSubtotal * TAX_RATE * 100) / 100;
    const total =
      Math.round((discountedSubtotal + shippingAmount + taxAmount) * 100) /
      100;

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        email,
        status: "pending",
        subtotal,
        discount_amount: discountAmount,
        shipping_amount: shippingAmount,
        tax_amount: taxAmount,
        total,
        shipping_address,
        coupon_code: coupon_code?.toUpperCase() ?? null,
      })
      .select("id")
      .single();

    if (orderError) {
      console.error("Order insert error:", orderError);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    // Insert order items
    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(
        orderItems.map((item) => ({
          ...item,
          order_id: order.id,
        }))
      );

    if (itemsError) {
      console.error("Order items insert error:", itemsError);
      return NextResponse.json(
        { error: "Failed to create order items" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      order_id: order.id,
      subtotal,
      discount_amount: discountAmount,
      shipping_amount: shippingAmount,
      tax_amount: taxAmount,
      total,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
