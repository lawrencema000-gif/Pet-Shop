"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Trash2, GripVertical, Eye, EyeOff,
  X, Search, Package, Save,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { logAdminAction } from "@/lib/audit-log";
import { slugify } from "@/lib/utils";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

interface Collection {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  long_description: string | null;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
  product_count?: number;
}

interface ProductOption {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
}

interface CollectionProduct {
  id: string;
  product_id: string;
  name: string;
  slug: string;
  image_url: string | null;
}

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Collection | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null);

  // Product assignment
  const [collProducts, setCollProducts] = useState<CollectionProduct[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [productResults, setProductResults] = useState<ProductOption[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const loadCollections = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("collections")
      .select("*")
      .order("display_order");

    const items = (data ?? []) as Collection[];

    // Get product counts
    if (items.length > 0) {
      const { data: counts } = await supabase
        .from("collection_products")
        .select("collection_id");
      const countMap: Record<string, number> = {};
      counts?.forEach((c) => {
        countMap[c.collection_id] = (countMap[c.collection_id] ?? 0) + 1;
      });
      items.forEach((c) => { c.product_count = countMap[c.id] ?? 0; });
    }

    setCollections(items);
    setLoading(false);
  }, []);

  useEffect(() => { loadCollections(); }, [loadCollections]);

  async function loadCollectionProducts(collId: string) {
    const { data } = await supabase
      .from("collection_products")
      .select("id, product_id, product:products(name, slug, image_url:product_images(url))")
      .eq("collection_id", collId)
      .order("display_order");

    setCollProducts(
      (data ?? []).map((d) => {
        const prod = d.product as unknown as { name: string; slug: string; image_url: { url: string }[] | null };
        return {
          id: d.id,
          product_id: d.product_id,
          name: prod?.name ?? "Unknown",
          slug: prod?.slug ?? "",
          image_url: prod?.image_url?.[0]?.url ?? null,
        };
      })
    );
  }

  async function searchProducts(q: string) {
    setProductSearch(q);
    if (q.length < 2) { setProductResults([]); return; }
    setLoadingProducts(true);
    const { data } = await supabase
      .from("products")
      .select("id, name, slug, image_url:product_images(url)")
      .ilike("name", `%${q}%`)
      .eq("status", "active")
      .limit(10);

    setProductResults(
      (data ?? []).map((d) => {
        const imgs = d.image_url as unknown as { url: string }[] | null;
        return { id: d.id, name: d.name, slug: d.slug, image_url: imgs?.[0]?.url ?? null };
      })
    );
    setLoadingProducts(false);
  }

  async function addProduct(product: ProductOption) {
    if (!editing?.id || collProducts.some((p) => p.product_id === product.id)) return;
    const { data, error } = await supabase
      .from("collection_products")
      .insert({ collection_id: editing.id, product_id: product.id, display_order: collProducts.length })
      .select("id")
      .single();
    if (error) { console.error("Add product failed:", error.message); return; }
    setCollProducts([...collProducts, {
      id: data.id,
      product_id: product.id,
      name: product.name,
      slug: product.slug,
      image_url: product.image_url,
    }]);
    setProductSearch("");
    setProductResults([]);
  }

  async function removeProduct(cpId: string) {
    await supabase.from("collection_products").delete().eq("id", cpId);
    setCollProducts(collProducts.filter((p) => p.id !== cpId));
  }

  function startNew() {
    setEditing({
      id: "",
      slug: "",
      title: "",
      description: "",
      long_description: "",
      image_url: "",
      is_active: true,
      display_order: collections.length,
    });
    setIsNew(true);
    setCollProducts([]);
  }

  function startEdit(coll: Collection) {
    setEditing({ ...coll });
    setIsNew(false);
    loadCollectionProducts(coll.id);
  }

  async function handleSave() {
    if (!editing || !editing.title) return;
    setSaving(true);
    const payload = {
      slug: editing.slug || slugify(editing.title),
      title: editing.title,
      description: editing.description || null,
      long_description: editing.long_description || null,
      image_url: editing.image_url || null,
      is_active: editing.is_active,
      display_order: editing.display_order,
    };

    if (isNew) {
      const { data, error } = await supabase.from("collections").insert(payload).select("id").single();
      if (error) { alert("Error: " + error.message); setSaving(false); return; }
      await logAdminAction("create_collection", "collection", data.id, { title: editing.title });
    } else {
      const { error } = await supabase.from("collections").update(payload).eq("id", editing.id);
      if (error) { alert("Error: " + error.message); setSaving(false); return; }
      await logAdminAction("update_collection", "collection", editing.id, { title: editing.title });
    }

    setSaving(false);
    setEditing(null);
    loadCollections();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    const { error } = await supabase.from("collections").delete().eq("id", deleteTarget.id);
    if (error) { console.error("Delete failed:", error.message); return; }
    await logAdminAction("delete_collection", "collection", deleteTarget.id);
    setDeleteTarget(null);
    if (editing?.id === deleteTarget.id) setEditing(null);
    loadCollections();
  }

  async function toggleActive(coll: Collection) {
    const newVal = !coll.is_active;
    await supabase.from("collections").update({ is_active: newVal }).eq("id", coll.id);
    await logAdminAction(newVal ? "activate_collection" : "deactivate_collection", "collection", coll.id);
    loadCollections();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Collections</h1>
          <p className="text-sm text-muted mt-1">Curated product groupings for your store</p>
        </div>
        <button onClick={startNew} className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2.5 text-sm font-medium rounded-md hover:bg-accent-dark transition-colors">
          <Plus size={16} /> New Collection
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Collections List */}
        <div className="lg:col-span-1">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-border rounded-lg p-4">
                  <div className="h-4 w-32 bg-surface rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : collections.length === 0 ? (
            <div className="bg-white border border-border rounded-lg p-8 text-center">
              <Package size={32} className="mx-auto text-muted mb-3" />
              <p className="text-sm text-muted">No collections yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {collections.map((coll) => (
                <button
                  key={coll.id}
                  onClick={() => startEdit(coll)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                    editing?.id === coll.id
                      ? "border-accent bg-accent/5"
                      : "border-border bg-white hover:bg-surface/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GripVertical size={14} className="text-muted shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{coll.title}</p>
                        {!coll.is_active && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-surface text-muted">Hidden</span>
                        )}
                      </div>
                      <p className="text-xs text-muted">{coll.product_count ?? 0} products · /{coll.slug}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Edit Panel */}
        <div className="lg:col-span-2">
          {editing ? (
            <div className="bg-white border border-border rounded-lg">
              <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">
                  {isNew ? "New Collection" : "Edit Collection"}
                </h2>
                <div className="flex items-center gap-2">
                  {!isNew && (
                    <>
                      <button onClick={() => toggleActive(editing)} className="p-2 hover:bg-surface rounded-md" title={editing.is_active ? "Hide" : "Show"}>
                        {editing.is_active ? <EyeOff size={14} className="text-muted" /> : <Eye size={14} className="text-muted" />}
                      </button>
                      <button onClick={() => setDeleteTarget(editing)} className="p-2 hover:bg-sale/10 rounded-md" title="Delete">
                        <Trash2 size={14} className="text-muted hover:text-sale" />
                      </button>
                    </>
                  )}
                  <button onClick={() => setEditing(null)} className="p-2 hover:bg-surface rounded-md">
                    <X size={14} className="text-muted" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Title *</label>
                  <input
                    type="text"
                    value={editing.title}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: editing.slug || slugify(e.target.value) })}
                    className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
                    placeholder="e.g. Summer Essentials"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Slug</label>
                  <input
                    type="text"
                    value={editing.slug}
                    onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
                    placeholder="auto-generated"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Short Description</label>
                  <textarea
                    value={editing.description ?? ""}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent resize-none"
                    placeholder="Brief description for listings..."
                  />
                </div>

                {/* Long Description */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Long Description</label>
                  <textarea
                    value={editing.long_description ?? ""}
                    onChange={(e) => setEditing({ ...editing, long_description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent resize-y"
                    placeholder="Detailed description for the collection page..."
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Cover Image URL</label>
                  <input
                    type="url"
                    value={editing.image_url ?? ""}
                    onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
                    placeholder="https://..."
                  />
                </div>

                {/* Display Order */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Display Order</label>
                    <input
                      type="number"
                      min="0"
                      value={editing.display_order}
                      onChange={(e) => setEditing({ ...editing, display_order: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editing.is_active}
                        onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                        className="rounded border-border"
                      />
                      Active (visible to customers)
                    </label>
                  </div>
                </div>

                {/* Products (only for existing collections) */}
                {!isNew && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Products</label>

                    {/* Search to add */}
                    <div className="relative mb-3">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => searchProducts(e.target.value)}
                        placeholder="Search products to add..."
                        className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
                      />
                      {productResults.length > 0 && (
                        <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                          {productResults.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => addProduct(p)}
                              disabled={collProducts.some((cp) => cp.product_id === p.id)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-surface/50 flex items-center gap-2 disabled:opacity-40"
                            >
                              {p.image_url ? (
                                <img src={p.image_url} alt="" className="w-6 h-6 rounded object-cover" />
                              ) : (
                                <div className="w-6 h-6 rounded bg-surface" />
                              )}
                              <span>{p.name}</span>
                              {collProducts.some((cp) => cp.product_id === p.id) && (
                                <span className="ml-auto text-xs text-muted">Added</span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                      {loadingProducts && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />}
                    </div>

                    {/* Current products */}
                    {collProducts.length === 0 ? (
                      <p className="text-xs text-muted">No products assigned. Search above to add.</p>
                    ) : (
                      <div className="space-y-1">
                        {collProducts.map((cp) => (
                          <div key={cp.id} className="flex items-center gap-3 bg-surface/50 px-3 py-2 rounded-md">
                            {cp.image_url ? (
                              <img src={cp.image_url} alt="" className="w-8 h-8 rounded object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded bg-surface flex items-center justify-center">
                                <Package size={12} className="text-muted" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{cp.name}</p>
                              <p className="text-xs text-muted">/{cp.slug}</p>
                            </div>
                            <button onClick={() => removeProduct(cp.id)} className="p-1 hover:bg-sale/10 rounded">
                              <X size={12} className="text-muted hover:text-sale" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Save */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSave}
                    disabled={saving || !editing.title}
                    className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2.5 text-sm font-medium rounded-md hover:bg-accent-dark transition-colors disabled:opacity-60"
                  >
                    <Save size={16} /> {saving ? "Saving..." : isNew ? "Create Collection" : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-border rounded-lg p-12 text-center">
              <Package size={32} className="mx-auto text-muted mb-3" />
              <p className="text-sm text-muted">Select a collection to edit, or create a new one.</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Collection"
        message={`This will permanently delete "${deleteTarget?.title}" and remove all product assignments.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
