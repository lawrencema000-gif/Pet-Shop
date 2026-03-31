import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * DELETE /api/account
 * Deletes the authenticated user's account and all associated data.
 * Cascading deletes handle orders, addresses, reviews, etc.
 */
export async function DELETE() {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete profile (cascades to addresses, pets, wishlists, saved_for_later, notifications)
    await supabaseAdmin.from("profiles").delete().eq("id", user.id);

    // Delete the auth user
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Account deletion error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/account/export
 * Exports all personal data for GDPR compliance.
 */
export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all user data in parallel
    const [profile, addresses, orders, reviews, pets, wishlists, notifications] = await Promise.all([
      supabaseAdmin.from("profiles").select("*").eq("id", user.id).single(),
      supabaseAdmin.from("addresses").select("*").eq("user_id", user.id),
      supabaseAdmin.from("orders").select("*, items:order_items(*)").eq("user_id", user.id),
      supabaseAdmin.from("reviews").select("*").eq("user_id", user.id),
      supabaseAdmin.from("pets").select("*").eq("user_id", user.id),
      supabaseAdmin.from("wishlists").select("*, product:products(name, slug)").eq("user_id", user.id),
      supabaseAdmin.from("notifications").select("*").eq("user_id", user.id),
    ]);

    const exportData = {
      exported_at: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
      profile: profile.data,
      addresses: addresses.data || [],
      orders: orders.data || [],
      reviews: reviews.data || [],
      pets: pets.data || [],
      wishlists: wishlists.data || [],
      notifications: notifications.data || [],
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="pet-and-angels-data-export-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (err) {
    console.error("Data export error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
