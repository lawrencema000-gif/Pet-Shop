import type { MetadataRoute } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminSupabaseClient } from "@/lib/supabase/admin-server";

const BASE_URL = "https://www.petandangel.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerSupabaseClient();

  // Fetch product slugs
  const { data: products } = await supabase
    .from("products")
    .select("slug, updated_at")
    .eq("status", "active");

  // Fetch category slugs
  const { data: categories } = await supabase
    .from("categories")
    .select("slug, updated_at");

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // High-traffic pages
  const highTrafficPages = ["/blog", "/new-arrivals", "/sale", "/cats", "/dogs", "/bundles", "/gift-cards", "/guides"];
  for (const page of highTrafficPages) {
    staticPages.push({
      url: `${BASE_URL}${page}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    });
  }

  // Info pages
  const infoPages = ["/about", "/faq", "/contact", "/support", "/help-me-choose"];
  for (const page of infoPages) {
    staticPages.push({
      url: `${BASE_URL}${page}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    });
  }

  // Policy / utility pages
  const policyPages = [
    "/shipping",
    "/returns",
    "/warranty",
    "/track-order",
    "/privacy",
    "/terms",
    "/accessibility",
  ];
  for (const page of policyPages) {
    staticPages.push({
      url: `${BASE_URL}${page}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    });
  }

  // Auth pages
  const authPages = ["/auth/login", "/auth/signup"];
  for (const page of authPages) {
    staticPages.push({
      url: `${BASE_URL}${page}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    });
  }

  // Product pages
  const productPages: MetadataRoute.Sitemap = (products || []).map(
    (product) => ({
      url: `${BASE_URL}/products/${product.slug}`,
      lastModified: product.updated_at
        ? new Date(product.updated_at)
        : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })
  );

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = (categories || []).map(
    (category) => ({
      url: `${BASE_URL}/categories/${category.slug}`,
      lastModified: category.updated_at
        ? new Date(category.updated_at)
        : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })
  );

  // Blog posts
  const adminSupabase = createAdminSupabaseClient();
  const { data: blogPosts } = await adminSupabase
    .from("blog_posts")
    .select("slug, updated_at, published_at")
    .eq("status", "published");

  const blogPages: MetadataRoute.Sitemap = (blogPosts || []).map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.updated_at ? new Date(post.updated_at) : new Date(post.published_at),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Programmatic SEO landing pages (/c/[template]/[slug])
  const { data: seoPages } = await supabase
    .from("seo_pages")
    .select("template, slug, updated_at, published_at")
    .eq("status", "published");

  const seoPagesUrls: MetadataRoute.Sitemap = (seoPages || []).map((p) => ({
    url: `${BASE_URL}/c/${p.template}/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(p.published_at ?? Date.now()),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Template index pages (/c/[template])
  const seoTemplates = ["best", "buying-guide", "compare", "gift-guide", "how-to", "under", "tools"];
  const seoTemplateUrls: MetadataRoute.Sitemap = seoTemplates.map((t) => ({
    url: `${BASE_URL}/c/${t}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...productPages,
    ...categoryPages,
    ...blogPages,
    ...seoTemplateUrls,
    ...seoPagesUrls,
  ];
}
