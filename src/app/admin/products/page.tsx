"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Download, Upload, Filter, X, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { exportCsv } from "@/lib/csv-export";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { formatPrice } from "@/lib/utils";
import { logAdminAction } from "@/lib/audit-log";
import { useToast } from "@/components/ui/Toast";

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  compare_at_price: number | null;
  status: string;
  is_featured: boolean;
  category_name: string | null;
  image_url: string | null;
  stock_total: number;
}

const PAGE_SIZE = 20;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[] | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkDeleteProgress, setBulkDeleteProgress] = useState(0);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Fetch categories for filter dropdown
  useEffect(() => {
    supabase.from("categories").select("id, name").order("name").then(({ data }) => {
      setCategories(data ?? []);
    });
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("products")
      .select(`
        id, name, slug, base_price, compare_at_price, status, is_featured, category_id,
        category:categories(name),
        images:product_images(url),
        variants:product_variants(stock_quantity)
      `, { count: "exact" });

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }
    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }
    if (categoryFilter !== "all") {
      query = query.eq("category_id", categoryFilter);
    }

    const from = (page - 1) * PAGE_SIZE;
    const { data, count } = await query
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    const rows: ProductRow[] = (data ?? []).map((p: Record<string, unknown>) => {
      const cat = p.category as { name: string } | null;
      const imgs = p.images as { url: string }[] | null;
      const vars = p.variants as { stock_quantity: number }[] | null;
      return {
        id: p.id as string,
        name: p.name as string,
        slug: p.slug as string,
        base_price: Number(p.base_price),
        compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : null,
        status: p.status as string,
        is_featured: p.is_featured as boolean,
        category_name: cat?.name ?? null,
        image_url: imgs?.[0]?.url ?? null,
        stock_total: vars?.reduce((s, v) => s + (v.stock_quantity ?? 0), 0) ?? 0,
      };
    });

    setProducts(rows);
    setTotal(count ?? 0);
    setLoading(false);
  }, [page, search, statusFilter, categoryFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  async function handleExport() {
    const { data } = await supabase
      .from("products")
      .select("id, name, slug, base_price, compare_at_price, status, is_featured, is_best_seller, is_new, category:categories(name), variants:product_variants(stock_quantity)")
      .order("created_at", { ascending: false })
      .limit(5000);

    if (!data || data.length === 0) return;

    exportCsv(
      "products",
      ["Name", "Slug", "Price", "Compare Price", "Status", "Category", "Stock", "Featured", "Best Seller", "New"],
      data.map((p: Record<string, unknown>) => {
        const cat = p.category as { name: string } | null;
        const vars = p.variants as { stock_quantity: number }[] | null;
        const stock = vars?.reduce((s, v) => s + (v.stock_quantity ?? 0), 0) ?? 0;
        return [
          p.name as string,
          p.slug as string,
          p.base_price as number,
          p.compare_at_price as number | null,
          p.status as string,
          cat?.name,
          stock,
          p.is_featured ? "Yes" : "No",
          p.is_best_seller ? "Yes" : "No",
          p.is_new ? "Yes" : "No",
        ];
      })
    );
  }

  async function handleDelete() {
    if (!deleteId) return;
    const { error } = await supabase.from("products").delete().eq("id", deleteId);
    if (error) {
      toast("Failed to delete product: " + error.message, "error");
      return;
    }
    await logAdminAction("delete_product", "product", deleteId);
    setDeleteId(null);
    setSelectedIds([]);
    toast("Product deleted", "success");
    fetchProducts();
  }

  async function handleBulkDelete() {
    if (!bulkDeleteIds || bulkDeleteIds.length === 0) return;
    setBulkDeleting(true);
    setBulkDeleteProgress(0);
    let deleted = 0;
    let failed = 0;
    for (const id of bulkDeleteIds) {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) { console.error("Delete product failed:", error.message); failed++; } else { deleted++; }
      await logAdminAction("delete_product", "product", id);
      setBulkDeleteProgress(Math.round(((deleted + failed) / bulkDeleteIds.length) * 100));
    }
    setBulkDeleting(false);
    setBulkDeleteIds(null);
    setSelectedIds([]);
    if (failed > 0) {
      toast(`Deleted ${deleted} products, ${failed} failed`, "error");
    } else {
      toast(`${deleted} product${deleted !== 1 ? "s" : ""} deleted`, "success");
    }
    fetchProducts();
  }

  async function handleBulkStatusChange(ids: string[], newStatus: string) {
    let updated = 0;
    let failed = 0;
    for (const id of ids) {
      const { error } = await supabase.from("products").update({ status: newStatus }).eq("id", id);
      if (error) { failed++; } else { updated++; }
      await logAdminAction("update_product_status", "product", id, { status: newStatus });
    }
    setSelectedIds([]);
    if (failed > 0) {
      toast(`Updated ${updated} products, ${failed} failed`, "error");
    } else {
      toast(`${updated} product${updated !== 1 ? "s" : ""} set to ${newStatus}`, "success");
    }
    fetchProducts();
  }

  async function handleStatusChange(id: string, newStatus: string) {
    setUpdatingStatus(id);
    const { error } = await supabase.from("products").update({ status: newStatus }).eq("id", id);
    if (error) {
      toast("Failed to update status: " + error.message, "error");
    } else {
      // Update local state immediately for instant feedback
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, status: newStatus } : p));
      toast(`Product set to ${newStatus}`, "success");
      await logAdminAction("update_product_status", "product", id, { status: newStatus });
    }
    setUpdatingStatus(null);
  }

  const columns: Column<ProductRow>[] = [
    {
      key: "image",
      label: "",
      className: "w-12",
      render: (row) => (
        <div className="w-10 h-10 rounded bg-surface overflow-hidden">
          {row.image_url ? (
            <img src={row.image_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted text-xs">N/A</div>
          )}
        </div>
      ),
    },
    {
      key: "name",
      label: "Product",
      sortable: true,
      render: (row) => (
        <div>
          <Link href={`/admin/products/${row.id}`} className="text-sm font-medium text-foreground hover:text-accent transition-colors">
            {row.name}
          </Link>
          {row.category_name && <p className="text-xs text-muted">{row.category_name}</p>}
        </div>
      ),
    },
    {
      key: "base_price",
      label: "Price",
      sortable: true,
      render: (row) => (
        <div>
          <span className="text-sm font-medium">{formatPrice(row.base_price)}</span>
          {row.compare_at_price && (
            <span className="text-xs text-muted line-through ml-1">{formatPrice(row.compare_at_price)}</span>
          )}
        </div>
      ),
    },
    {
      key: "stock_total",
      label: "Stock",
      sortable: true,
      render: (row) => (
        <span className={`text-sm ${row.stock_total <= 10 ? "text-sale font-medium" : "text-foreground"}`}>
          {row.stock_total}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <div className="relative">
          <select
            value={row.status}
            disabled={updatingStatus === row.id}
            onChange={(e) => handleStatusChange(row.id, e.target.value)}
            className={`appearance-none cursor-pointer text-xs font-medium rounded-full px-2.5 py-1 pr-6 border-0 focus:outline-none focus:ring-2 focus:ring-accent/30 transition-colors ${
              row.status === "active" ? "bg-success/10 text-success" :
              row.status === "draft" ? "bg-warning/10 text-warning" :
              "bg-muted/10 text-muted"
            } ${updatingStatus === row.id ? "opacity-50" : ""}`}
          >
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-50" />
        </div>
      ),
    },
    {
      key: "actions",
      label: "",
      className: "w-20",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Link href={`/admin/products/${row.id}`} className="p-1.5 hover:bg-surface rounded transition-colors" title="Edit">
            <Edit size={14} className="text-muted" />
          </Link>
          <button onClick={() => setDeleteId(row.id)} className="p-1.5 hover:bg-sale/10 rounded transition-colors" title="Delete">
            <Trash2 size={14} className="text-muted hover:text-sale" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Products</h1>
          <p className="text-sm text-muted mt-1">{total} total products</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-border rounded-md hover:bg-surface transition-colors">
            <Download size={14} /> Export CSV
          </button>
          <Link
            href="/admin/products/import"
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium border border-border rounded-md hover:bg-surface transition-colors"
          >
            <Upload size={14} /> Import CSV
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2.5 text-sm font-medium rounded-md hover:bg-accent-dark transition-colors"
          >
            <Plus size={16} />
            Add Product
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-1.5 text-sm text-muted">
          <Filter size={14} />
          <span className="font-medium">Filters:</span>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); setSelectedIds([]); }}
          className="px-3 py-1.5 text-sm border border-border rounded-md bg-white focus:outline-none focus:border-accent transition-colors"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); setSelectedIds([]); }}
          className="px-3 py-1.5 text-sm border border-border rounded-md bg-white focus:outline-none focus:border-accent transition-colors"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {(statusFilter !== "all" || categoryFilter !== "all") && (
          <button
            onClick={() => { setStatusFilter("all"); setCategoryFilter("all"); setPage(1); }}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-muted hover:text-foreground transition-colors"
          >
            <X size={12} />
            Clear filters
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        searchable
        searchPlaceholder="Search products..."
        onSearch={(q) => { setSearch(q); setPage(1); }}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        onPageChange={setPage}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        bulkActions={[
          { label: "Set Active", onClick: (ids) => handleBulkStatusChange(ids, "active") },
          { label: "Set Draft", onClick: (ids) => handleBulkStatusChange(ids, "draft") },
          { label: "Archive", onClick: (ids) => handleBulkStatusChange(ids, "archived") },
          { label: "Delete Selected", onClick: (ids) => setBulkDeleteIds(ids), variant: "danger" },
        ]}
        emptyTitle="No products found"
        emptyDescription="Create your first product to get started"
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete Product"
        message="This will permanently delete this product and all its variants and images. This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />

      <ConfirmDialog
        isOpen={!!bulkDeleteIds}
        title={`Delete ${bulkDeleteIds?.length ?? 0} Products`}
        message={
          bulkDeleting
            ? `Deleting... ${bulkDeleteProgress}% complete`
            : `This will permanently delete ${bulkDeleteIds?.length ?? 0} product${(bulkDeleteIds?.length ?? 0) !== 1 ? "s" : ""} and all their variants and images. This cannot be undone.`
        }
        confirmLabel={bulkDeleting ? `Deleting... ${bulkDeleteProgress}%` : "Delete All"}
        variant="danger"
        loading={bulkDeleting}
        onConfirm={handleBulkDelete}
        onCancel={() => { if (!bulkDeleting) setBulkDeleteIds(null); }}
      />
    </div>
  );
}
