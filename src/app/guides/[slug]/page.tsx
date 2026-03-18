import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Clock, User } from "lucide-react";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getGuideBySlug, getAllGuideSlugs } from "@/lib/guides-data";
import ProductGrid from "@/components/product/ProductGrid";

interface GuidePageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAllGuideSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: GuidePageProps): Promise<Metadata> {
  const guide = getGuideBySlug(params.slug);
  if (!guide) return { title: "Guide Not Found | PETLIBRO" };
  return {
    title: `${guide.title} | PETLIBRO`,
    description: guide.description,
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const guide = getGuideBySlug(params.slug);
  if (!guide) notFound();

  // Fetch related products from matching category
  const supabase = createServerSupabaseClient();
  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", guide.categorySlug)
    .single();

  let relatedProducts = null;
  if (category) {
    const { data } = await supabase
      .from("products")
      .select(
        "*, images:product_images(*), variants:product_variants(*), category:categories(*)"
      )
      .eq("status", "active")
      .eq("category_id", category.id)
      .order("is_best_seller", { ascending: false })
      .limit(4);
    relatedProducts = data;
  }

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-surface-light">
        <nav className="container-main flex items-center gap-2 py-3 text-sm text-muted">
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link
            href="/guides"
            className="transition-colors hover:text-foreground"
          >
            Buying Guides
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground line-clamp-1">{guide.title}</span>
        </nav>
      </div>

      {/* Hero Image */}
      <div className="relative h-64 md:h-96 bg-surface">
        <Image
          src={guide.image}
          alt={guide.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 container-main pb-8 md:pb-12">
          <h1 className="text-3xl font-bold text-white md:text-5xl max-w-3xl">
            {guide.title}
          </h1>
          <div className="mt-4 flex items-center gap-4 text-sm text-white/80">
            <span className="inline-flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {guide.author}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {guide.readTime}
            </span>
          </div>
        </div>
      </div>

      {/* Guide Content */}
      <article className="container-main py-10 md:py-14">
        <div className="max-w-3xl mx-auto">
          <div
            className="prose-custom"
            dangerouslySetInnerHTML={{ __html: guide.content }}
          />
        </div>
      </article>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="border-t border-border bg-surface-light py-12 md:py-16">
          <div className="container-main">
            <h2 className="text-2xl font-bold text-foreground mb-8">
              Recommended Products
            </h2>
            <ProductGrid products={relatedProducts} />
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="border-t border-border py-12 md:py-16">
        <div className="container-main text-center">
          <h2 className="text-2xl font-bold text-foreground">
            Need more help deciding?
          </h2>
          <p className="mt-3 text-muted max-w-md mx-auto">
            Our interactive quiz will recommend the perfect products based on
            your pet, home, and lifestyle.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/help-me-choose"
              className="rounded-full bg-accent px-8 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Take the Quiz
            </Link>
            <Link
              href="/guides"
              className="rounded-full border border-border px-8 py-3 text-sm font-medium text-foreground transition-colors hover:bg-surface"
            >
              More Guides
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
