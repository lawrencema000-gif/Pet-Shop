import type { MetadataRoute } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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

  // Info pages
  const infoPages = ["/about", "/faq", "/contact"];
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

  return [...staticPages, ...productPages, ...categoryPages];
}
