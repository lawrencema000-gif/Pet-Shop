"use client";

import { useState, useEffect, useCallback } from "react";
import { Trash2, Star } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { logAdminAction } from "@/lib/audit-log";

interface ReviewRow {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  is_verified_purchase: boolean;
  created_at: string;
  product_name: string;
  user_name: string | null;
}

const PAGE_SIZE = 20;

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [ratingFilter, setRatingFilter] = useState("");

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("reviews")
      .select("id, rating, title, body, is_verified_purchase, created_at, product:products(name), user:profiles(full_name)", { count: "exact" });

    if (ratingFilter) {
      query = query.eq("rating", parseInt(ratingFilter));
    }

    const from = (page - 1) * PAGE_SIZE;
    const { data, count } = await query
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    setReviews(
      (data ?? []).map((r: Record<string, unknown>) => ({
        id: r.id as string,
        rating: r.rating as number,
        title: r.title as string | null,
        body: r.body as string | null,
        is_verified_purchase: r.is_verified_purchase as boolean,
        created_at: r.created_at as string,
        product_name: (r.product as Record<string, string>)?.name ?? "Unknown",
        user_name: (r.user as Record<string, string>)?.full_name ?? null,
      }))
    );
    setTotal(count ?? 0);
    setLoading(false);
  }, [page, ratingFilter]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  async function handleDelete() {
    if (!deleteId) return;
    await supabase.from("reviews").delete().eq("id", deleteId);
    await logAdminAction("delete_review", "review", deleteId);
    setDeleteId(null);
    fetchReviews();
  }

  const columns: Column<ReviewRow>[] = [
    {
      key: "rating",
      label: "Rating",
      render: (row) => (
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={12} className={i < row.rating ? "text-gold fill-current" : "text-border"} />
          ))}
        </div>
      ),
    },
    {
      key: "title",
      label: "Review",
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-foreground">{row.title ?? "No title"}</p>
          {row.body && <p className="text-xs text-muted truncate max-w-[300px]">{row.body}</p>}
        </div>
      ),
    },
    { key: "product_name", label: "Product", render: (row) => <span className="text-sm text-muted">{row.product_name}</span> },
    { key: "user_name", label: "Customer", render: (row) => <span className="text-sm">{row.user_name ?? "Anonymous"}</span> },
    {
      key: "is_verified_purchase",
      label: "Verified",
      render: (row) => row.is_verified_purchase ? <span className="text-xs text-success font-medium">Yes</span> : <span className="text-xs text-muted">No</span>,
    },
    {
      key: "created_at",
      label: "Date",
      render: (row) => <span className="text-xs text-muted">{new Date(row.created_at).toLocaleDateString()}</span>,
    },
    {
      key: "actions",
      label: "",
      className: "w-10",
      render: (row) => (
        <button onClick={() => setDeleteId(row.id)} className="p-1.5 hover:bg-sale/10 rounded">
          <Trash2 size={14} className="text-muted hover:text-sale" />
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Reviews</h1>
          <p className="text-sm text-muted mt-1">{total} total reviews</p>
        </div>
        <select
          value={ratingFilter}
          onChange={(e) => { setRatingFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent"
        >
          <option value="">All Ratings</option>
          {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} Stars</option>)}
        </select>
      </div>
      <DataTable columns={columns} data={reviews} loading={loading} page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} emptyTitle="No reviews found" />
      <ConfirmDialog isOpen={!!deleteId} title="Delete Review" message="This will permanently delete this review." confirmLabel="Delete" variant="danger" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
