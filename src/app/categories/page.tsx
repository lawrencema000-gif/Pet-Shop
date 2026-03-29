"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase/client";
import { useTranslatedCategories } from "@/hooks/useTranslatedProduct";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
}

export default function CategoriesPage() {
  const { t } = useTranslation();
  const [rawCategories, setRawCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const categories = useTranslatedCategories(rawCategories);

  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .order("display_order")
      .then(({ data }) => {
        setRawCategories(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">
          {t("common.home")}
        </Link>
        <ChevronRight size={12} className="text-border" />
        <span className="text-foreground font-medium">{t("categories.heading")}</span>
      </nav>

      <div className="text-center mb-12">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
          {t("categories.heading")}
        </h1>
        <p className="text-muted mt-3 max-w-xl mx-auto">
          {t("categories.overline")}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] rounded-xl bg-surface animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted text-lg">{t("common.noResults")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group block relative overflow-hidden rounded-xl aspect-[4/3]"
            >
              <div className="absolute inset-0 bg-surface-light">
                {category.image_url && (
                  <Image
                    src={category.image_url}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h2 className="font-display text-xl md:text-2xl font-bold text-white mb-1">
                  {category.name}
                </h2>
                {category.description && (
                  <p className="text-white/60 text-sm mb-2 line-clamp-2">
                    {category.description}
                  </p>
                )}
                <span className="inline-flex items-center gap-2 text-white/70 text-sm group-hover:text-white transition-colors duration-300">
                  {t("common.explore")}
                  <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
