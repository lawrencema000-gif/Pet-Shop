"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { formatPrice } from "@/lib/utils";
import { logAdminAction } from "@/lib/audit-log";

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
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("products")
      .select(`
        id, name, slug, base_price, compare_at_price, status, is_featured,
        category:categories(name),
        images:product_images(url),
        variants:product_variants(stock_quantity)
      `, { count: "exact" });

    if (search) {
      query = query.ilike("name", `%${search}%`);
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
  }, [page, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  async function handleDelete() {
    if (!deleteId) return;
    const { error } = await supabase.from("products").delete().eq("id", deleteId);
    if (error) { console.error("Delete product failed:", error.message); return; }
    await logAdminAction("delete_product", "product", deleteId);
    setDeleteId(null);
    setSelectedIds([]);
    fetchProducts();
  }

  async function handleBulkDelete(ids: string[]) {
    for (const id of ids) {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) { console.error("Delete product failed:", error.message); continue; }
      await logAdminAction("delete_product", "product", id);
    }
    setSelectedIds([]);
    fetchProducts();
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
      render: (row) => <StatusBadge status={row.status} />,
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
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2.5 text-sm font-medium rounded-md hover:bg-accent-dark transition-colors"
        >
          <Plus size={16} />
          Add Product
        </Link>
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
          { label: "Delete Selected", onClick: handleBulkDelete, variant: "danger" },
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
    </div>
  );
}
