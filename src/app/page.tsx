import { createServerSupabaseClient } from "@/lib/supabase/server";
import HeroBanner from "@/components/home/HeroBanner";
import TrustStrip from "@/components/home/TrustStrip";
import ShopByPet from "@/components/home/ShopByPet";
import CategoryCards from "@/components/home/CategoryCards";
import BestSellers from "@/components/home/BestSellers";
import ProductShowcase from "@/components/home/ProductShowcase";
import BrandStory from "@/components/home/BrandStory";
import FeaturedBundles from "@/components/home/FeaturedBundles";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import HelpMeChooseWidget from "@/components/home/HelpMeChooseWidget";
import Testimonials from "@/components/home/Testimonials";
import FAQPreview from "@/components/home/FAQPreview";
import MediaMentions from "@/components/home/MediaMentions";
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

      <TrustStrip />

      <ShopByPet />

      <section className="container-main py-section">
        <CategoryCards categories={categories || []} />
      </section>

      <section className="container-main py-section">
        <BestSellers products={bestSellers || []} />
      </section>

      <ProductShowcase
        title="Smart Feeding Solutions"
        description="Take control of your pet's nutrition with our intelligent feeders. Schedule meals, monitor portions, and ensure your pet eats right — even when you're away."
        features={[
          "App-controlled feeding schedules",
          "Portion control & monitoring",
          "HD camera with night vision",
          "Multi-pet RFID recognition",
        ]}
        imageUrl="https://images.unsplash.com/photo-1450778869180-e77d3083dbb0?w=1200&h=800&fit=crop"
        href="/categories/pet-feeders"
        reversed={false}
      />

      <ProductShowcase
        title="Hydration, Reimagined"
        description="Keep your pets hydrated with our smart water fountains featuring real-time monitoring, ultra-quiet pumps, and stainless steel designs."
        features={[
          "Smart water consumption tracking",
          "5-stage filtration system",
          "Ultra-quiet pump (< 30dB)",
          "Dishwasher-safe stainless steel",
        ]}
        imageUrl="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&h=800&fit=crop"
        href="/categories/water-fountains"
        reversed={true}
      />

      <ProductShowcase
        title="The Future of Litter"
        description="Our Luma Smart Litter Box handles the dirty work automatically. Video Cloud AI monitors your cat's health while keeping your home fresh."
        features={[
          "Automatic self-cleaning",
          "Video Cloud AI health monitoring",
          "Whisper-quiet operation",
          "Supports up to 3 cats",
        ]}
        imageUrl="https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=1200&h=800&fit=crop"
        href="/categories/litter-boxes"
        reversed={false}
      />

      <BrandStory />

      <FeaturedBundles />

      <WhyChooseUs />

      <HelpMeChooseWidget />

      <section className="container-main py-section">
        <Testimonials />
      </section>

      <FAQPreview />

      <MediaMentions />

      <Newsletter />
    </>
  );
}
