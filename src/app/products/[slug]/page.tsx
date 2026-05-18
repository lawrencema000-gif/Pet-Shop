import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import { EstimatedDelivery } from "@/components/product/EstimatedDelivery";
import ProductTabs from "@/components/product/ProductTabs";
import RelatedProducts from "@/components/product/RelatedProducts";
import RelatedBlogPosts from "@/components/product/RelatedBlogPosts";
import WhyChooseSection from "@/components/product/WhyChooseSection";
import TrackView from "@/components/product/TrackView";
import HowItWorks from "@/components/product/HowItWorks";
import BenefitsSection from "@/components/product/BenefitsSection";
import ProductFAQ from "@/components/product/ProductFAQ";
import ProductQA from "@/components/product/ProductQA";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import type { Review } from "@/types/product";

const ProductDetailClient = dynamic(
  () => import("@/components/product/ProductDetailClient"),
  { ssr: false }
);

const FrequentlyBoughtTogether = dynamic(
  () => import("@/components/product/FrequentlyBoughtTogether"),
  {
    loading: () => (
      <div className="mt-16 animate-pulse">
        <div className="h-8 w-64 bg-surface-light rounded mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 bg-surface-light rounded-xl" />
          ))}
        </div>
      </div>
    ),
  }
);

const RecentlyViewed = dynamic(
  () => import("@/components/product/RecentlyViewed"),
  { ssr: false }
);

interface ProductPageProps {
  params: { slug: string };
}

export const revalidate = 3600;

export async function generateStaticParams() {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("products")
    .select("slug")
    .eq("status", "active");
  return (data ?? []).map((p: { slug: string }) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const supabase = createServerSupabaseClient();
  const { data: product } = await supabase
    .from("products")
    .select("name, description, subtitle, base_price, compare_at_price, images:product_images(url), variants:product_variants(price, stock_quantity)")
    .eq("slug", params.slug)
    .eq("status", "active")
    .single();

  if (!product) return { title: "Product Not Found" };

  const price = (product.variants as { price: number }[])?.[0]?.price ?? product.base_price;
  const inStock = (product.variants as { stock_quantity: number }[])?.some((v) => v.stock_quantity > 0) !== false;
  const priceStr = `$${price.toFixed(2)}`;
  const stockStr = inStock ? "In Stock" : "Out of Stock";
  const baseDesc = product.subtitle || product.description?.replace(/<[^>]+>/g, "").slice(0, 100) || "";
  const description = `${baseDesc}${baseDesc ? " — " : ""}${priceStr}. ${stockStr}. Free shipping on $75+.`.slice(0, 155);
  const imageUrl = (product.images as { url: string }[])?.[0]?.url;

  return {
    title: product.name,
    description,
    alternates: {
      canonical: `https://www.petandangel.com/products/${params.slug}`,
    },
    openGraph: {
      title: product.name,
      description,
      type: "website",
      url: `https://www.petandangel.com/products/${params.slug}`,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: product.name }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const supabase = createServerSupabaseClient();

  // Fetch product with relations
  const { data: product } = await supabase
    .from("products")
    .select(
      "*, images:product_images(*), variants:product_variants(*), category:categories(*)"
    )
    .eq("slug", params.slug)
    .eq("status", "active")
    .single();

  if (!product) notFound();

  // Parallelize reviews + related products (both only depend on product)
  const [reviewsRes, relatedRes] = await Promise.all([
    supabase
      .from("reviews")
      .select("*, profiles(full_name)")
      .eq("product_id", product.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("products")
      .select("*, images:product_images(*), variants:product_variants(*), category:categories(*)")
      .eq("status", "active")
      .eq("category_id", product.category_id)
      .neq("id", product.id)
      .limit(8),
  ]);
  const reviews = reviewsRes.data;
  const relatedProducts = relatedRes.data;

  const defaultVariant =
    product.variants?.find(
      (v: { is_default: boolean }) => v.is_default
    ) || product.variants?.[0];
  const price = defaultVariant?.price ?? product.base_price;

  // JSON-LD structured data
  const currentYear = new Date().getFullYear();
  const stockStatus =
    defaultVariant?.stock_quantity > 0 || !defaultVariant?.stock_quantity
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock";

  const reviewEntries = (reviews ?? []).slice(0, 3).map((r: Review) => ({
    "@type": "Review",
    reviewRating: {
      "@type": "Rating",
      ratingValue: r.rating,
      bestRating: 5,
    },
    author: {
      "@type": "Person",
      name: r.profiles?.full_name || "Verified Buyer",
    },
    ...(r.title && { name: r.title }),
    ...(r.body && { reviewBody: r.body }),
    datePublished: r.created_at,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.subtitle,
    image: product.images?.[0]?.url,
    brand: {
      "@type": "Brand",
      name: "Pet and Angels",
    },
    ...(defaultVariant?.sku && { sku: defaultVariant.sku }),
    offers: {
      "@type": "Offer",
      price: price,
      priceCurrency: "USD",
      availability: stockStatus,
      priceValidUntil: `${currentYear}-12-31`,
      seller: {
        "@type": "Organization",
        name: "Pet and Angels",
      },
    },
    ...(product.rating_count > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating_avg,
        reviewCount: product.rating_count,
      },
    }),
    ...(reviewEntries.length > 0 && { review: reviewEntries }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            { "@type": "Question", name: `How do I set up ${product.name}?`, acceptedAnswer: { "@type": "Answer", text: "Setting up is quick and easy. Download the Pet and Angels app, follow the step-by-step guide, and you'll be ready in under 5 minutes." } },
            { "@type": "Question", name: "What warranty does this product have?", acceptedAnswer: { "@type": "Answer", text: "All Pet and Angels smart products come with a 1-year warranty covering manufacturing defects and hardware malfunctions." } },
            { "@type": "Question", name: "Is this product easy to clean?", acceptedAnswer: { "@type": "Answer", text: "Yes! All removable parts are dishwasher-safe and the unit can be disassembled without any tools." } },
            { "@type": "Question", name: "Can I control this with my phone?", acceptedAnswer: { "@type": "Answer", text: "Yes, the Pet and Angels app (iOS & Android) lets you control all features remotely, set schedules, receive notifications, and monitor usage." } },
          ],
        }) }}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://www.petandangel.com" },
          ...(product.category
            ? [
                {
                  name: product.category.name,
                  url: `https://www.petandangel.com/categories/${product.category.slug}`,
                },
              ]
            : []),
          {
            name: product.name,
            url: `https://www.petandangel.com/products/${product.slug}`,
          },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          {product.category && (
            <>
              <span className="text-border">/</span>
              <Link
                href={`/categories/${product.category.slug}`}
                className="hover:text-foreground transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span className="text-border">/</span>
          <span className="text-foreground font-medium line-clamp-1">
            {product.name}
          </span>
        </nav>

        {/* Product section: gallery + info */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Gallery */}
          <div className="flex-1 min-w-0">
            <ProductGallery images={product.images ?? []} />
          </div>

          {/* Product Info */}
          <div className="w-full lg:w-[440px] shrink-0 space-y-4">
            <ProductInfo product={product} />
            <EstimatedDelivery />
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-16">
          <ProductTabs
            product={product}
            reviews={(reviews as Review[]) ?? []}
          />
        </div>

        {/* How It Works */}
        <HowItWorks />

        {/* Benefits Section */}
        <BenefitsSection />

        {/* Frequently Bought Together */}
        <FrequentlyBoughtTogether
          productId={product.id}
          categoryId={product.category_id}
        />

        {/* Product FAQ */}
        <ProductFAQ productName={product.name} />

        {/* Questions & Answers */}
        <ProductQA productId={product.id} />

        {/* Why Choose This Product */}
        <WhyChooseSection />

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <RelatedProducts products={relatedProducts} />
        )}

        {/* Related Blog Posts (internal linking for SEO) */}
        <RelatedBlogPosts productName={product.name} categorySlug={product.category?.slug} />

        {/* Recently Viewed */}
        <RecentlyViewed />
      </div>

      {/* Track page view (recently viewed + Meta ViewContent) */}
      <TrackView
        slug={product.slug}
        productId={product.id}
        name={product.name}
        price={price}
      />

      {/* Sticky Add to Cart Bar */}
      <ProductDetailClient product={product} />
    </>
  );
}
