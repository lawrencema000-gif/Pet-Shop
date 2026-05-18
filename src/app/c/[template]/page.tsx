import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

const TEMPLATE_LABEL: Record<string, string> = {
  best: "Best Of",
  "buying-guide": "Buying Guides",
  compare: "Comparisons",
  "gift-guide": "Gift Guides",
  "how-to": "How-To Guides",
  under: "Under Budget",
  tools: "Tools",
};

const TEMPLATE_DESC: Record<string, string> = {
  best: "Honest, hands-on round-ups of the best pet products we've tested.",
  "buying-guide": "Everything to know before you buy — features, fit, price ranges.",
  compare: "Side-by-side product comparisons to help you pick the right one.",
  "gift-guide": "Curated gift ideas for pets and the people who love them.",
  "how-to": "Step-by-step guides to help you and your pet thrive together.",
  under: "Great pet gear that won't break the bank.",
  tools: "Free calculators, finders, and tools for pet parents.",
};

export const revalidate = 3600;

interface PageProps { params: { template: string } }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const label = TEMPLATE_LABEL[params.template];
  if (!label) return { title: "Not Found" };
  const description = TEMPLATE_DESC[params.template];
  return {
    title: `${label} | Pet and Angels`,
    description,
    alternates: { canonical: `https://www.petandangel.com/c/${params.template}` },
  };
}

export default async function SEOTemplateIndex({ params }: PageProps) {
  const label = TEMPLATE_LABEL[params.template];
  if (!label) notFound();

  const supabase = createServerSupabaseClient();
  const { data: pages } = await supabase
    .from("seo_pages")
    .select("template, slug, h1, meta_description, hero_image_url, cluster, published_at")
    .eq("template", params.template)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  return (
    <div className="container-main pb-20">
      <Breadcrumb items={[{ label }]} />
      <header className="max-w-2xl mb-10">
        <p className="eyebrow text-bark-500 uppercase tracking-widest text-xs font-semibold mb-2">Resources</p>
        <h1 className="font-display text-3xl md:text-5xl font-bold text-bark-900 leading-tight mb-3">{label}</h1>
        <p className="text-base text-muted leading-relaxed">{TEMPLATE_DESC[params.template]}</p>
      </header>

      {(!pages || pages.length === 0) ? (
        <p className="text-muted">No articles yet — check back soon.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pages.map((p) => (
            <Link
              key={`${p.template}-${p.slug}`}
              href={`/c/${p.template}/${p.slug}`}
              className="group block bg-white border border-border rounded-2xl overflow-hidden hover:border-moss-300 hover:shadow-sm transition-all"
            >
              {p.hero_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.hero_image_url} alt={p.h1} className="w-full aspect-[16/10] object-cover" />
              ) : (
                <div className="w-full aspect-[16/10] bg-gradient-to-br from-sand-100 to-moss-50" />
              )}
              <div className="p-5">
                {p.cluster && (
                  <p className="text-[10px] font-bold uppercase tracking-wider text-bark-500 mb-1">{p.cluster}</p>
                )}
                <h2 className="font-display text-lg font-bold text-bark-900 leading-snug mb-2 line-clamp-2 group-hover:text-moss-700 transition-colors">
                  {p.h1}
                </h2>
                <p className="text-sm text-muted line-clamp-3">{p.meta_description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
