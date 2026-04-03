"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import { logAdminAction } from "@/lib/audit-log";
import { Save, ArrowLeft, Plus, X, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

interface QuickVariant {
  name: string;
  price: string;
  stock: string;
  sku: string;
}

export default function NewProductPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    subtitle: "",
    description: "",
    category_id: "",
    base_price: "",
    compare_at_price: "",
    status: "active",
    is_featured: false,
    is_best_seller: false,
    is_new: true,
    meta_title: "",
    meta_description: "",
  });
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [variants, setVariants] = useState<QuickVariant[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // Load categories on mount
  useEffect(() => {
    supabase.from("categories").select("id, name").order("display_order").then(({ data, error }) => {
      if (error) { console.error("Failed to load categories:", error.message); return; }
      setCategories(data ?? []);
    });
  }, []);

  function updateField(key: string, value: string | boolean) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "name" && !prev.slug) {
        next.slug = slugify(value as string);
      }
      return next;
    });
  }

  const [validationError, setValidationError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError("");
    if (!form.name.trim()) {
      setValidationError("Product name is required.");
      return;
    }
    if (!form.base_price || parseFloat(form.base_price) <= 0) {
      setValidationError("Base price must be greater than 0.");
      return;
    }
    setSaving(true);

    const { data, error } = await supabase
      .from("products")
      .insert({
        name: form.name,
        slug: form.slug || slugify(form.name),
        subtitle: form.subtitle || null,
        description: form.description || null,
        category_id: form.category_id || null,
        base_price: parseFloat(form.base_price),
        compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
        status: form.status,
        is_featured: form.is_featured,
        is_best_seller: form.is_best_seller,
        is_new: form.is_new,
        meta_title: form.meta_title || null,
        meta_description: form.meta_description || null,
      })
      .select("id")
      .single();

    if (error) {
      setValidationError(error.message);
      setSaving(false);
      return;
    }

    await logAdminAction("create_product", "product", data.id, { name: form.name });

    // Create variants if any
    if (variants.length > 0) {
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        await supabase.from("product_variants").insert({
          product_id: data.id,
          name: v.name || `Variant ${i + 1}`,
          variant_type: "style",
          price: parseFloat(v.price) || parseFloat(form.base_price),
          stock_quantity: parseInt(v.stock) || 100,
          sku: v.sku || null,
          is_default: i === 0,
        });
      }
    } else {
      // Create default variant
      await supabase.from("product_variants").insert({
        product_id: data.id,
        name: "Default",
        variant_type: "style",
        price: parseFloat(form.base_price),
        stock_quantity: 100,
        sku: null,
        is_default: true,
      });
    }

    // Create images if any URLs provided
    for (let i = 0; i < imageUrls.length; i++) {
      const url = imageUrls[i].trim();
      if (!url) continue;
      await supabase.from("product_images").insert({
        product_id: data.id,
        url,
        display_order: i,
        is_primary: i === 0,
      });
    }

    // Auto-sync to Stripe
    fetch("/api/stripe/sync-product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: data.id }),
    }).catch((err) => console.error("Stripe sync failed:", err));

    router.push(`/admin/products/${data.id}`);
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/products" className="p-2 hover:bg-surface rounded-md transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{t("admin.products.new.title")}</h1>
          <p className="text-sm text-muted mt-1">{t("admin.products.new.subtitle")}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="bg-white border border-border rounded-lg p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("admin.products.new.labelProductName")}</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
              className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent transition-colors"
              placeholder={t("admin.products.new.productNamePlaceholder")}
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("admin.products.new.labelSlug")}</label>
            <input
              type="text"
              value={form.slug}
              onChange={(e) => updateField("slug", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent transition-colors"
              placeholder={t("admin.products.new.slugPlaceholder")}
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("admin.products.new.labelSubtitle")}</label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => updateField("subtitle", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent transition-colors"
              placeholder={t("admin.products.new.subtitlePlaceholder")}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("admin.products.new.labelDescription")}</label>
            <RichTextEditor
              content={form.description}
              onChange={(html) => updateField("description", html)}
              placeholder={t("admin.products.new.descriptionPlaceholder")}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("admin.products.new.labelCategory")}</label>
            <select
              value={form.category_id}
              onChange={(e) => updateField("category_id", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent transition-colors"
            >
              <option value="">{t("admin.products.new.categoryPlaceholder")}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t("admin.products.new.labelPrice")}</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.base_price}
                onChange={(e) => updateField("base_price", e.target.value)}
                required
                className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent transition-colors"
                placeholder={t("admin.products.new.pricePlaceholder")}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t("admin.products.new.labelCompareAtPrice")}</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.compare_at_price}
                onChange={(e) => updateField("compare_at_price", e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent transition-colors"
                placeholder={t("admin.products.new.pricePlaceholder")}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("admin.products.new.labelStatus")}</label>
            <select
              value={form.status}
              onChange={(e) => updateField("status", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent transition-colors"
            >
              <option value="draft">{t("admin.products.new.statusDraft")}</option>
              <option value="active">{t("admin.products.new.statusActive")}</option>
              <option value="archived">{t("admin.products.new.statusArchived")}</option>
            </select>
          </div>

          {/* Flags */}
          <div className="flex flex-wrap gap-6">
            {[
              { key: "is_featured", label: t("admin.products.new.flagFeatured") },
              { key: "is_best_seller", label: t("admin.products.new.flagBestSeller") },
              { key: "is_new", label: t("admin.products.new.flagNewArrival") },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={form[key as keyof typeof form] as boolean}
                  onChange={(e) => updateField(key, e.target.checked)}
                  className="rounded border-border"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* SEO */}
        {/* Quick Variants */}
        <div className="bg-white border border-border rounded-lg p-6 space-y-4 mt-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Variants (Optional)</h3>
            <button type="button" onClick={() => setVariants([...variants, { name: "", price: form.base_price, stock: "100", sku: "" }])}
              className="text-xs text-accent hover:underline flex items-center gap-1"><Plus size={12} /> Add Variant</button>
          </div>
          {variants.length === 0 ? (
            <p className="text-xs text-muted">No variants — a default variant will be created automatically. Add variants for different colors, sizes, etc.</p>
          ) : (
            <div className="space-y-2">
              {variants.map((v, i) => (
                <div key={i} className="grid grid-cols-4 gap-2 items-end">
                  <input type="text" value={v.name} onChange={(e) => { const u = [...variants]; u[i].name = e.target.value; setVariants(u); }}
                    placeholder="Name (e.g. Red, Large)" className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent" />
                  <input type="number" value={v.price} onChange={(e) => { const u = [...variants]; u[i].price = e.target.value; setVariants(u); }}
                    placeholder="Price" step="0.01" min="0" className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent" />
                  <input type="number" value={v.stock} onChange={(e) => { const u = [...variants]; u[i].stock = e.target.value; setVariants(u); }}
                    placeholder="Stock" min="0" className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent" />
                  <div className="flex gap-1">
                    <input type="text" value={v.sku} onChange={(e) => { const u = [...variants]; u[i].sku = e.target.value; setVariants(u); }}
                      placeholder="SKU" className="flex-1 px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent" />
                    <button type="button" onClick={() => setVariants(variants.filter((_, idx) => idx !== i))} className="p-2 text-muted hover:text-sale"><X size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Images */}
        <div className="bg-white border border-border rounded-lg p-6 space-y-4 mt-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2"><ImageIcon size={14} /> Images (Optional)</h3>
            <button type="button" onClick={() => setImageUrls([...imageUrls, ""])}
              className="text-xs text-accent hover:underline flex items-center gap-1"><Plus size={12} /> Add Image URL</button>
          </div>
          <p className="text-xs text-muted">Paste image URLs here. You can upload files from the edit page after creation. First image will be the primary.</p>
          {imageUrls.map((url, i) => (
            <div key={i} className="flex gap-2">
              <input type="url" value={url} onChange={(e) => { const u = [...imageUrls]; u[i] = e.target.value; setImageUrls(u); }}
                placeholder="https://example.com/image.jpg" className="flex-1 px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent" />
              <button type="button" onClick={() => setImageUrls(imageUrls.filter((_, idx) => idx !== i))} className="p-2 text-muted hover:text-sale"><X size={14} /></button>
            </div>
          ))}
        </div>

        <div className="bg-white border border-border rounded-lg p-6 space-y-5 mt-5">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">{t("admin.products.new.seoTitle")}</h3>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("admin.products.new.labelMetaTitle")}</label>
            <input
              type="text"
              maxLength={70}
              value={form.meta_title}
              onChange={(e) => updateField("meta_title", e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent transition-colors"
              placeholder={t("admin.products.new.metaTitlePlaceholder")}
            />
            <p className="text-xs text-muted mt-1">{t("admin.products.new.metaTitleHint", { count: form.meta_title.length })}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">{t("admin.products.new.labelMetaDescription")}</label>
            <textarea
              maxLength={160}
              value={form.meta_description}
              onChange={(e) => updateField("meta_description", e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent transition-colors resize-none"
              placeholder={t("admin.products.new.metaDescriptionPlaceholder")}
            />
            <p className="text-xs text-muted mt-1">{t("admin.products.new.metaDescriptionHint", { count: form.meta_description.length })}</p>
          </div>
          {/* Preview */}
          <div className="bg-surface/50 rounded-md p-4">
            <p className="text-xs font-semibold text-muted uppercase mb-2">{t("admin.products.new.googlePreview")}</p>
            <p className="text-[#1a0dab] text-base font-medium truncate">{form.meta_title || form.name || t("admin.products.new.productNameFallback")}</p>
            <p className="text-[#006621] text-xs truncate">petandangel.com/products/{form.slug || t("admin.products.new.productSlugFallback")}</p>
            <p className="text-xs text-[#545454] line-clamp-2 mt-0.5">{form.meta_description || form.description || t("admin.products.new.noDescription")}</p>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <Link href="/admin/products" className="px-4 py-2.5 text-sm font-medium text-muted hover:text-foreground border border-border rounded-md hover:bg-surface transition-colors">
            {t("admin.products.new.cancelButton")}
          </Link>
          {validationError && (
            <div className="bg-sale/10 border border-sale/20 rounded-lg p-3 mb-4">
              <p className="text-sm text-sale">{validationError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2.5 text-sm font-medium rounded-md hover:bg-accent-dark transition-colors disabled:opacity-60"
          >
            <Save size={16} />
            {saving ? t("admin.products.new.creating") : t("admin.products.new.createButton")}
          </button>
        </div>
      </form>
    </div>
  );
}
