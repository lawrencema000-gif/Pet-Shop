"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Save, X, GripVertical, Shield } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { logAdminAction } from "@/lib/audit-log";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { useStaffPermissions } from "@/hooks/useStaffPermissions";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  parent_id: string | null;
}

export default function AdminCategoriesPage() {
  const { hasPermission, isSuperAdmin, loaded } = useStaffPermissions();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Category>>({});
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ name: "", slug: "", description: "", image_url: "" });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function load() {
    const { data } = await supabase.from("categories").select("*").order("display_order");
    setCategories(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate() {
    if (!newForm.name) return;
    const slug = newForm.slug || newForm.name.toLowerCase().replace(/\s+/g, "-");
    const { data, error } = await supabase.from("categories").insert({
      name: newForm.name,
      slug,
      description: newForm.description || null,
      image_url: newForm.image_url || null,
      display_order: categories.length,
    }).select().single();
    if (error) { console.error("Create category failed:", error.message); return; }
    if (data) {
      await logAdminAction("create_category", "category", data.id, { name: newForm.name });
      setShowNew(false);
      setNewForm({ name: "", slug: "", description: "", image_url: "" });
      load();
    }
  }

  async function handleUpdate() {
    if (!editId) return;
    const { error } = await supabase.from("categories").update(editForm).eq("id", editId);
    if (error) { console.error("Update category failed:", error.message); return; }
    await logAdminAction("update_category", "category", editId);
    setEditId(null);
    load();
  }

  async function handleDelete() {
    if (!deleteId) return;
    const { error } = await supabase.from("categories").delete().eq("id", deleteId);
    if (error) { console.error("Delete category failed:", error.message); return; }
    await logAdminAction("delete_category", "category", deleteId);
    setDeleteId(null);
    load();
  }

  if (loaded && !isSuperAdmin && !hasPermission("categories:write")) {
    return (
      <div className="text-center py-20">
        <Shield size={40} className="text-muted mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-foreground">Access Restricted</h2>
        <p className="text-sm text-muted mt-1">You don&apos;t have permission to manage categories.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Categories</h1>
          <p className="text-sm text-muted mt-1">{categories.length} categories</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2.5 text-sm font-medium rounded-md hover:bg-accent-dark transition-colors"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* New Category Form */}
      {showNew && (
        <div className="bg-white border border-border rounded-lg p-5 mb-4">
          <h3 className="text-sm font-semibold mb-3">New Category</h3>
          <div className="grid grid-cols-2 gap-3">
            <input type="text" value={newForm.name} onChange={(e) => setNewForm({ ...newForm, name: e.target.value })} placeholder="Name" className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent" />
            <input type="text" value={newForm.slug} onChange={(e) => setNewForm({ ...newForm, slug: e.target.value })} placeholder="Slug (auto)" className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent" />
            <input type="text" value={newForm.description} onChange={(e) => setNewForm({ ...newForm, description: e.target.value })} placeholder="Description" className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent col-span-2" />
            <input type="text" value={newForm.image_url} onChange={(e) => setNewForm({ ...newForm, image_url: e.target.value })} placeholder="Image URL" className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent col-span-2" />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleCreate} className="px-3 py-1.5 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent-dark"><Save size={14} className="inline mr-1" />Save</button>
            <button onClick={() => setShowNew(false)} className="px-3 py-1.5 text-sm font-medium text-muted border border-border rounded-md hover:bg-surface">Cancel</button>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/50">
              <th className="w-8 px-3 py-3"></th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Image</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Slug</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Description</th>
              <th className="px-4 py-3 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-border/50">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-surface rounded animate-pulse w-3/4" /></td>
                  ))}
                </tr>
              ))
            ) : categories.map((cat) => (
              <tr key={cat.id} className="border-b border-border/50 hover:bg-surface/30">
                <td className="px-3 py-2 text-muted"><GripVertical size={14} /></td>
                <td className="px-4 py-2">
                  {cat.image_url ? (
                    <img src={cat.image_url} alt="" className="w-10 h-10 rounded object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-surface" />
                  )}
                </td>
                <td className="px-4 py-2">
                  {editId === cat.id ? (
                    <input type="text" value={editForm.name ?? ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="px-2 py-1 text-sm border border-border rounded focus:outline-none focus:border-accent w-full" />
                  ) : (
                    <span className="font-medium text-foreground">{cat.name}</span>
                  )}
                </td>
                <td className="px-4 py-2 text-muted">{cat.slug}</td>
                <td className="px-4 py-2 text-muted text-xs truncate max-w-[200px]">{cat.description}</td>
                <td className="px-4 py-2">
                  {editId === cat.id ? (
                    <div className="flex gap-1">
                      <button onClick={handleUpdate} className="p-1 hover:bg-accent-light rounded"><Save size={14} className="text-accent" /></button>
                      <button onClick={() => setEditId(null)} className="p-1 hover:bg-surface rounded"><X size={14} className="text-muted" /></button>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <button onClick={() => { setEditId(cat.id); setEditForm(cat); }} className="p-1.5 hover:bg-surface rounded"><Edit size={14} className="text-muted" /></button>
                      <button onClick={() => setDeleteId(cat.id)} className="p-1.5 hover:bg-sale/10 rounded"><Trash2 size={14} className="text-muted hover:text-sale" /></button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && categories.length === 0 && (
          <div className="py-8 text-center text-sm text-muted">No categories yet</div>
        )}
      </div>

      <ConfirmDialog isOpen={!!deleteId} title="Delete Category" message="This will delete the category. Products in this category will be uncategorized." confirmLabel="Delete" variant="danger" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
