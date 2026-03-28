import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-server";

export async function POST() {
  try {
    const supabase = createAdminSupabaseClient();

    // Fetch all active products
    const { data: products, error } = await supabase
      .from("products")
      .select("id")
      .eq("status", "active");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const results: { id: string; success: boolean; error?: string }[] = [];

    for (const product of products ?? []) {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://pet-shop-lac-ten.vercel.app";
        const res = await fetch(`${baseUrl}/api/stripe/sync-product`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: product.id }),
        });
        const data = await res.json();
        results.push({ id: product.id, success: res.ok, error: data.error });
      } catch (err) {
        results.push({ id: product.id, success: false, error: String(err) });
      }
    }

    const synced = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success);

    return NextResponse.json({
      total: products?.length ?? 0,
      synced,
      failed: failed.length,
      errors: failed,
    });
  } catch (err) {
    console.error("Sync all error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Sync failed" },
      { status: 500 }
    );
  }
}
