"use client";

import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface TranslatedFields {
  name?: string;
  subtitle?: string;
  description?: string;
  features?: string[];
  specifications?: Record<string, string>;
}

interface CategoryTranslatedFields {
  name?: string;
  description?: string;
}

/**
 * Hook that returns translated product fields for the current language.
 * Falls back to the original product data if no translation exists.
 */
export function useTranslatedProduct<
  T extends { id: string; name: string; subtitle?: string | null; description?: string | null; features?: string[]; specifications?: Record<string, string> }
>(product: T | null): T | null {
  const { i18n } = useTranslation();
  const [translated, setTranslated] = useState<T | null>(product);
  const lang = i18n.language;

  useEffect(() => {
    if (!product) {
      setTranslated(null);
      return;
    }

    // If default language (en = original content language), no translation needed
    // Products are stored in English by default
    if (lang === "en") {
      setTranslated(product);
      return;
    }

    // supabase already imported at top level
    supabase
      .from("product_translations")
      .select("name, subtitle, description, features, specifications")
      .eq("product_id", product.id)
      .eq("language", lang)
      .single()
      .then(({ data }) => {
        if (data) {
          const t = data as TranslatedFields;
          setTranslated({
            ...product,
            name: t.name || product.name,
            subtitle: t.subtitle || product.subtitle,
            description: t.description || product.description,
            features: (t.features as string[]) || product.features,
            specifications: (t.specifications as Record<string, string>) || product.specifications,
          });
        } else {
          setTranslated(product);
        }
      });
  }, [product, lang]);

  return translated;
}

/**
 * Hook that returns translated fields for multiple products.
 */
export function useTranslatedProducts<
  T extends { id: string; name: string; subtitle?: string | null; description?: string | null }
>(products: T[]): T[] {
  const { i18n } = useTranslation();
  const [translated, setTranslated] = useState<T[]>(products);
  const lang = i18n.language;

  useEffect(() => {
    if (!products.length || lang === "en") {
      setTranslated(products);
      return;
    }

    // supabase already imported at top level
    const ids = products.map((p) => p.id);

    supabase
      .from("product_translations")
      .select("product_id, name, subtitle, description")
      .in("product_id", ids)
      .eq("language", lang)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const translationMap = new Map(
            data.map((t) => [t.product_id, t])
          );
          setTranslated(
            products.map((p) => {
              const t = translationMap.get(p.id);
              if (t) {
                return {
                  ...p,
                  name: t.name || p.name,
                  subtitle: t.subtitle || p.subtitle,
                  description: t.description || p.description,
                };
              }
              return p;
            })
          );
        } else {
          setTranslated(products);
        }
      });
  }, [products, lang]);

  return translated;
}

/**
 * Hook that returns translated category fields.
 */
export function useTranslatedCategory<
  T extends { id: string; name: string; description?: string | null }
>(category: T | null): T | null {
  const { i18n } = useTranslation();
  const [translated, setTranslated] = useState<T | null>(category);
  const lang = i18n.language;

  useEffect(() => {
    if (!category || lang === "en") {
      setTranslated(category);
      return;
    }

    // supabase already imported at top level
    supabase
      .from("category_translations")
      .select("name, description")
      .eq("category_id", category.id)
      .eq("language", lang)
      .single()
      .then(({ data }) => {
        if (data) {
          const t = data as CategoryTranslatedFields;
          setTranslated({
            ...category,
            name: t.name || category.name,
            description: t.description || category.description,
          });
        } else {
          setTranslated(category);
        }
      });
  }, [category, lang]);

  return translated;
}

/**
 * Hook that returns translated categories for a list.
 */
export function useTranslatedCategories<
  T extends { id: string; name: string; description?: string | null }
>(categories: T[]): T[] {
  const { i18n } = useTranslation();
  const [translated, setTranslated] = useState<T[]>(categories);
  const lang = i18n.language;

  useEffect(() => {
    if (!categories.length || lang === "en") {
      setTranslated(categories);
      return;
    }

    // supabase already imported at top level
    const ids = categories.map((c) => c.id);

    supabase
      .from("category_translations")
      .select("category_id, name, description")
      .in("category_id", ids)
      .eq("language", lang)
      .then(({ data }) => {
        if (data && data.length > 0) {
          const translationMap = new Map(
            data.map((t) => [t.category_id, t])
          );
          setTranslated(
            categories.map((c) => {
              const t = translationMap.get(c.id);
              if (t) {
                return {
                  ...c,
                  name: t.name || c.name,
                  description: t.description || c.description,
                };
              }
              return c;
            })
          );
        } else {
          setTranslated(categories);
        }
      });
  }, [categories, lang]);

  return translated;
}
