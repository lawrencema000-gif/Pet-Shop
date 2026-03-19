"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Plus, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { logAdminAction } from "@/lib/audit-log";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

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
  features: string[] | null;
  specifications: Record<string, string> | null;
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

interface ProductImage {
  id: string;
  url: string;
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
}

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "variants" | "images">("details");

  useEffect(() => {
    async function load() {
      const [{ data: prod }, { data: vars }, { data: imgs }, { data: cats }] = await Promise.all([
        supabase.from("products").select("*").eq("id", id).single(),
        supabase.from("product_variants").select("*").eq("product_id", id).order("is_default", { ascending: false }),
        supabase.from("product_images").select("*").eq("product_id", id).order("display_order"),
        supabase.from("categories").select("id, name").order("display_order"),
      ]);
      setProduct(prod);
      setVariants(vars ?? []);
      setImages(imgs ?? []);
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
    }).eq("id", id);

    if (error) alert("Error saving: " + error.message);
    else await logAdminAction("update_product", "product", id, { name: product.name });
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
    if (data) setVariants((prev) => [...prev, data]);
  }

  async function updateVariant(vid: string, updates: Partial<Variant>) {
    const { error } = await supabase.from("product_variants").update(updates).eq("id", vid);
    if (error) { console.error("Update variant failed:", error.message); return; }
    setVariants((prev) => prev.map((v) => (v.id === vid ? { ...v, ...updates } : v)));
  }

  async function deleteVariant(vid: string) {
    const { error } = await supabase.from("product_variants").delete().eq("id", vid);
    if (error) { console.error("Delete variant failed:", error.message); return; }
    setVariants((prev) => prev.filter((v) => v.id !== vid));
  }

  async function addImageUrl() {
    const url = prompt("Enter image URL:");
    if (!url) return;
    const { data, error } = await supabase.from("product_images").insert({
      product_id: id,
      url,
      display_order: images.length,
      is_primary: images.length === 0,
    }).select().single();
    if (error) { console.error("Add image failed:", error.message); return; }
    if (data) setImages((prev) => [...prev, data]);
  }

  async function deleteImage(imgId: string) {
    const { error } = await supabase.from("product_images").delete().eq("id", imgId);
    if (error) { console.error("Delete image failed:", error.message); return; }
    setImages((prev) => prev.filter((i) => i.id !== imgId));
  }

  async function setPrimaryImage(imgId: string) {
    const { error: e1 } = await supabase.from("product_images").update({ is_primary: false }).eq("product_id", id);
    if (e1) { console.error("Set primary image failed:", e1.message); return; }
    const { error: e2 } = await supabase.from("product_images").update({ is_primary: true }).eq("id", imgId);
    if (e2) { console.error("Set primary image failed:", e2.message); return; }
    setImages((prev) => prev.map((i) => ({ ...i, is_primary: i.id === imgId })));
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!product) {
    return <div className="text-center py-20"><p className="text-muted">Product not found</p></div>;
  }

  const tabs = [
    { key: "details", label: "Details" },
    { key: "variants", label: `Variants (${variants.length})` },
    { key: "images", label: `Images (${images.length})` },
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
        <button onClick={() => setShowDelete(true)} className="p-2 hover:bg-sale/10 rounded-md transition-colors" title="Delete product">
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
              <label className="block text-sm font-medium text-foreground mb-1.5">Name</label>
              <input type="text" value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Slug</label>
              <input type="text" value={product.slug} onChange={(e) => setProduct({ ...product, slug: e.target.value })} className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Subtitle</label>
              <input type="text" value={product.subtitle ?? ""} onChange={(e) => setProduct({ ...product, subtitle: e.target.value || null })} className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
              <textarea value={product.description ?? ""} onChange={(e) => setProduct({ ...product, description: e.target.value || null })} rows={4} className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent resize-y" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Category</label>
              <select value={product.category_id ?? ""} onChange={(e) => setProduct({ ...product, category_id: e.target.value || null })} className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent">
                <option value="">None</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Price</label>
                <input type="number" step="0.01" value={product.base_price} onChange={(e) => setProduct({ ...product, base_price: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Compare at Price</label>
                <input type="number" step="0.01" value={product.compare_at_price ?? ""} onChange={(e) => setProduct({ ...product, compare_at_price: e.target.value ? parseFloat(e.target.value) : null })} className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Status</label>
              <select value={product.status} onChange={(e) => setProduct({ ...product, status: e.target.value })} className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent">
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex flex-wrap gap-6">
              {(["is_featured", "is_best_seller", "is_new"] as const).map((key) => (
                <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={product[key]} onChange={(e) => setProduct({ ...product, [key]: e.target.checked })} className="rounded border-border" />
                  {key.replace("is_", "").replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2.5 text-sm font-medium rounded-md hover:bg-accent-dark transition-colors disabled:opacity-60">
              <Save size={16} />{saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      )}

      {/* Variants Tab */}
      {activeTab === "variants" && (
        <div className="max-w-4xl">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted">{variants.length} variants</p>
            <button onClick={addVariant} className="inline-flex items-center gap-2 bg-accent text-white px-3 py-2 text-sm font-medium rounded-md hover:bg-accent-dark transition-colors">
              <Plus size={14} /> Add Variant
            </button>
          </div>
          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Stock</th>
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
                        <option value="color">Color</option>
                        <option value="size">Size</option>
                        <option value="bundle">Bundle</option>
                        <option value="style">Style</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <input type="number" step="0.01" value={v.price} onChange={(e) => updateVariant(v.id, { price: parseFloat(e.target.value) || 0 })} className="w-24 px-2 py-1.5 text-sm border border-border rounded focus:outline-none focus:border-accent" />
                    </td>
                    <td className="px-4 py-2">
                      <input type="text" value={v.sku ?? ""} onChange={(e) => updateVariant(v.id, { sku: e.target.value || null })} className="w-28 px-2 py-1.5 text-sm border border-border rounded focus:outline-none focus:border-accent" placeholder="SKU" />
                    </td>
                    <td className="px-4 py-2">
                      <input type="number" value={v.stock_quantity} onChange={(e) => updateVariant(v.id, { stock_quantity: parseInt(e.target.value) || 0 })} className="w-20 px-2 py-1.5 text-sm border border-border rounded focus:outline-none focus:border-accent" />
                    </td>
                    <td className="px-4 py-2">
                      <button onClick={() => deleteVariant(v.id)} className="p-1 hover:bg-sale/10 rounded"><X size={14} className="text-muted hover:text-sale" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {variants.length === 0 && (
              <div className="py-8 text-center text-sm text-muted">No variants yet. Add one to get started.</div>
            )}
          </div>
        </div>
      )}

      {/* Images Tab */}
      {activeTab === "images" && (
        <div className="max-w-4xl">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted">{images.length} images</p>
            <button onClick={addImageUrl} className="inline-flex items-center gap-2 bg-accent text-white px-3 py-2 text-sm font-medium rounded-md hover:bg-accent-dark transition-colors">
              <Plus size={14} /> Add Image URL
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((img) => (
              <div key={img.id} className={`relative group border-2 rounded-lg overflow-hidden ${img.is_primary ? "border-accent" : "border-border"}`}>
                <img src={img.url} alt={img.alt_text ?? ""} className="w-full aspect-square object-cover" />
                {img.is_primary && (
                  <span className="absolute top-2 left-2 text-[10px] font-bold bg-accent text-white px-1.5 py-0.5 rounded">Primary</span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!img.is_primary && (
                    <button onClick={() => setPrimaryImage(img.id)} className="px-2 py-1 text-xs font-medium bg-white text-foreground rounded hover:bg-surface">Set Primary</button>
                  )}
                  <button onClick={() => deleteImage(img.id)} className="px-2 py-1 text-xs font-medium bg-sale text-white rounded hover:bg-sale/90">Delete</button>
                </div>
              </div>
            ))}
          </div>
          {images.length === 0 && (
            <div className="bg-white border border-border rounded-lg py-12 text-center text-sm text-muted">No images yet. Add an image URL to get started.</div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={showDelete}
        title="Delete Product"
        message="This will permanently delete this product and all its variants and images."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteProduct}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}
