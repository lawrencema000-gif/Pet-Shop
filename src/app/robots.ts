import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/auth/callback", "/account/", "/cart", "/checkout"],
      },
    ],
    sitemap: "https://pet-shop-lac-ten.vercel.app/sitemap.xml",
  };
}
