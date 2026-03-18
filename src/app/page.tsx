import { createServerSupabaseClient } from "@/lib/supabase/server";
import HeroBanner from "@/components/home/HeroBanner";
import CategoryCards from "@/components/home/CategoryCards";
import BestSellers from "@/components/home/BestSellers";
import ProductSpotlight from "@/components/home/ProductSpotlight";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Testimonials from "@/components/home/Testimonials";
import Newsletter from "@/components/home/Newsletter";

export default async function Home() {
  const supabase = createServerSupabaseClient();

  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("*")
    .order("display_order");

  if (categoriesError) {
    console.error("Failed to fetch categories:", categoriesError.message);
  }

  const { data: bestSellers, error: bestSellersError } = await supabase
    .from("products")
    .select("*, images:product_images(*), variants:product_variants(*)")
    .eq("is_best_seller", true)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (bestSellersError) {
    console.error("Failed to fetch best sellers:", bestSellersError.message);
  }

  return (
    <>
      <HeroBanner />

      <section className="container-main py-16 md:py-24">
        <CategoryCards categories={categories || []} />
      </section>

      <section className="container-main py-16 md:py-24">
        <BestSellers products={bestSellers || []} />
      </section>

      <ProductSpotlight />

      <WhyChooseUs />

      <section className="container-main py-16 md:py-24">
        <Testimonials />
      </section>

      <Newsletter />
    </>
  );
}
