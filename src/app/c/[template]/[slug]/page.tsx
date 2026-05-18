import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import ArticleSchema from "@/components/seo/ArticleSchema";
import FAQSchema from "@/components/seo/FAQSchema";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

const BASE_URL = "https://www.petandangel.com";

const TEMPLATE_LABEL: Record<string, string> = {
  best: "Best Of",
  "buying-guide": "Buying Guide",
  compare: "Comparison",
  "gift-guide": "Gift Guide",
  "how-to": "How-To",
  under: "Under Budget",
  tools: "Tools",
};

interface PageProps {
  params: { template: string; slug: string };
}

export const revalidate = 3600; // 1h

async function loadPage(template: string, slug: string) {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("seo_pages")
    .select(
      "id, template, slug, h1, meta_title, meta_description, body_html, hero_image_url, og_image, author_slug, target_keywords, product_slugs, faq_schema, related_slugs, cluster, published_at, updated_at",
    )
    .eq("template", template)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return data;
}

async function loadAuthor(slug: string | null) {
  if (!slug) return null;
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("seo_authors")
    .select("slug, name, headshot_url, bio, twitter_url, linkedin_url")
    .eq("slug", slug)
    .maybeSingle();
  return data;
}

async function loadProducts(slugs: string[]) {
  if (!slugs?.length) return [];
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("products")
    .select(
      "id, slug, name, subtitle, base_price, compare_at_price, rating_average, rating_count, images:product_images(url, alt_text, display_order)",
    )
    .in("slug", slugs)
    .eq("status", "active");
  if (!data) return [];
  // Preserve admin's chosen order
  return slugs.map((s) => data.find((p) => p.slug === s)).filter(Boolean) as typeof data;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = await loadPage(params.template, params.slug);
  if (!page) return { title: "Not Found" };
  const url = `${BASE_URL}/c/${params.template}/${params.slug}`;
  return {
    title: page.meta_title || page.h1,
    description: page.meta_description,
    alternates: { canonical: url },
    openGraph: {
      title: page.meta_title || page.h1,
      description: page.meta_description,
      url,
      type: "article",
      images: page.og_image ? [{ url: page.og_image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: page.meta_title || page.h1,
      description: page.meta_description,
      images: page.og_image ? [page.og_image] : undefined,
    },
  };
}

export async function generateStaticParams() {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("seo_pages")
    .select("template, slug")
    .eq("status", "published");
  return (data ?? []).map((r) => ({ template: r.template, slug: r.slug }));
}

export default async function SEOLandingPage({ params }: PageProps) {
  const page = await loadPage(params.template, params.slug);
  if (!page) notFound();

  const [author, products] = await Promise.all([
    loadAuthor(page.author_slug),
    loadProducts(page.product_slugs ?? []),
  ]);

  const url = `${BASE_URL}/c/${params.template}/${params.slug}`;
  const templateLabel = TEMPLATE_LABEL[params.template] ?? params.template;
  const faqs = Array.isArray(page.faq_schema) ? (page.faq_schema as { question: string; answer: string }[]) : [];
  const updatedAt = page.updated_at ?? page.published_at ?? new Date().toISOString();

  return (
    <div className="container-main pb-20">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: BASE_URL },
          { name: templateLabel, url: `${BASE_URL}/c/${params.template}` },
          { name: page.h1, url },
        ]}
      />
      <ArticleSchema
        title={page.h1}
        description={page.meta_description}
        author={author?.name ?? "Pet and Angels Team"}
        datePublished={page.published_at ?? updatedAt}
        dateModified={updatedAt}
        image={page.og_image ?? page.hero_image_url ?? undefined}
        url={url}
      />
      {faqs.length > 0 && <FAQSchema faqs={faqs} />}

      <Breadcrumb items={[{ label: templateLabel, href: `/c/${params.template}` }, { label: page.h1 }]} />

      {/* Hero */}
      <header className="max-w-3xl mb-8">
        <p className="eyebrow text-bark-500 uppercase tracking-widest text-xs font-semibold mb-2">
          {templateLabel}
        </p>
        <h1 className="font-display text-3xl md:text-5xl font-bold text-bark-900 leading-tight mb-3">
          {page.h1}
        </h1>
        <p className="text-base text-muted leading-relaxed">{page.meta_description}</p>

        {author && (
          <div className="mt-5 flex items-center gap-3 pb-5 border-b border-border">
            {author.headshot_url && (
              <Image
                src={author.headshot_url}
                alt={author.name}
                width={40}
                height={40}
                className="rounded-full"
              />
            )}
            <div>
              <p className="text-sm font-medium text-foreground">By {author.name}</p>
              <p className="text-xs text-muted">
                Updated {new Date(updatedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
        )}
      </header>

      {/* Hero image */}
      {page.hero_image_url && (
        <div className="relative aspect-[16/7] w-full mb-8 rounded-2xl overflow-hidden bg-sand-100">
          <Image src={page.hero_image_url} alt={page.h1} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 1024px" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Article body */}
        <article
          className="lg:col-span-2 prose prose-bark max-w-none prose-headings:font-display prose-headings:text-bark-900 prose-a:text-moss-600 prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: page.body_html }}
        />

        {/* Sidebar: featured products */}
        {products.length > 0 && (
          <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
            <h2 className="font-display text-lg font-bold text-bark-900 mb-3">Our picks</h2>
            {products.map((p, idx) => {
              const img = p.images?.sort(
                (a, b) => a.display_order - b.display_order,
              )?.[0]?.url || "/images/placeholder.jpg";
              return (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className="block bg-white border border-border rounded-xl p-3 hover:border-moss-300 transition-colors"
                >
                  <div className="flex gap-3">
                    <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-sand-50">
                      <Image src={img} alt={p.name} fill className="object-cover" sizes="64px" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-bark-500 mb-0.5">#{idx + 1}</p>
                      <p className="text-sm font-medium text-foreground line-clamp-2 leading-tight">{p.name}</p>
                      <p className="text-sm font-bold text-moss-700 mt-1">${Number(p.base_price).toFixed(2)}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </aside>
        )}
      </div>

      {/* FAQ rendered for humans (also in schema above) */}
      {faqs.length > 0 && (
        <section className="mt-16 max-w-3xl">
          <h2 className="font-display text-2xl font-bold text-bark-900 mb-5">Frequently asked questions</h2>
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <details key={i} className="group bg-white border border-border rounded-xl">
                <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between font-medium text-sm text-foreground">
                  {f.question}
                  <span className="text-muted transition-transform group-open:rotate-45 text-lg leading-none">+</span>
                </summary>
                <div className="px-5 pb-4 text-sm text-muted leading-relaxed">{f.answer}</div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* Related cluster pages */}
      {page.related_slugs && page.related_slugs.length > 0 && (
        <RelatedCluster currentSlug={params.slug} relatedSlugs={page.related_slugs} cluster={page.cluster ?? null} />
      )}
    </div>
  );
}

async function RelatedCluster({
  currentSlug,
  relatedSlugs,
  cluster,
}: {
  currentSlug: string;
  relatedSlugs: string[];
  cluster: string | null;
}) {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("seo_pages")
    .select("template, slug, h1, meta_description")
    .in("slug", relatedSlugs.filter((s) => s !== currentSlug))
    .eq("status", "published")
    .limit(6);

  if (!data?.length) return null;

  return (
    <section className="mt-16 max-w-4xl">
      <h2 className="font-display text-2xl font-bold text-bark-900 mb-5">
        {cluster ? `More in ${cluster}` : "Keep reading"}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.map((p) => (
          <Link
            key={`${p.template}-${p.slug}`}
            href={`/c/${p.template}/${p.slug}`}
            className="block bg-white border border-border rounded-xl p-4 hover:border-moss-300 transition-colors"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-bark-500 mb-1">
              {TEMPLATE_LABEL[p.template] ?? p.template}
            </p>
            <p className="font-medium text-foreground line-clamp-2 leading-snug">{p.h1}</p>
            <p className="text-xs text-muted line-clamp-2 mt-1">{p.meta_description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
