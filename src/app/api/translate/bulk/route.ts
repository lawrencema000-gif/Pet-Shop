import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const LANGUAGES = ["ja", "zh", "ko"] as const;

/**
 * POST /api/translate/bulk
 * Creates translation entries for all products and categories that don't have them yet.
 * The entries contain the English text as placeholder — admin can edit translations later.
 */
export async function POST() {
  try {
    // Fetch all products
    const { data: products, error: pErr } = await supabaseAdmin
      .from("products")
      .select("id, name, subtitle, description, features, specifications")
      .eq("status", "active");

    if (pErr) throw pErr;

    let productCount = 0;
    for (const product of products || []) {
      for (const lang of LANGUAGES) {
        const { error } = await supabaseAdmin
          .from("product_translations")
          .upsert(
            {
              product_id: product.id,
              language: lang,
              name: product.name,
              subtitle: product.subtitle,
              description: product.description,
              features: product.features,
              specifications: product.specifications,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "product_id,language", ignoreDuplicates: true }
          );
        if (!error) productCount++;
      }
    }

    // Fetch all categories
    const { data: categories, error: cErr } = await supabaseAdmin
      .from("categories")
      .select("id, name, description");

    if (cErr) throw cErr;

    let categoryCount = 0;
    for (const category of categories || []) {
      for (const lang of LANGUAGES) {
        const { error } = await supabaseAdmin
          .from("category_translations")
          .upsert(
            {
              category_id: category.id,
              language: lang,
              name: category.name,
              description: category.description,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "category_id,language", ignoreDuplicates: true }
          );
        if (!error) categoryCount++;
      }
    }

    return NextResponse.json({
      success: true,
      productTranslations: productCount,
      categoryTranslations: categoryCount,
    });
  } catch (err) {
    console.error("Bulk translate error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
