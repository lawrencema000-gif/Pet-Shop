"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const LOCALE_MAP: Record<string, string> = {
  en: "en_US",
  ja: "ja_JP",
  zh: "zh_CN",
  ko: "ko_KR",
};

const SUPPORTED_LANGS = ["en", "ja", "zh", "ko"];

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface SeoHeadProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article" | "product";
  jsonLd?: Record<string, unknown>;
  breadcrumbs?: BreadcrumbItem[];
}

export function SeoHead({
  title,
  description,
  path = "",
  image,
  type = "website",
  jsonLd,
  breadcrumbs,
}: SeoHeadProps) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://www.petandangel.com";

  useEffect(() => {
    // Set document title
    document.title = title;

    // Helper to set/create meta tags
    function setMeta(property: string, content: string, isName = false) {
      const attr = isName ? "name" : "property";
      let el = document.querySelector(`meta[${attr}="${property}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, property);
        document.head.appendChild(el);
      }
      el.content = content;
    }

    // Basic meta
    setMeta("description", description, true);

    // Open Graph
    setMeta("og:title", title);
    setMeta("og:description", description);
    setMeta("og:type", type);
    setMeta("og:url", `${baseUrl}${path}`);
    setMeta("og:locale", LOCALE_MAP[currentLang] || "ja_JP");
    if (image) setMeta("og:image", image);

    // Twitter Card
    setMeta("twitter:card", "summary_large_image", true);
    setMeta("twitter:title", title, true);
    setMeta("twitter:description", description, true);
    if (image) setMeta("twitter:image", image, true);

    // Hreflang alternate links
    const hreflangLinks: HTMLLinkElement[] = [];

    SUPPORTED_LANGS.forEach((lang) => {
      const link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = lang;
      link.href = `${baseUrl}${path}`;
      document.head.appendChild(link);
      hreflangLinks.push(link);
    });

    // x-default
    const xDefault = document.createElement("link");
    xDefault.rel = "alternate";
    xDefault.hreflang = "x-default";
    xDefault.href = `${baseUrl}${path}`;
    document.head.appendChild(xDefault);
    hreflangLinks.push(xDefault);

    // JSON-LD structured data
    const jsonLdScripts: HTMLScriptElement[] = [];

    if (jsonLd) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
      jsonLdScripts.push(script);
    }

    if (breadcrumbs && breadcrumbs.length > 0) {
      const breadcrumbLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: `${baseUrl}${item.url}`,
        })),
      };
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(breadcrumbLd);
      document.head.appendChild(script);
      jsonLdScripts.push(script);
    }

    // OG locale alternates
    const ogLocaleLinks: HTMLMetaElement[] = [];
    SUPPORTED_LANGS.filter((l) => l !== currentLang).forEach((lang) => {
      const meta = document.createElement("meta");
      meta.setAttribute("property", "og:locale:alternate");
      meta.content = LOCALE_MAP[lang] || lang;
      document.head.appendChild(meta);
      ogLocaleLinks.push(meta);
    });

    // Cleanup
    return () => {
      hreflangLinks.forEach((el) => el.remove());
      jsonLdScripts.forEach((el) => el.remove());
      ogLocaleLinks.forEach((el) => el.remove());
    };
  }, [title, description, path, image, type, currentLang, baseUrl, jsonLd, breadcrumbs]);

  return null;
}
