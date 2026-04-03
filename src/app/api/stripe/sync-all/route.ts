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

export async function POST() {
  try {
    // Auth check: admin only
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const supabase = createAdminSupabaseClient();

    // Fetch all active products with variants
    const { data: products, error } = await supabase
      .from("products")
      .select("*, product_variants(*), product_images(url)")
      .eq("status", "active");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const results: { id: string; name: string; success: boolean; error?: string }[] = [];

    for (const product of products ?? []) {
      try {
        const imageUrl = product.product_images?.[0]?.url;
        let stripeProductId = product.stripe_product_id;

        if (stripeProductId) {
          await stripe.products.update(stripeProductId, {
            name: product.name,
            description: product.description || undefined,
            images: imageUrl ? [imageUrl] : undefined,
            metadata: { supabase_id: product.id, slug: product.slug },
          });
        } else {
          const sp = await stripe.products.create({
            name: product.name,
            description: product.description || undefined,
            images: imageUrl ? [imageUrl] : [],
            metadata: { supabase_id: product.id, slug: product.slug },
          });
          stripeProductId = sp.id;
          await supabase.from("products").update({ stripe_product_id: stripeProductId }).eq("id", product.id);
        }

        const variants = product.product_variants ?? [];
        for (const v of variants) {
          if (!v.stripe_price_id) {
            const newPrice = await stripe.prices.create({
              product: stripeProductId!,
              unit_amount: Math.round(v.price * 100),
              currency: "usd",
              metadata: { variant_id: v.id, variant_name: v.name },
            });
            await supabase.from("product_variants").update({ stripe_price_id: newPrice.id }).eq("id", v.id);
          }
        }

        if (variants.length === 0) {
          const prices = await stripe.prices.list({ product: stripeProductId!, active: true, limit: 1 });
          if (prices.data.length === 0) {
            await stripe.prices.create({
              product: stripeProductId!,
              unit_amount: Math.round(product.base_price * 100),
              currency: "usd",
              metadata: { type: "base_price" },
            });
          }
        }

        results.push({ id: product.id, name: product.name, success: true });
      } catch (err) {
        results.push({ id: product.id, name: product.name, success: false, error: String(err) });
      }
    }

    return NextResponse.json({
      total: products?.length ?? 0,
      synced: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      errors: results.filter((r) => !r.success),
    });
  } catch (err) {
    console.error("Sync all error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sync failed" },
      { status: 500 }
    );
  }
}
