import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function verifyAdmin(): Promise<boolean> {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const adminSupabase = createAdminSupabaseClient();
  const { data } = await adminSupabase
    .from("admin_role_cache")
    .select("role")
    .eq("user_id", user.id)
    .single();
  return data?.role === "admin";
}

export async function POST(request: Request) {
  try {
    // Auth check: admin only
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { product_id } = await request.json();
    if (!product_id) {
      return NextResponse.json({ error: "product_id required" }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();

    // Fetch product + variants + primary image
    const [{ data: product }, { data: variants }, { data: images }] = await Promise.all([
      supabase.from("products").select("*").eq("id", product_id).single(),
      supabase.from("product_variants").select("*").eq("product_id", product_id),
      supabase.from("product_images").select("url").eq("product_id", product_id).eq("is_primary", true).limit(1),
    ]);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const imageUrl = images?.[0]?.url;

    // Create or update Stripe Product
    let stripeProductId = product.stripe_product_id;

    if (stripeProductId) {
      // Update existing
      await stripe.products.update(stripeProductId, {
        name: product.name,
        description: product.description || undefined,
        images: imageUrl ? [imageUrl] : undefined,
        metadata: { supabase_id: product.id, slug: product.slug },
      });
    } else {
      // Create new
      const stripeProduct = await stripe.products.create({
        name: product.name,
        description: product.description || undefined,
        images: imageUrl ? [imageUrl] : [],
        metadata: { supabase_id: product.id, slug: product.slug },
      });
      stripeProductId = stripeProduct.id;
      await supabase
        .from("products")
        .update({ stripe_product_id: stripeProductId })
        .eq("id", product.id);
    }

    // Sync prices for each variant
    const variantList = variants ?? [];
    for (const variant of variantList) {
      const priceInCents = Math.round(variant.price * 100);

      if (variant.stripe_price_id) {
        // Check if price changed — Stripe Prices are immutable, so archive + recreate
        const existingPrice = await stripe.prices.retrieve(variant.stripe_price_id);
        if (existingPrice.unit_amount !== priceInCents) {
          // Archive old price
          await stripe.prices.update(variant.stripe_price_id, { active: false });
          // Create new price
          const newPrice = await stripe.prices.create({
            product: stripeProductId!,
            unit_amount: priceInCents,
            currency: "hkd",
            metadata: { variant_id: variant.id, variant_name: variant.name },
          });
          await supabase
            .from("product_variants")
            .update({ stripe_price_id: newPrice.id })
            .eq("id", variant.id);
        } else {
          // Update metadata only
          await stripe.prices.update(variant.stripe_price_id, {
            metadata: { variant_id: variant.id, variant_name: variant.name },
          });
        }
      } else {
        // Create new price
        const newPrice = await stripe.prices.create({
          product: stripeProductId!,
          unit_amount: priceInCents,
          currency: "hkd",
          metadata: { variant_id: variant.id, variant_name: variant.name },
        });
        await supabase
          .from("product_variants")
          .update({ stripe_price_id: newPrice.id })
          .eq("id", variant.id);
      }
    }

    // If product has no variants, create a default price from base_price
    if (variantList.length === 0) {
      const basePriceCents = Math.round(product.base_price * 100);
      // Check if there's already a default price on the Stripe product
      const prices = await stripe.prices.list({ product: stripeProductId!, active: true, limit: 1 });
      if (prices.data.length === 0 || prices.data[0].unit_amount !== basePriceCents) {
        // Archive old prices
        for (const p of prices.data) {
          await stripe.prices.update(p.id, { active: false });
        }
        await stripe.prices.create({
          product: stripeProductId!,
          unit_amount: basePriceCents,
          currency: "hkd",
          metadata: { type: "base_price" },
        });
      }
    }

    return NextResponse.json({ success: true, stripe_product_id: stripeProductId });
  } catch (err) {
    console.error("Stripe sync error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sync failed" },
      { status: 500 }
    );
  }
}
