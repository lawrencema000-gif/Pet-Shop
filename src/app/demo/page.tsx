import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/ui/e-commerce-product-detail";

export const metadata = {
  title: "Product Detail Demo | PETLIBRO",
};

export default async function DemoPage() {
  const supabase = createServerSupabaseClient();

  // Load the first active product with full relations
  const { data: product } = await supabase
    .from("products")
    .select("*, images:product_images(*), variants:product_variants(*), category:categories(*)")
    .eq("status", "active")
    .order("is_featured", { ascending: false })
    .limit(1)
    .single();

  if (!product) notFound();

  return <ProductDetail product={product} />;
}
