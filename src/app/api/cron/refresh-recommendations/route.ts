import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-server";

/**
 * Daily refresh of the product_copurchases materialized view that powers
 * "Customers also bought". Cheap (a single GROUP BY against order_items)
 * and CONCURRENTLY-safe so it doesn't block reads.
 */
export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Cron not configured" }, { status: 503 });
  }
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminSupabaseClient();
  const { error } = await supabase.rpc("refresh_product_copurchases");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ refreshed: true, at: new Date().toISOString() });
}
