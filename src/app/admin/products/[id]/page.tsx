"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase/client";
import { logAdminAction } from "@/lib/audit-log";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { ProductImagesManager } from "@/components/admin/ProductImagesManager";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

interface ProductData {
  id: string;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  category_id: string | null;
  base_price: number;
  compare_at_price: number | null;
  status: string;
  is_featured: boolean;
  is_best_seller: boolean;
  is_new: boolean;
  meta_title: string | null;
  meta_description: string | null;
  features: string[] | null;
  specifications: Record<string, string> | null;
  weight_g: number | null;
  length_cm: number | null;
  width_cm: number | null;
  height_cm: number | null;
  barcode: string | null;
}

interface Variant {
  id: string;
  name: string;
  variant_type: string;
  price: number;
  compare_at_price: number | null;
  sku: string | null;
  stock_quantity: number;
  image_url: string | null;
  is_default: boolean;
}

export default function EditProductPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "variants" | "images">("details");
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }

  useEffect(() => {
    async function load() {
      const [{ data: prod }, { data: vars }, { data: cats }] = await Promise.all([
        supabase.from("products").select("*").eq("id", id).single(),
        supabase.from("product_variants").select("*").eq("product_id", id).order("is_default", { ascending: false }),
        supabase.from("categories").select("id, name").order("display_order"),
      ]);
      setProduct(prod);
      setVariants(vars ?? []);
      setCategories(cats ?? []);
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;
    setSaving(true);
    const { error } = await supabase.from("products").update({
      name: product.name,
      slug: product.slug,
      subtitle: product.subtitle,
      description: product.description,
      category_id: product.category_id,
      base_price: product.base_price,
      compare_at_price: product.compare_at_price,
      status: product.status,
      is_featured: product.is_featured,
      is_best_seller: product.is_best_seller,
      is_new: product.is_new,
      meta_title: product.meta_title,
      meta_description: product.meta_description,
      features: product.features,
      specifications: product.specifications,
      weight_g: product.weight_g,
      length_cm: product.length_cm,
      width_cm: product.width_cm,
      height_cm: product.height_cm,
      barcode: product.barcode,
    }).eq("id", id);

    if (error) alert(t("admin.products.editor.errorSaving", { error: error.message }));
    else {
      await logAdminAction("update_product", "product", id, { name: product.name });
      // Auto-sync to Stripe
      fetch("/api/stripe/sync-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: id }),
      }).catch((err) => console.error("Stripe sync failed:", err));
    }
    setSaving(false);
  }

  async function handleDeleteProduct() {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) { console.error("Delete product failed:", error.message); return; }
    await logAdminAction("delete_product", "product", id);
    router.push("/admin/products");
  }

  async function addVariant() {
    const { data, error } = await supabase.from("product_variants").insert({
      product_id: id,
      name: "New Variant",
      variant_type: "color",
      price: product?.base_price ?? 0,
      stock_quantity: 100,
      is_default: false,
    }).select().single();
    if (error) { console.error("Add variant failed:", error.message); return; }
    if (data) {
      setVariants((prev) => [...prev, data]);
      // Auto-sync to Stripe
      fetch("/api/stripe/sync-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: id }),
      }).catch((err) => console.error("Stripe sync failed:", err));
    }
  }

  async function updateVariant(vid: string, updates: Partial<Variant>) {
    const { error } = await supabase.from("product_variants").update(updates).eq("id", vid);
    if (error) { showToast("Failed to save variant: " + error.message); return; }
    setVariants((prev) => prev.map((v) => (v.id === vid ? { ...v, ...updates } : v)));
    showToast("Variant saved");
    // Auto-sync to Stripe if price changed
    if ("price" in updates) {
      fetch("/api/stripe/sync-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: id }),
      }).catch((err) => console.error("Stripe sync failed:", err));
    }
  }

  async function deleteVariant(vid: string) {
    if (!window.confirm("Delete this variant?")) return;
    const { error } = await supabase.from("product_variants").delete().eq("id", vid);
    if (error) { showToast("Failed to delete variant: " + error.message); return; }
    setVariants((prev) => prev.filter((v) => v.id !== vid));
    showToast("Variant deleted");
    // Sync to Stripe (will clean up orphaned prices)
    fetch("/api/stripe/sync-product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: id }),
    }).catch((err) => console.error("Stripe sync failed:", err));
  }


  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!product) {
    return <div className="text-center py-20"><p className="text-muted">{t("admin.products.editor.productNotFound")}</p></div>;
  }

  const tabs = [
    { key: "details", label: t("admin.products.editor.tabDetails") },
    { key: "variants", label: t("admin.products.editor.tabVariants", { count: variants.length }) },
    { key: "images", label: t("admin.products.editor.tabImages") },
  ] as const;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/products" className="p-2 hover:bg-surface rounded-md transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">{product.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={product.status} />
              <span className="text-xs text-muted">ID: {id.slice(0, 8)}</span>
            </div>
          </div>
        </div>
        <button onClick={() => setShowDelete(true)} className="p-2 hover:bg-sale/10 rounded-md transition-colors" title={t("admin.products.editor.deleteProduct")}>
          <Trash2 size={18} className="text-muted hover:text-sale" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Details Tab */}
      {activeTab === "details" && (
        <form onSubmit={handleSave} className="max-w-3xl space-y-5">
          <div className="bg-white border border-border rounded-lg p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t("admin.products.editor.labelName")}</label>
              <input type="text" value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t("admin.products.editor.labelSlug")}</label>
              <input type="text" value={product.slug} onChange={(e) => setProduct({ ...product, slug: e.target.value })} className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t("admin.products.editor.labelSubtitle")}</label>
              <input type="text" value={product.subtitle ?? ""} onChange={(e) => setProduct({ ...product, subtitle: e.target.value || null })} className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t("admin.products.editor.labelDescription")}</label>
              <RichTextEditor
                content={product.description ?? ""}
                onChange={(html) => setProduct({ ...product, description: html || null })}
              />
            </div>

            {/* Features (string array) */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Features</label>
              <div className="space-y-2">
                {(product.features ?? []).map((feat, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={feat}
                      onChange={(e) => {
                        const updated = [...(product.features ?? [])];
                        updated[i] = e.target.value;
                        setProduct({ ...product, features: updated });
                      }}
                      className="flex-1 px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
                      placeholder="e.g. HD Camera with Night Vision"
                    />
                    <button type="button" onClick={() => {
                      const updated = (product.features ?? []).filter((_, idx) => idx !== i);
                      setProduct({ ...product, features: updated.length ? updated : null });
                    }} className="p-2 text-muted hover:text-sale"><X size={14} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => setProduct({ ...product, features: [...(product.features ?? []), ""] })}
                  className="text-xs text-accent hover:underline flex items-center gap-1"><Plus size={12} /> Add Feature</button>
              </div>
            </div>

            {/* Specifications (key-value object) */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Specifications</label>
              <div className="space-y-2">
                {Object.entries(product.specifications ?? {}).map(([key, val], i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={key}
                      onChange={(e) => {
                        const entries = Object.entries(product.specifications ?? {});
                        entries[i] = [e.target.value, val];
                        setProduct({ ...product, specifications: Object.fromEntries(entries) });
                      }}
                      className="w-1/3 px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
                      placeholder="Key (e.g. Capacity)"
                    />
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => {
                        const specs = { ...(product.specifications ?? {}) };
                        specs[key] = e.target.value;
                        setProduct({ ...product, specifications: specs });
                      }}
                      className="flex-1 px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
                      placeholder="Value (e.g. 5L)"
                    />
                    <button type="button" onClick={() => {
                      const specs = { ...(product.specifications ?? {}) };
                      delete specs[key];
                      setProduct({ ...product, specifications: Object.keys(specs).length ? specs : null });
                    }} className="p-2 text-muted hover:text-sale"><X size={14} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => setProduct({ ...product, specifications: { ...(product.specifications ?? {}), "": "" } })}
                  className="text-xs text-accent hover:underline flex items-center gap-1"><Plus size={12} /> Add Specification</button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t("admin.products.editor.labelCategory")}</label>
              <select value={product.category_id ?? ""} onChange={(e) => setProduct({ ...product, category_id: e.target.value || null })} className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent">
                <option value="">{t("admin.products.editor.categoryNone")}</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{t("admin.products.editor.labelPrice")}</label>
                <input type="number" step="0.01" min="0.01" value={product.base_price} onChange={(e) => setProduct({ ...product, base_price: Math.max(0, parseFloat(e.target.value) || 0) })} className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">{t("admin.products.editor.labelCompareAtPrice")}</label>
                <input type="number" step="0.01" value={product.compare_at_price ?? ""} onChange={(e) => setProduct({ ...product, compare_at_price: e.target.value ? parseFloat(e.target.value) : null })} className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t("admin.products.editor.labelStatus")}</label>
              <select value={product.status} onChange={(e) => setProduct({ ...product, status: e.target.value })} className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent">
                <option value="draft">{t("admin.products.statusDraft")}</option>
                <option value="active">{t("admin.products.statusActive")}</option>
                <option value="archived">{t("admin.products.statusArchived")}</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-6">
              {([
                { key: "is_featured" as const, label: t("admin.products.editor.flagFeatured") },
                { key: "is_best_seller" as const, label: t("admin.products.editor.flagBestSeller") },
                { key: "is_new" as const, label: t("admin.products.editor.flagNew") },
              ]).map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={product[key]} onChange={(e) => setProduct({ ...product, [key]: e.target.checked })} className="rounded border-border" />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* Shipping & Physical */}
          <div className="bg-white border border-border rounded-lg p-6 space-y-5">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Shipping & Physical</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Weight (g)</label>
                <input type="number" min={0} value={product.weight_g ?? ""} onChange={(e) => setProduct({ ...product, weight_g: e.target.value ? Number(e.target.value) : null })} className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent" placeholder="e.g. 500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Length (cm)</label>
                <input type="number" min={0} step={0.1} value={product.length_cm ?? ""} onChange={(e) => setProduct({ ...product, length_cm: e.target.value ? Number(e.target.value) : null })} className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent" placeholder="e.g. 30" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Width (cm)</label>
                <input type="number" min={0} step={0.1} value={product.width_cm ?? ""} onChange={(e) => setProduct({ ...product, width_cm: e.target.value ? Number(e.target.value) : null })} className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent" placeholder="e.g. 20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Height (cm)</label>
                <input type="number" min={0} step={0.1} value={product.height_cm ?? ""} onChange={(e) => setProduct({ ...product, height_cm: e.target.value ? Number(e.target.value) : null })} className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent" placeholder="e.g. 15" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Barcode / UPC</label>
              <input type="text" value={product.barcode ?? ""} onChange={(e) => setProduct({ ...product, barcode: e.target.value || null })} className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent" placeholder="e.g. 012345678901" />
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white border border-border rounded-lg p-6 space-y-5">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">{t("admin.products.editor.seoTitle")}</h3>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t("admin.products.editor.labelMetaTitle")}</label>
              <input type="text" maxLength={70} value={product.meta_title ?? ""} onChange={(e) => setProduct({ ...product, meta_title: e.target.value || null })} className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent" placeholder={product.name} />
              <p className="text-xs text-muted mt-1">{t("admin.products.editor.metaTitleHint", { count: (product.meta_title ?? "").length })}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">{t("admin.products.editor.labelMetaDescription")}</label>
              <textarea maxLength={160} value={product.meta_description ?? ""} onChange={(e) => setProduct({ ...product, meta_description: e.target.value || null })} rows={3} className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent resize-none" placeholder={t("admin.products.editor.metaDescriptionPlaceholder")} />
              <p className="text-xs text-muted mt-1">{t("admin.products.editor.metaDescriptionHint", { count: (product.meta_description ?? "").length })}</p>
            </div>
            {/* Preview */}
            <div className="bg-surface/50 rounded-md p-4">
              <p className="text-xs font-semibold text-muted uppercase mb-2">{t("admin.products.editor.googlePreview")}</p>
              <p className="text-[#1a0dab] text-base font-medium truncate">{product.meta_title || product.name}</p>
              <p className="text-[#006621] text-xs truncate">petandangel.com/products/{product.slug}</p>
              <p className="text-xs text-[#545454] line-clamp-2 mt-0.5">{product.meta_description || product.description || t("admin.products.editor.noDescription")}</p>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2.5 text-sm font-medium rounded-md hover:bg-accent-dark transition-colors disabled:opacity-60">
              <Save size={16} />{saving ? t("admin.products.editor.saving") : t("admin.products.editor.saveChanges")}
            </button>
          </div>
        </form>
      )}

      {/* Variants Tab */}
      {activeTab === "variants" && (
        <div className="max-w-4xl">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted">{t("admin.products.editor.variantsCount", { count: variants.length })}</p>
            <button onClick={addVariant} className="inline-flex items-center gap-2 bg-accent text-white px-3 py-2 text-sm font-medium rounded-md hover:bg-accent-dark transition-colors">
              <Plus size={14} /> {t("admin.products.editor.addVariant")}
            </button>
          </div>
          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">{t("admin.products.editor.variantName")}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">{t("admin.products.editor.variantType")}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">{t("admin.products.editor.variantPrice")}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">{t("admin.products.editor.variantSku")}</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">{t("admin.products.editor.variantStock")}</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v) => (
                  <tr key={v.id} className="border-b border-border/50">
                    <td className="px-4 py-2">
                      <input type="text" value={v.name} onChange={(e) => updateVariant(v.id, { name: e.target.value })} className="w-full px-2 py-1.5 text-sm border border-border rounded focus:outline-none focus:border-accent" />
                    </td>
                    <td className="px-4 py-2">
                      <select value={v.variant_type} onChange={(e) => updateVariant(v.id, { variant_type: e.target.value })} className="px-2 py-1.5 text-sm border border-border rounded focus:outline-none focus:border-accent">
                        <option value="color">{t("admin.products.editor.variantTypeColor")}</option>
                        <option value="size">{t("admin.products.editor.variantTypeSize")}</option>
                        <option value="bundle">{t("admin.products.editor.variantTypeBundle")}</option>
                        <option value="style">{t("admin.products.editor.variantTypeStyle")}</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <input type="number" step="0.01" min="0.01" value={v.price} onChange={(e) => updateVariant(v.id, { price: Math.max(0, parseFloat(e.target.value) || 0) })} className="w-24 px-2 py-1.5 text-sm border border-border rounded focus:outline-none focus:border-accent" />
                    </td>
                    <td className="px-4 py-2">
                      <input type="text" value={v.sku ?? ""} onChange={(e) => updateVariant(v.id, { sku: e.target.value || null })} className="w-28 px-2 py-1.5 text-sm border border-border rounded focus:outline-none focus:border-accent" placeholder={t("admin.products.editor.skuPlaceholder")} />
                    </td>
                    <td className="px-4 py-2">
                      <input type="number" min="0" value={v.stock_quantity} onChange={(e) => updateVariant(v.id, { stock_quantity: Math.max(0, parseInt(e.target.value) || 0) })} className="w-20 px-2 py-1.5 text-sm border border-border rounded focus:outline-none focus:border-accent" />
                    </td>
                    <td className="px-4 py-2">
                      <button onClick={() => deleteVariant(v.id)} className="p-1 hover:bg-sale/10 rounded"><X size={14} className="text-muted hover:text-sale" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {variants.length === 0 && (
              <div className="py-8 text-center text-sm text-muted">{t("admin.products.editor.noVariants")}</div>
            )}
          </div>
        </div>
      )}

      {/* Images Tab */}
      {activeTab === "images" && (
        <div className="max-w-4xl">
          <ProductImagesManager productId={id} />
        </div>
      )}

      <ConfirmDialog
        isOpen={showDelete}
        title={t("admin.products.editor.deleteConfirmTitle")}
        message={t("admin.products.editor.deleteConfirmMessage")}
        confirmLabel={t("admin.products.deleteConfirmLabel")}
        variant="danger"
        onConfirm={handleDeleteProduct}
        onCancel={() => setShowDelete(false)}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium bg-foreground text-white animate-in fade-in duration-200">
          {toast}
        </div>
      )}
    </div>
  );
}
