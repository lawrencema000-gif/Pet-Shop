"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Ban, CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatPrice } from "@/lib/utils";
import { logAdminAction } from "@/lib/audit-log";

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [reviews, setReviews] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: prof }, { data: ords }, { data: revs }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", id).single(),
        supabase.from("orders").select("id, status, total, created_at").eq("user_id", id).order("created_at", { ascending: false }).limit(20),
        supabase.from("reviews").select("id, rating, title, created_at, product:products(name)").eq("user_id", id).order("created_at", { ascending: false }).limit(20),
      ]);
      setProfile(prof);
      setOrders(ords ?? []);
      setReviews(revs ?? []);
      setLoading(false);
    }
    load();
  }, [id]);

  async function toggleBan() {
    if (!profile) return;
    const newBan = !profile.is_banned;
    const { error } = await supabase.from("profiles").update({ is_banned: newBan }).eq("id", id);
    if (error) { console.error("Toggle ban failed:", error.message); return; }
    await logAdminAction(newBan ? "ban_customer" : "unban_customer", "profile", id);
    setProfile({ ...profile, is_banned: newBan });
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  if (!profile) return <div className="text-center py-20 text-muted">Customer not found</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/customers" className="p-2 hover:bg-surface rounded-md"><ArrowLeft size={18} /></Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">{profile.full_name as string ?? "Unknown"}</h1>
            <p className="text-xs text-muted mt-1">ID: {id.slice(0, 8)} · Joined {new Date(profile.created_at as string).toLocaleDateString()}</p>
          </div>
        </div>
        <button onClick={toggleBan} className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${profile.is_banned ? "bg-success/10 text-success hover:bg-success/20" : "bg-sale/10 text-sale hover:bg-sale/20"}`}>
          {profile.is_banned ? <><CheckCircle size={14} /> Unban</> : <><Ban size={14} /> Ban</>}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="bg-white border border-border rounded-lg p-5">
          <h3 className="text-sm font-semibold mb-3">Profile</h3>
          <dl className="space-y-2 text-sm">
            <div><dt className="text-muted">Name</dt><dd className="font-medium">{profile.full_name as string ?? "—"}</dd></div>
            <div><dt className="text-muted">Phone</dt><dd>{profile.phone as string ?? "—"}</dd></div>
            <div><dt className="text-muted">Status</dt><dd>{profile.is_banned ? <span className="text-sale font-medium">Banned</span> : <span className="text-success">Active</span>}</dd></div>
          </dl>
        </div>

        {/* Orders */}
        <div className="lg:col-span-2 bg-white border border-border rounded-lg">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold">Orders ({orders.length})</h3>
          </div>
          <div className="divide-y divide-border/50">
            {orders.map((o) => (
              <Link key={o.id as string} href={`/admin/orders/${o.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-surface/50">
                <span className="text-xs font-mono text-accent">#{(o.id as string).slice(0, 8)}</span>
                <StatusBadge status={o.status as string} />
                <span className="text-sm font-medium">{formatPrice(o.total as number)}</span>
                <span className="text-xs text-muted">{new Date(o.created_at as string).toLocaleDateString()}</span>
              </Link>
            ))}
            {orders.length === 0 && <div className="py-6 text-center text-sm text-muted">No orders</div>}
          </div>
        </div>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="mt-6 bg-white border border-border rounded-lg">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold">Reviews ({reviews.length})</h3>
          </div>
          <div className="divide-y divide-border/50">
            {reviews.map((r) => (
              <div key={r.id as string} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{r.title as string ?? "No title"}</p>
                  <p className="text-xs text-muted">{(r.product as Record<string, string>)?.name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gold">{"★".repeat(r.rating as number)}</span>
                  <span className="text-xs text-muted">{new Date(r.created_at as string).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
