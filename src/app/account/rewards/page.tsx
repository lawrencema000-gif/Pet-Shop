"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { useAuth } from "@/lib/supabase/auth-provider";
import { supabase } from "@/lib/supabase/client";
import { Sparkles, ShoppingBag, ArrowRight, TrendingUp, Gift, Crown } from "lucide-react";

interface PointsBalance {
  balance: number;
  lifetime_earned: number;
  lifetime_redeemed: number;
}

interface PointTransaction {
  id: string;
  amount: number;
  type: string;
  reason: string | null;
  created_at: string;
}

interface Tier {
  slug: string;
  name: string;
  display_order: number;
  min_lifetime_spend_usd: number;
  points_earn_multiplier: number;
  free_shipping_threshold_usd: number | null;
  birthday_bonus_points: number | null;
  color_hex: string;
  icon_emoji: string;
  perks: string[];
}

const TYPE_LABELS: Record<string, string> = {
  order_earn: "Order Reward",
  redeem: "Redeemed",
  signup_bonus: "Welcome Bonus",
  review_bonus: "Review Reward",
  referral: "Referral Reward",
  admin_adjust: "Adjustment",
  expiry: "Expired",
};

export default function RewardsPage() {
  const { user, loading: authLoading } = useAuth();
  const [balance, setBalance] = useState<PointsBalance | null>(null);
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [lifetimeSpend, setLifetimeSpend] = useState(0);
  const [currentTierSlug, setCurrentTierSlug] = useState<string>("bronze");
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;
    Promise.all([
      supabase.from("loyalty_points").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("point_transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
      supabase.from("membership_tiers").select("*").order("display_order", { ascending: true }),
      supabase.from("profiles").select("lifetime_spend_usd, membership_tier").eq("id", user.id).maybeSingle(),
      supabase.rpc("is_active_premium_member", { p_user_id: user.id }),
    ]).then(([balRes, txRes, tierRes, profRes, premRes]) => {
      setBalance(balRes.data || { balance: 0, lifetime_earned: 0, lifetime_redeemed: 0 });
      setTransactions(txRes.data ?? []);
      setTiers(
        (tierRes.data ?? []).map((t) => ({
          ...t,
          min_lifetime_spend_usd: Number(t.min_lifetime_spend_usd),
          points_earn_multiplier: Number(t.points_earn_multiplier),
          perks: Array.isArray(t.perks) ? t.perks : [],
        })),
      );
      setLifetimeSpend(Number(profRes.data?.lifetime_spend_usd ?? 0));
      setCurrentTierSlug(profRes.data?.membership_tier ?? "bronze");
      setIsPremium(premRes.data === true);
      setLoading(false);
    });
  }, [user, authLoading]);

  if (authLoading) {
    return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!user) {
    return (
      <div className="container-main pb-20">
        <Breadcrumb items={[{ label: "Rewards" }]} />
        <div className="max-w-lg mx-auto text-center py-8">
          <div className="rounded-2xl bg-gradient-to-br from-accent/5 via-surface to-accent/10 border border-border p-10 md:p-14">
            <div className="w-20 h-20 mx-auto rounded-full bg-accent/10 flex items-center justify-center mb-6">
              <Sparkles className="w-10 h-10 text-accent" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Pet and Angels Rewards</h1>
            <p className="text-muted leading-relaxed mb-8 max-w-sm mx-auto">
              Earn 1 point for every $1 spent. Redeem points for discounts, exclusive perks, and surprise gifts.
            </p>
            <Link href="/auth/login" className="inline-flex items-center gap-2 bg-accent text-white px-8 py-3 rounded-lg text-sm font-semibold hover:bg-accent-dark transition-colors">
              Sign in to start earning <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>;
  }

  const tier = tiers.find((t) => t.slug === currentTierSlug) ?? tiers[0];
  const tierIdx = tiers.findIndex((t) => t.slug === currentTierSlug);
  const nextTier = tierIdx >= 0 && tierIdx < tiers.length - 1 ? tiers[tierIdx + 1] : null;
  const progress = tier && nextTier
    ? ((lifetimeSpend - tier.min_lifetime_spend_usd) / (nextTier.min_lifetime_spend_usd - tier.min_lifetime_spend_usd)) * 100
    : 100;
  const dollarsToNext = nextTier ? Math.max(0, nextTier.min_lifetime_spend_usd - lifetimeSpend) : 0;

  return (
    <div className="container-main pb-20">
      <Breadcrumb items={[{ label: "Rewards" }]} />

      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
        <Sparkles className="text-accent" /> Rewards
      </h1>
      <p className="text-sm text-muted mb-8">Earn points on every order. Redeem for exclusive discounts.</p>

      {/* Balance Card */}
      <div className="rounded-2xl bg-gradient-to-br from-accent via-accent-dark to-foreground text-white p-8 mb-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute top-20 right-20 w-20 h-20 rounded-full bg-white/5" />
        <div className="relative">
          <p className="text-xs uppercase tracking-wider text-white/70 mb-1">Available Balance</p>
          <p className="text-5xl font-bold mb-2">{(balance?.balance ?? 0).toLocaleString()}</p>
          <p className="text-sm text-white/80">points = ${((balance?.balance ?? 0) / 100).toFixed(2)} in rewards</p>
          <div className="flex gap-6 mt-6 pt-6 border-t border-white/20">
            <div>
              <p className="text-xs text-white/70">Lifetime Earned</p>
              <p className="text-lg font-semibold">{(balance?.lifetime_earned ?? 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-white/70">Lifetime Spend</p>
              <p className="text-lg font-semibold">${lifetimeSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tier */}
      {tier && (
        <div className="bg-white border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold uppercase text-white"
                style={{ backgroundColor: tier.color_hex }}
              >
                {tier.icon_emoji} {tier.name}
              </span>
              {isPremium && (
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-honey-100 text-honey-800 inline-flex items-center gap-1">
                  <Crown size={11} /> Pet+
                </span>
              )}
              {nextTier && (
                <span className="text-xs text-muted">
                  ${dollarsToNext.toLocaleString(undefined, { maximumFractionDigits: 2 })} more to {nextTier.name}
                </span>
              )}
            </div>
          </div>
          {nextTier && (
            <div className="w-full h-2 bg-surface rounded-full overflow-hidden mb-4">
              <div className="h-full bg-accent transition-all" style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }} />
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Your perks</h3>
            <ul className="space-y-1">
              {tier.perks.map((p) => (
                <li key={p} className="text-sm text-muted flex items-start gap-2">
                  <span className="text-accent mt-0.5">★</span> {p}
                </li>
              ))}
              {isPremium && <li className="text-sm text-honey-700 flex items-start gap-2"><Crown size={12} className="mt-0.5" /> Plus all Pet+ benefits stacked on top</li>}
            </ul>
          </div>
        </div>
      )}

      {/* Pet+ upsell */}
      {!isPremium && (
        <Link
          href="/membership"
          className="block bg-gradient-to-r from-bark-900 to-bark-800 text-white rounded-2xl p-5 mb-6 hover:from-bark-800 hover:to-bark-700 transition-colors"
        >
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="font-semibold flex items-center gap-1.5"><Crown size={14} className="text-honey-300" /> Want even more?</p>
              <p className="text-sm text-white/70 mt-0.5">Pet+ adds 1.5× points, free shipping always, and 5% off every order.</p>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-medium bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full">
              See plans <ArrowRight size={12} />
            </span>
          </div>
        </Link>
      )}

      {/* How to earn */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-border rounded-xl p-5">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
            <ShoppingBag size={18} className="text-accent" />
          </div>
          <p className="text-sm font-semibold text-foreground">{tier ? `${tier.points_earn_multiplier}× points` : "1 point per $1"}</p>
          <p className="text-xs text-muted mt-1">Earn automatically on every paid order.</p>
        </div>
        <div className="bg-white border border-border rounded-xl p-5">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
            <Gift size={18} className="text-accent" />
          </div>
          <p className="text-sm font-semibold text-foreground">100 points = $1 off</p>
          <p className="text-xs text-muted mt-1">Apply at checkout. Max 50% off any order.</p>
        </div>
        <div className="bg-white border border-border rounded-xl p-5">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
            <TrendingUp size={18} className="text-accent" />
          </div>
          <p className="text-sm font-semibold text-foreground">Climb tiers</p>
          <p className="text-xs text-muted mt-1">Higher tiers unlock more perks & faster earning.</p>
        </div>
      </div>

      {/* All tiers */}
      {tiers.length > 0 && (
        <div className="bg-white border border-border rounded-2xl overflow-hidden mb-6">
          <div className="px-5 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">All tiers</h2>
          </div>
          <ul className="divide-y divide-border">
            {tiers.map((t) => (
              <li
                key={t.slug}
                className={`px-5 py-3 flex items-center justify-between ${t.slug === currentTierSlug ? "bg-sand-50" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{t.icon_emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted">${t.min_lifetime_spend_usd.toLocaleString()}+ lifetime · {t.points_earn_multiplier}× points</p>
                  </div>
                </div>
                {t.slug === currentTierSlug && (
                  <span className="text-xs font-bold uppercase text-accent">Current</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Transactions */}
      <div className="bg-white border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
        </div>
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles size={32} className="mx-auto text-muted/50 mb-2" />
            <p className="text-sm text-muted">No activity yet.</p>
            <p className="text-xs text-muted mt-1">Place your first order to start earning points!</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {transactions.map((tx) => (
              <li key={tx.id} className="px-6 py-3 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {TYPE_LABELS[tx.type] ?? tx.type}
                  </p>
                  {tx.reason && <p className="text-xs text-muted">{tx.reason}</p>}
                  <p className="text-xs text-muted">{new Date(tx.created_at).toLocaleDateString()}</p>
                </div>
                <p className={`text-sm font-bold ${tx.amount >= 0 ? "text-success" : "text-sale"}`}>
                  {tx.amount >= 0 ? "+" : ""}{tx.amount.toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
