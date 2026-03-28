"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Shield, BarChart3, ChevronUp } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { logAdminAction } from "@/lib/audit-log";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { formatPrice } from "@/lib/utils";
import { useStaffPermissions } from "@/hooks/useStaffPermissions";

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number | null;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  is_active: boolean;
}

export default function AdminCouponsPage() {
  const { hasPermission, isSuperAdmin, loaded } = useStaffPermissions();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newForm, setNewForm] = useState({
    code: "", discount_type: "percentage", discount_value: "10",
    min_order_amount: "", max_uses: "", expires_at: "",
  });
  const [analyticsId, setAnalyticsId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<{
    totalOrders: number;
    totalRevenue: number;
    totalDiscount: number;
    avgOrderValue: number;
    recentOrders: { id: string; total: number; discount: number; created_at: string }[];
  } | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  async function load() {
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setCoupons((data ?? []) as Coupon[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate() {
    if (!newForm.code || !newForm.discount_value) return;

    const discountVal = parseFloat(newForm.discount_value);
    if (isNaN(discountVal) || discountVal <= 0) {
      alert("Discount value must be greater than 0.");
      return;
    }
    if (newForm.discount_type === "percentage" && discountVal > 100) {
      alert("Percentage discount cannot exceed 100%.");
      return;
    }
    const minOrder = newForm.min_order_amount ? parseFloat(newForm.min_order_amount) : null;
    if (minOrder !== null && (isNaN(minOrder) || minOrder < 0)) {
      alert("Minimum order amount must be 0 or greater.");
      return;
    }
    const maxUses = newForm.max_uses ? parseInt(newForm.max_uses) : null;
    if (maxUses !== null && (isNaN(maxUses) || maxUses < 1)) {
      alert("Max uses must be at least 1.");
      return;
    }
    if (newForm.expires_at && new Date(newForm.expires_at) < new Date()) {
      alert("Expiration date must be in the future.");
      return;
    }

    const { data, error } = await supabase.from("coupons").insert({
      code: newForm.code.toUpperCase(),
      discount_type: newForm.discount_type,
      discount_value: discountVal,
      min_order_amount: minOrder,
      max_uses: maxUses,
      expires_at: newForm.expires_at || null,
      is_active: true,
    }).select().single();

    if (error) {
      alert("Failed to create coupon: " + error.message);
      return;
    }
    if (data) {
      await logAdminAction("create_coupon", "coupon", data.id, { code: newForm.code });
      setShowNew(false);
      setNewForm({ code: "", discount_type: "percentage", discount_value: "10", min_order_amount: "", max_uses: "", expires_at: "" });
      load();
    }
  }

  async function loadAnalytics(couponCode: string, couponId: string) {
    if (analyticsId === couponId) { setAnalyticsId(null); setAnalytics(null); return; }
    setAnalyticsId(couponId);
    setLoadingAnalytics(true);
    const { data: orders } = await supabase
      .from("orders")
      .select("id, total, discount_amount, created_at")
      .eq("coupon_code", couponCode)
      .order("created_at", { ascending: false })
      .limit(100);

    const items = orders ?? [];
    const totalRevenue = items.reduce((s, o) => s + Number(o.total), 0);
    const totalDiscount = items.reduce((s, o) => s + Number(o.discount_amount), 0);

    setAnalytics({
      totalOrders: items.length,
      totalRevenue,
      totalDiscount,
      avgOrderValue: items.length > 0 ? totalRevenue / items.length : 0,
      recentOrders: items.slice(0, 5).map((o) => ({
        id: o.id,
        total: Number(o.total),
        discount: Number(o.discount_amount),
        created_at: o.created_at,
      })),
    });
    setLoadingAnalytics(false);
  }

  async function toggleActive(id: string, active: boolean) {
    await supabase.from("coupons").update({ is_active: active }).eq("id", id);
    await logAdminAction("toggle_coupon", "coupon", id, { is_active: active });
    load();
  }

  async function handleDelete() {
    if (!deleteId) return;
    await supabase.from("coupons").delete().eq("id", deleteId);
    await logAdminAction("delete_coupon", "coupon", deleteId);
    setDeleteId(null);
    load();
  }

  if (loaded && !isSuperAdmin && !hasPermission("coupons:write")) {
    return (
      <div className="text-center py-20">
        <Shield size={40} className="text-muted mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-foreground">Access Restricted</h2>
        <p className="text-sm text-muted mt-1">You don&apos;t have permission to manage coupons.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Coupons</h1>
          <p className="text-sm text-muted mt-1">{coupons.length} coupons</p>
        </div>
        <button onClick={() => setShowNew(true)} className="inline-flex items-center gap-2 bg-accent text-white px-4 py-2.5 text-sm font-medium rounded-md hover:bg-accent-dark">
          <Plus size={16} /> Add Coupon
        </button>
      </div>

      {showNew && (
        <div className="bg-white border border-border rounded-lg p-5 mb-4">
          <h3 className="text-sm font-semibold mb-3">New Coupon</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <input type="text" value={newForm.code} onChange={(e) => setNewForm({ ...newForm, code: e.target.value })} placeholder="Code (e.g. SAVE20)" className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent uppercase" />
            <select value={newForm.discount_type} onChange={(e) => setNewForm({ ...newForm, discount_type: e.target.value })} className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent">
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
            <input type="number" value={newForm.discount_value} onChange={(e) => setNewForm({ ...newForm, discount_value: e.target.value })} placeholder="Value" className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent" />
            <input type="number" value={newForm.min_order_amount} onChange={(e) => setNewForm({ ...newForm, min_order_amount: e.target.value })} placeholder="Min order (optional)" className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent" />
            <input type="number" value={newForm.max_uses} onChange={(e) => setNewForm({ ...newForm, max_uses: e.target.value })} placeholder="Max uses (optional)" className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent" />
            <input type="date" value={newForm.expires_at} onChange={(e) => setNewForm({ ...newForm, expires_at: e.target.value })} className="px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:border-accent" />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleCreate} className="px-3 py-1.5 text-sm font-medium bg-accent text-white rounded-md hover:bg-accent-dark">Create</button>
            <button onClick={() => setShowNew(false)} className="px-3 py-1.5 text-sm font-medium text-muted border border-border rounded-md hover:bg-surface">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Code</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Discount</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Min Order</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Uses</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Expires</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Status</th>
              <th className="px-4 py-3 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-border/50">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-surface rounded animate-pulse w-3/4" /></td>
                  ))}
                </tr>
              ))
            ) : coupons.map((c) => (
              <React.Fragment key={c.id}>
                <tr className="border-b border-border/50 hover:bg-surface/30">
                  <td className="px-4 py-3 font-mono font-semibold text-foreground">{c.code}</td>
                  <td className="px-4 py-3">{c.discount_type === "percentage" ? `${c.discount_value}%` : formatPrice(c.discount_value)}</td>
                  <td className="px-4 py-3 text-muted">{c.min_order_amount ? formatPrice(c.min_order_amount) : "—"}</td>
                  <td className="px-4 py-3">{c.current_uses}{c.max_uses ? ` / ${c.max_uses}` : ""}</td>
                  <td className="px-4 py-3 text-xs text-muted">{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "Never"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(c.id, !c.is_active)} className={`text-xs font-medium px-2 py-0.5 rounded-full ${c.is_active ? "bg-success/10 text-success" : "bg-muted/10 text-muted"}`}>
                      {c.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => loadAnalytics(c.code, c.id)} className="p-1.5 hover:bg-surface rounded" title="Analytics">
                        {analyticsId === c.id ? <ChevronUp size={14} className="text-accent" /> : <BarChart3 size={14} className="text-muted" />}
                      </button>
                      <button onClick={() => setDeleteId(c.id)} className="p-1.5 hover:bg-sale/10 rounded"><Trash2 size={14} className="text-muted hover:text-sale" /></button>
                    </div>
                  </td>
                </tr>
                {analyticsId === c.id && (
                  <tr className="border-b border-border/50">
                    <td colSpan={7} className="px-4 py-4 bg-surface/30">
                      {loadingAnalytics ? (
                        <div className="flex justify-center py-4"><div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
                      ) : analytics ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-4 gap-3">
                            <div className="bg-white rounded-md p-3 border border-border">
                              <p className="text-xs text-muted">Orders</p>
                              <p className="text-lg font-semibold text-foreground">{analytics.totalOrders}</p>
                            </div>
                            <div className="bg-white rounded-md p-3 border border-border">
                              <p className="text-xs text-muted">Revenue Generated</p>
                              <p className="text-lg font-semibold text-success">{formatPrice(analytics.totalRevenue)}</p>
                            </div>
                            <div className="bg-white rounded-md p-3 border border-border">
                              <p className="text-xs text-muted">Total Discounted</p>
                              <p className="text-lg font-semibold text-sale">{formatPrice(analytics.totalDiscount)}</p>
                            </div>
                            <div className="bg-white rounded-md p-3 border border-border">
                              <p className="text-xs text-muted">Avg Order Value</p>
                              <p className="text-lg font-semibold text-foreground">{formatPrice(analytics.avgOrderValue)}</p>
                            </div>
                          </div>
                          {analytics.recentOrders.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-muted uppercase mb-2">Recent Orders with this Coupon</p>
                              <div className="bg-white rounded-md border border-border divide-y divide-border/50">
                                {analytics.recentOrders.map((o) => (
                                  <div key={o.id} className="flex items-center justify-between px-3 py-2 text-sm">
                                    <span className="font-mono text-xs text-accent">#{o.id.slice(0, 8)}</span>
                                    <span className="text-muted">{new Date(o.created_at).toLocaleDateString()}</span>
                                    <span className="text-sale text-xs">-{formatPrice(o.discount)}</span>
                                    <span className="font-medium">{formatPrice(o.total)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {analytics.totalOrders === 0 && (
                            <p className="text-sm text-muted text-center py-2">No orders have used this coupon yet.</p>
                          )}
                        </div>
                      ) : null}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        {!loading && coupons.length === 0 && <div className="py-8 text-center text-sm text-muted">No coupons yet</div>}
      </div>

      <ConfirmDialog isOpen={!!deleteId} title="Delete Coupon" message="This will permanently delete this coupon." confirmLabel="Delete" variant="danger" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
    </div>
  );
}
