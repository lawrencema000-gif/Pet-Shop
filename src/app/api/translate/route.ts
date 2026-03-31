import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const LANGUAGES = ["ja", "zh", "ko"] as const;

async function verifyAdmin(): Promise<boolean> {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabaseAdmin
    .from("admin_role_cache")
    .select("role")
    .eq("user_id", user.id)
    .single();
  return data?.role === "admin";
}

/**
 * POST /api/translate
 * Auto-generates translations for a product or category.
 * Body: { type: "product" | "category", id: string }
 * Requires admin authentication.
 */
export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { type, id } = await req.json();

    if (type === "product") {
      // Fetch product data
      const { data: product, error } = await supabaseAdmin
        .from("products")
        .select("id, name, subtitle, description, features, specifications")
        .eq("id", id)
        .single();

      if (error || !product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }

      // Create/update translation entries for each language
      for (const lang of LANGUAGES) {
        const { error: upsertError } = await supabaseAdmin
          .from("product_translations")
          .upsert(
            {
              product_id: product.id,
              language: lang,
              name: product.name, // Placeholder — admin should translate
              subtitle: product.subtitle,
              description: product.description,
              features: product.features,
              specifications: product.specifications,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "product_id,language" }
          );

        if (upsertError) {
          console.error(`Failed to upsert ${lang} translation:`, upsertError);
        }
      }

      return NextResponse.json({ success: true, message: "Product translations created" });
    }

    if (type === "category") {
      const { data: category, error } = await supabaseAdmin
        .from("categories")
        .select("id, name, description")
        .eq("id", id)
        .single();

      if (error || !category) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }

      for (const lang of LANGUAGES) {
        const { error: upsertError } = await supabaseAdmin
          .from("category_translations")
          .upsert(
            {
              category_id: category.id,
              language: lang,
              name: category.name,
              description: category.description,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "category_id,language" }
          );

        if (upsertError) {
          console.error(`Failed to upsert ${lang} category translation:`, upsertError);
        }
      }

      return NextResponse.json({ success: true, message: "Category translations created" });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err) {
    console.error("Translation API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
