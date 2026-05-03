"use client";

import { useEffect, useState, useCallback } from "react";
import { Crown, Loader2, Save, Users, TrendingUp } from "lucide-react";
import { useStaffPermissions } from "@/hooks/useStaffPermissions";
import { supabase } from "@/lib/supabase/client";

interface Tier {
  id: string;
  slug: string;
  name: string;
  display_order: number;
  min_lifetime_spend_usd: number;
  points_earn_multiplier: number;
  max_redemption_pct: number;
  free_shipping_threshold_usd: number | null;
  birthday_bonus_points: number | null;
  priority_support: boolean;
  early_access_hours: number | null;
  free_returns: boolean;
  extended_returns_days: number | null;
  color_hex: string;
  icon_emoji: string;
  perks: string[];
}

interface Plan {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_usd: number;
  interval: "month" | "year";
  trial_days: number;
  points_earn_multiplier: number;
  free_shipping_threshold_usd: number | null;
  early_access_hours: number | null;
  member_discount_pct: number | null;
  birthday_bonus_points: number | null;
  features: string[];
  is_active: boolean;
  display_order: number;
  stripe_price_id: string | null;
}

interface Stats {
  totalMembers: number;
  trialing: number;
  active: number;
  cancelled: number;
  pastDue: number;
  monthlyMRR: number;
}

type Tab = "tiers" | "plans" | "members";

export default function AdminMembershipPage() {
  const { hasPermission, loaded } = useStaffPermissions();
  const [tab, setTab] = useState<Tab>("tiers");
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [tierRes, planRes, memRes] = await Promise.all([
      supabase.from("membership_tiers").select("*").order("display_order"),
      supabase.from("membership_plans").select("*").order("display_order"),
      supabase.from("memberships").select("status, plan:membership_plans(price_usd, interval)"),
    ]);
    setTiers(
      (tierRes.data ?? []).map((t) => ({
        ...t,
        min_lifetime_spend_usd: Number(t.min_lifetime_spend_usd),
        points_earn_multiplier: Number(t.points_earn_multiplier),
        free_shipping_threshold_usd: t.free_shipping_threshold_usd != null ? Number(t.free_shipping_threshold_usd) : null,
        perks: Array.isArray(t.perks) ? t.perks : [],
      })),
    );
    setPlans(
      (planRes.data ?? []).map((p) => ({
        ...p,
        price_usd: Number(p.price_usd),
        points_earn_multiplier: Number(p.points_earn_multiplier),
        free_shipping_threshold_usd: p.free_shipping_threshold_usd != null ? Number(p.free_shipping_threshold_usd) : null,
        features: Array.isArray(p.features) ? p.features : [],
      })),
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mems = (memRes.data ?? []) as any[];
    let mrr = 0;
    let trialing = 0, active = 0, cancelled = 0, pastDue = 0;
    mems.forEach((m) => {
      if (m.status === "trialing") trialing++;
      else if (m.status === "active") active++;
      else if (m.status === "cancelled" || m.status === "expired") cancelled++;
      else if (m.status === "past_due") pastDue++;
      if (["trialing", "active"].includes(m.status) && m.plan) {
        const price = Number(m.plan.price_usd);
        mrr += m.plan.interval === "month" ? price : price / 12;
      }
    });
    setStats({
      totalMembers: mems.length,
      trialing, active, cancelled, pastDue,
      monthlyMRR: mrr,
    });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function saveTier(t: Tier) {
    setSavingId(t.id);
    setMessage(null);
    const { error } = await supabase
      .from("membership_tiers")
      .update({
        name: t.name,
        display_order: t.display_order,
        min_lifetime_spend_usd: t.min_lifetime_spend_usd,
        points_earn_multiplier: t.points_earn_multiplier,
        max_redemption_pct: t.max_redemption_pct,
        free_shipping_threshold_usd: t.free_shipping_threshold_usd,
        birthday_bonus_points: t.birthday_bonus_points,
        priority_support: t.priority_support,
        early_access_hours: t.early_access_hours,
        free_returns: t.free_returns,
        extended_returns_days: t.extended_returns_days,
        color_hex: t.color_hex,
        icon_emoji: t.icon_emoji,
        perks: t.perks,
      })
      .eq("id", t.id);
    setSavingId(null);
    setMessage(error ? `Save failed: ${error.message}` : `Saved ${t.name}`);
    setTimeout(() => setMessage(null), 3500);
  }

  async function savePlan(p: Plan) {
    setSavingId(p.id);
    setMessage(null);
    const { error } = await supabase
      .from("membership_plans")
      .update({
        name: p.name,
        description: p.description,
        price_usd: p.price_usd,
        trial_days: p.trial_days,
        points_earn_multiplier: p.points_earn_multiplier,
        free_shipping_threshold_usd: p.free_shipping_threshold_usd,
        early_access_hours: p.early_access_hours,
        member_discount_pct: p.member_discount_pct,
        birthday_bonus_points: p.birthday_bonus_points,
        features: p.features,
        is_active: p.is_active,
        display_order: p.display_order,
      })
      .eq("id", p.id);
    setSavingId(null);
    setMessage(error ? `Save failed: ${error.message}` : `Saved ${p.name}`);
    setTimeout(() => setMessage(null), 3500);
  }

  if (!loaded || loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>;
  }

  if (!hasPermission("settings:read")) {
    return <div className="p-8 text-center text-muted">You don&apos;t have permission to view this page.</div>;
  }

  const canEdit = hasPermission("settings:write");

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Crown className="text-accent" />
        <h1 className="text-2xl font-bold text-foreground">Membership</h1>
      </div>
      <p className="text-sm text-muted mb-6">Manage loyalty tiers and Pet+ paid plans.</p>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatBox icon={<Users size={14} />} label="Total members" value={stats.totalMembers.toLocaleString()} />
          <StatBox icon={<Users size={14} />} label="Active + Trialing" value={(stats.active + stats.trialing).toLocaleString()} />
          <StatBox icon={<TrendingUp size={14} />} label="Monthly MRR" value={`$${stats.monthlyMRR.toFixed(2)}`} />
          <StatBox icon={<Users size={14} />} label="Cancelled" value={stats.cancelled.toLocaleString()} />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border mb-6">
        {(["tiers", "plans", "members"] as Tab[]).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === k ? "border-accent text-accent" : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {k === "tiers" ? "Loyalty tiers" : k === "plans" ? "Pet+ plans" : "Members"}
          </button>
        ))}
      </div>

      {message && (
        <div className="bg-moss-50 border border-moss-200 text-moss-800 rounded-lg px-4 py-2 text-sm mb-4">
          {message}
        </div>
      )}

      {/* Tiers tab */}
      {tab === "tiers" && (
        <div className="space-y-4">
          {tiers.map((t) => (
            <div key={t.id} className="bg-white border border-border rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="text"
                  value={t.icon_emoji}
                  onChange={(e) => setTiers((arr) => arr.map((x) => x.id === t.id ? { ...x, icon_emoji: e.target.value } : x))}
                  disabled={!canEdit}
                  className="w-12 text-center text-2xl border border-border rounded-lg py-1"
                />
                <input
                  type="text"
                  value={t.name}
                  onChange={(e) => setTiers((arr) => arr.map((x) => x.id === t.id ? { ...x, name: e.target.value } : x))}
                  disabled={!canEdit}
                  className="flex-1 px-3 py-2 border border-border rounded-lg font-semibold"
                />
                <input
                  type="color"
                  value={t.color_hex}
                  onChange={(e) => setTiers((arr) => arr.map((x) => x.id === t.id ? { ...x, color_hex: e.target.value } : x))}
                  disabled={!canEdit}
                  className="w-10 h-10 rounded cursor-pointer border border-border"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <Field label="Min lifetime spend ($)">
                  <input type="number" step="0.01" value={t.min_lifetime_spend_usd}
                    onChange={(e) => setTiers((arr) => arr.map((x) => x.id === t.id ? { ...x, min_lifetime_spend_usd: Number(e.target.value) } : x))}
                    disabled={!canEdit} className="w-full px-2 py-1.5 text-sm border border-border rounded" />
                </Field>
                <Field label="Points multiplier">
                  <input type="number" step="0.05" value={t.points_earn_multiplier}
                    onChange={(e) => setTiers((arr) => arr.map((x) => x.id === t.id ? { ...x, points_earn_multiplier: Number(e.target.value) } : x))}
                    disabled={!canEdit} className="w-full px-2 py-1.5 text-sm border border-border rounded" />
                </Field>
                <Field label="Max redemption %">
                  <input type="number" value={t.max_redemption_pct}
                    onChange={(e) => setTiers((arr) => arr.map((x) => x.id === t.id ? { ...x, max_redemption_pct: Number(e.target.value) } : x))}
                    disabled={!canEdit} className="w-full px-2 py-1.5 text-sm border border-border rounded" />
                </Field>
                <Field label="Free ship over ($)">
                  <input type="number" step="0.01" value={t.free_shipping_threshold_usd ?? ""}
                    placeholder="always free if blank"
                    onChange={(e) => setTiers((arr) => arr.map((x) => x.id === t.id ? { ...x, free_shipping_threshold_usd: e.target.value === "" ? null : Number(e.target.value) } : x))}
                    disabled={!canEdit} className="w-full px-2 py-1.5 text-sm border border-border rounded" />
                </Field>
                <Field label="Birthday bonus pts">
                  <input type="number" value={t.birthday_bonus_points ?? 0}
                    onChange={(e) => setTiers((arr) => arr.map((x) => x.id === t.id ? { ...x, birthday_bonus_points: Number(e.target.value) } : x))}
                    disabled={!canEdit} className="w-full px-2 py-1.5 text-sm border border-border rounded" />
                </Field>
                <Field label="Early access (hours)">
                  <input type="number" value={t.early_access_hours ?? 0}
                    onChange={(e) => setTiers((arr) => arr.map((x) => x.id === t.id ? { ...x, early_access_hours: Number(e.target.value) } : x))}
                    disabled={!canEdit} className="w-full px-2 py-1.5 text-sm border border-border rounded" />
                </Field>
                <Field label="Returns window (days)">
                  <input type="number" value={t.extended_returns_days ?? 30}
                    onChange={(e) => setTiers((arr) => arr.map((x) => x.id === t.id ? { ...x, extended_returns_days: Number(e.target.value) } : x))}
                    disabled={!canEdit} className="w-full px-2 py-1.5 text-sm border border-border rounded" />
                </Field>
                <div className="space-y-2 pt-5">
                  <label className="flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={t.priority_support}
                      onChange={(e) => setTiers((arr) => arr.map((x) => x.id === t.id ? { ...x, priority_support: e.target.checked } : x))}
                      disabled={!canEdit} />
                    Priority support
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={t.free_returns}
                      onChange={(e) => setTiers((arr) => arr.map((x) => x.id === t.id ? { ...x, free_returns: e.target.checked } : x))}
                      disabled={!canEdit} />
                    Free returns
                  </label>
                </div>
              </div>

              <Field label="Customer-facing perks (one per line)">
                <textarea
                  value={t.perks.join("\n")}
                  onChange={(e) => setTiers((arr) => arr.map((x) => x.id === t.id ? { ...x, perks: e.target.value.split("\n").map((p) => p.trim()).filter(Boolean) } : x))}
                  disabled={!canEdit}
                  rows={4}
                  className="w-full px-2 py-1.5 text-sm border border-border rounded font-mono"
                />
              </Field>

              {canEdit && (
                <div className="flex justify-end mt-3">
                  <button
                    onClick={() => saveTier(t)}
                    disabled={savingId === t.id}
                    className="inline-flex items-center gap-1.5 bg-accent text-white px-4 py-2 rounded-full text-sm font-medium disabled:opacity-60"
                  >
                    {savingId === t.id ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Save
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Plans tab */}
      {tab === "plans" && (
        <div className="space-y-4">
          {plans.map((p) => (
            <div key={p.id} className="bg-white border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs bg-sand-100 text-bark-700 px-2 py-1 rounded">{p.slug}</span>
                  <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${p.is_active ? "bg-moss-100 text-moss-800" : "bg-bark-100 text-bark-700"}`}>
                    {p.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                {p.stripe_price_id && (
                  <span className="text-[10px] text-muted font-mono">{p.stripe_price_id}</span>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <Field label="Display name">
                  <input type="text" value={p.name}
                    onChange={(e) => setPlans((arr) => arr.map((x) => x.id === p.id ? { ...x, name: e.target.value } : x))}
                    disabled={!canEdit} className="w-full px-2 py-1.5 text-sm border border-border rounded" />
                </Field>
                <Field label="Price (USD)">
                  <input type="number" step="0.01" value={p.price_usd}
                    onChange={(e) => setPlans((arr) => arr.map((x) => x.id === p.id ? { ...x, price_usd: Number(e.target.value) } : x))}
                    disabled={!canEdit || !!p.stripe_price_id} className="w-full px-2 py-1.5 text-sm border border-border rounded disabled:bg-sand-50" />
                  {p.stripe_price_id && <p className="text-[10px] text-muted mt-0.5">Locked — Stripe price already created</p>}
                </Field>
                <Field label="Trial days">
                  <input type="number" value={p.trial_days}
                    onChange={(e) => setPlans((arr) => arr.map((x) => x.id === p.id ? { ...x, trial_days: Number(e.target.value) } : x))}
                    disabled={!canEdit} className="w-full px-2 py-1.5 text-sm border border-border rounded" />
                </Field>
                <Field label="Display order">
                  <input type="number" value={p.display_order}
                    onChange={(e) => setPlans((arr) => arr.map((x) => x.id === p.id ? { ...x, display_order: Number(e.target.value) } : x))}
                    disabled={!canEdit} className="w-full px-2 py-1.5 text-sm border border-border rounded" />
                </Field>
                <Field label="Points multiplier">
                  <input type="number" step="0.05" value={p.points_earn_multiplier}
                    onChange={(e) => setPlans((arr) => arr.map((x) => x.id === p.id ? { ...x, points_earn_multiplier: Number(e.target.value) } : x))}
                    disabled={!canEdit} className="w-full px-2 py-1.5 text-sm border border-border rounded" />
                </Field>
                <Field label="Discount %">
                  <input type="number" value={p.member_discount_pct ?? 0}
                    onChange={(e) => setPlans((arr) => arr.map((x) => x.id === p.id ? { ...x, member_discount_pct: Number(e.target.value) } : x))}
                    disabled={!canEdit} className="w-full px-2 py-1.5 text-sm border border-border rounded" />
                </Field>
                <Field label="Early access (h)">
                  <input type="number" value={p.early_access_hours ?? 0}
                    onChange={(e) => setPlans((arr) => arr.map((x) => x.id === p.id ? { ...x, early_access_hours: Number(e.target.value) } : x))}
                    disabled={!canEdit} className="w-full px-2 py-1.5 text-sm border border-border rounded" />
                </Field>
                <Field label="Birthday bonus pts">
                  <input type="number" value={p.birthday_bonus_points ?? 0}
                    onChange={(e) => setPlans((arr) => arr.map((x) => x.id === p.id ? { ...x, birthday_bonus_points: Number(e.target.value) } : x))}
                    disabled={!canEdit} className="w-full px-2 py-1.5 text-sm border border-border rounded" />
                </Field>
              </div>

              <Field label="Description">
                <input type="text" value={p.description ?? ""}
                  onChange={(e) => setPlans((arr) => arr.map((x) => x.id === p.id ? { ...x, description: e.target.value } : x))}
                  disabled={!canEdit} className="w-full px-2 py-1.5 text-sm border border-border rounded" />
              </Field>

              <div className="mt-3">
                <Field label="Features (one per line)">
                  <textarea
                    value={p.features.join("\n")}
                    onChange={(e) => setPlans((arr) => arr.map((x) => x.id === p.id ? { ...x, features: e.target.value.split("\n").map((f) => f.trim()).filter(Boolean) } : x))}
                    disabled={!canEdit}
                    rows={5}
                    className="w-full px-2 py-1.5 text-sm border border-border rounded font-mono"
                  />
                </Field>
              </div>

              {canEdit && (
                <div className="flex justify-between items-center mt-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={p.is_active}
                      onChange={(e) => setPlans((arr) => arr.map((x) => x.id === p.id ? { ...x, is_active: e.target.checked } : x))} />
                    Active (visible to customers)
                  </label>
                  <button
                    onClick={() => savePlan(p)}
                    disabled={savingId === p.id}
                    className="inline-flex items-center gap-1.5 bg-accent text-white px-4 py-2 rounded-full text-sm font-medium disabled:opacity-60"
                  >
                    {savingId === p.id ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Save
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Members tab */}
      {tab === "members" && <MembersList />}
    </div>
  );
}

function StatBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white border border-border rounded-xl p-4">
      <div className="flex items-center gap-1.5 text-muted text-[10px] font-medium uppercase tracking-wider mb-1.5">
        {icon} {label}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-muted mb-1">{label}</label>
      {children}
    </div>
  );
}

interface MemberRow {
  id: string;
  user_id: string;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  plan: { name: string; price_usd: number; interval: string } | null;
}

function MembersList() {
  const [rows, setRows] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    let q = supabase
      .from("memberships")
      .select("*, plan:membership_plans(name, price_usd, interval)")
      .order("created_at", { ascending: false })
      .limit(100);
    if (filter !== "all") q = q.eq("status", filter);
    q.then(({ data }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setRows((data ?? []) as any[]);
      setLoading(false);
    });
  }, [filter]);

  return (
    <div>
      <div className="flex gap-2 mb-3">
        {["all", "trialing", "active", "past_due", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full ${
              filter === s ? "bg-accent text-white" : "bg-white border border-border text-muted hover:text-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-12 text-center"><Loader2 className="w-5 h-5 animate-spin text-muted mx-auto" /></div>
        ) : rows.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted">No memberships yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-sand-50 border-b border-border text-xs uppercase text-muted">
              <tr>
                <th className="text-left px-4 py-2 font-medium">User</th>
                <th className="text-left px-4 py-2 font-medium">Plan</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
                <th className="text-left px-4 py-2 font-medium">Period end</th>
                <th className="text-left px-4 py-2 font-medium">Started</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2 font-mono text-xs">{r.user_id.slice(0, 8)}…</td>
                  <td className="px-4 py-2">
                    {r.plan ? `${r.plan.name} ($${Number(r.plan.price_usd).toFixed(2)}/${r.plan.interval})` : "—"}
                  </td>
                  <td className="px-4 py-2">
                    <span className="text-xs font-bold uppercase">{r.status}</span>
                    {r.cancel_at_period_end && <span className="ml-1 text-[10px] text-clay-600">(cancelling)</span>}
                  </td>
                  <td className="px-4 py-2 text-muted">
                    {r.current_period_end ? new Date(r.current_period_end).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-2 text-muted">{new Date(r.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
