import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-server";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
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
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
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

    for (const item of items) {
      if (!item.product_id || item.quantity < 1 || !Number.isInteger(item.quantity)) {
        return NextResponse.json({ error: "Invalid item in cart" }, { status: 400 });
      }
    }

    const supabase = createServerSupabaseClient();
    const adminSupabase = createAdminSupabaseClient();

    // Get authenticated user (optional — guest checkout allowed)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Build Stripe line items
    const lineItems: { price: string; quantity: number }[] = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      let stripePriceId: string | null = null;
      let unitPrice = 0;

      if (item.variant_id) {
        const { data: variant } = await adminSupabase
          .from("product_variants")
          .select("stripe_price_id, price")
          .eq("id", item.variant_id)
          .single();

        stripePriceId = variant?.stripe_price_id ?? null;
        unitPrice = variant?.price ?? 0;
      }

      if (!stripePriceId) {
        // Fallback: look up product's Stripe product and find/create a price
        const { data: product } = await adminSupabase
          .from("products")
          .select("stripe_product_id, base_price")
          .eq("id", item.product_id)
          .single();

        if (!product?.stripe_product_id) {
          return NextResponse.json(
            { error: "Product not configured for payment. Please contact support." },
            { status: 400 }
          );
        }

        unitPrice = unitPrice || product.base_price;
        const priceCents = Math.round(unitPrice * 100);

        // Find an active price matching this amount
        const prices = await stripe.prices.list({
          product: product.stripe_product_id,
          active: true,
          limit: 10,
        });
        const match = prices.data.find((p) => p.unit_amount === priceCents);

        if (match) {
          stripePriceId = match.id;
        } else {
          // Create a price on the fly
          const newPrice = await stripe.prices.create({
            product: product.stripe_product_id,
            unit_amount: priceCents,
            currency: "usd",
            metadata: { variant_id: item.variant_id || "base", auto_created: "true" },
          });
          stripePriceId = newPrice.id;

          // Store it back if it's a variant
          if (item.variant_id) {
            await adminSupabase
              .from("product_variants")
              .update({ stripe_price_id: newPrice.id })
              .eq("id", item.variant_id);
          }
        }
      }

      lineItems.push({ price: stripePriceId!, quantity: item.quantity });
      calculatedSubtotal += unitPrice * item.quantity;
    }

    // Handle coupon
    let stripeDiscounts: { coupon: string }[] = [];
    if (coupon_code) {
      const { data: coupon } = await adminSupabase
        .from("coupons")
        .select("*")
        .eq("code", coupon_code)
        .eq("is_active", true)
        .single();

      if (coupon) {
        const now = new Date();
        const notExpired = !coupon.expires_at || new Date(coupon.expires_at) > now;
        const notMaxed = !coupon.max_uses || coupon.current_uses < coupon.max_uses;
        const meetsMin = !coupon.min_order_amount || calculatedSubtotal >= coupon.min_order_amount;

        if (notExpired && notMaxed && meetsMin) {
          let discountCents: number;

          if (coupon.discount_type === "percentage") {
            discountCents = Math.round(calculatedSubtotal * (coupon.discount_value / 100) * 100);
          } else {
            // Cap fixed discount at subtotal (can't discount more than order value)
            discountCents = Math.round(Math.min(coupon.discount_value, calculatedSubtotal) * 100);
          }

          // Create a one-time Stripe coupon
          const stripeCoupon = await stripe.coupons.create({
            amount_off: discountCents,
            currency: "usd",
            duration: "once",
            name: coupon_code,
          });

          stripeDiscounts = [{ coupon: stripeCoupon.id }];
        }
      }
    }

    // Shipping options
    const freeShipping = calculatedSubtotal >= FREE_SHIPPING_THRESHOLD;
    const shippingCostCents = freeShipping ? 0 : Math.round(SHIPPING_COST * 100);

    // Create a Stripe tax rate
    let taxRateId: string | undefined;
    const existingRates = await stripe.taxRates.list({ active: true, limit: 10 });
    const existing8 = existingRates.data.find(
      (r) => r.percentage === TAX_RATE * 100 && r.display_name === "Sales Tax"
    );
    if (existing8) {
      taxRateId = existing8.id;
    } else {
      const newRate = await stripe.taxRates.create({
        display_name: "Sales Tax",
        percentage: TAX_RATE * 100,
        inclusive: false,
      });
      taxRateId = newRate.id;
    }

    // Store checkout data in pending_checkouts (avoids 500-char metadata limit)
    const { data: pendingCheckout, error: pendingError } = await adminSupabase
      .from("pending_checkouts")
      .insert({
        items,
        email,
        user_id: user?.id ?? null,
        shipping_address,
        coupon_code: coupon_code ?? null,
        idempotency_key: idempotency_key ?? null,
      })
      .select("id")
      .single();

    if (pendingError) {
      console.error("Failed to create pending checkout:", pendingError);
      return NextResponse.json({ error: "Checkout initialization failed" }, { status: 500 });
    }

    // Create Stripe Checkout Session
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pet-shop-lac-ten.vercel.app";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems.map((li) => ({
        price: li.price,
        quantity: li.quantity,
        tax_rates: taxRateId ? [taxRateId] : undefined,
      })),
      ...(stripeDiscounts.length > 0 ? { discounts: stripeDiscounts } : {}),
      customer_email: email,
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: shippingCostCents, currency: "usd" },
            display_name: freeShipping ? "Free Shipping" : "Standard Shipping",
          },
        },
      ],
      metadata: {
        pending_checkout_id: pendingCheckout.id,
      },
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
