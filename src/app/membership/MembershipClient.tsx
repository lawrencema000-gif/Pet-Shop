"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Crown, Check, Truck, Sparkles, PercentCircle, Gift, Clock,
  Headphones, Loader2, ArrowRight, Star,
} from "lucide-react";
import { useAuth } from "@/lib/supabase/auth-provider";

interface Plan {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_usd: number;
  interval: "month" | "year";
  interval_count: number;
  trial_days: number;
  points_earn_multiplier: number;
  free_shipping_threshold_usd: number | null;
  early_access_hours: number | null;
  member_discount_pct: number | null;
  birthday_bonus_points: number | null;
  features: string[];
  display_order: number;
}

interface CurrentMembership {
  status: string;
  cancel_at_period_end: boolean;
  current_period_end: string | null;
  trial_end: string | null;
  plan: { slug: string; name: string; price_usd: number; interval: string };
}

export default function MembershipClient({ plans }: { plans: Plan[] }) {
  const { user, loading: authLoading } = useAuth();
  const [interval, setInterval] = useState<"month" | "year">("year");
  const [current, setCurrent] = useState<CurrentMembership | null>(null);
  const [loadingCurrent, setLoadingCurrent] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoadingCurrent(false);
      return;
    }
    fetch("/api/membership")
      .then((r) => r.json())
      .then((d) => setCurrent(d.membership ?? null))
      .finally(() => setLoadingCurrent(false));
  }, [user, authLoading]);

  const monthlyPlan = plans.find((p) => p.interval === "month");
  const yearlyPlan = plans.find((p) => p.interval === "year");
  const activePlan = interval === "month" ? monthlyPlan : yearlyPlan;
  const monthlyEquivalentSavings =
    monthlyPlan && yearlyPlan
      ? Math.max(0, monthlyPlan.price_usd * 12 - yearlyPlan.price_usd)
      : 0;

  async function handleSubscribe(planSlug: string) {
    if (!user) {
      window.location.href = `/auth/login?redirect=/membership`;
      return;
    }
    setSubscribing(planSlug);
    setError(null);
    try {
      const res = await fetch("/api/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "subscribe", plan_slug: planSlug }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error || "Could not start checkout. Please try again.");
        setSubscribing(null);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Network error. Please try again.");
      setSubscribing(null);
    }
  }

  return (
    <div className="bg-gradient-to-b from-sand-50 via-background to-background pb-20">
      {/* ─── Hero ───────────────────────────────────────── */}
      <div className="container-main pt-10 md:pt-16 pb-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 bg-honey-100 text-honey-800 px-3 py-1 rounded-full text-xs font-semibold mb-4">
            <Crown size={12} /> Premium membership
          </span>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-bark-900 mb-4 leading-tight">
            Treat your pet like family — and get treated back.
          </h1>
          <p className="text-base md:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Join <strong className="text-foreground">Pet+</strong> for free shipping always,
            5% off every order, 1.5× rewards, early access to drops, and a 250-point birthday bonus.
            Try it free for 14 days.
          </p>
        </div>

        {/* Current membership banner */}
        {!loadingCurrent && current && (
          <div className="max-w-2xl mx-auto mt-8 bg-moss-50 border border-moss-200 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm font-semibold text-moss-800 inline-flex items-center gap-1.5">
                <Check size={14} /> You&apos;re a Pet+ member ({current.plan.name})
              </p>
              <p className="text-xs text-muted mt-0.5">
                {current.status === "trialing" && current.trial_end
                  ? `Free trial ends ${new Date(current.trial_end).toLocaleDateString()}`
                  : current.cancel_at_period_end && current.current_period_end
                  ? `Cancels on ${new Date(current.current_period_end).toLocaleDateString()}`
                  : `Renews ${current.current_period_end ? new Date(current.current_period_end).toLocaleDateString() : ""}`}
              </p>
            </div>
            <Link
              href="/account/membership"
              className="text-sm font-medium text-moss-700 hover:text-moss-800 inline-flex items-center gap-1"
            >
              Manage <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>

      {/* ─── Pricing card ───────────────────────────────── */}
      <div className="container-main">
        <div className="max-w-xl mx-auto">
          {/* Toggle */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex bg-white border border-border rounded-full p-1">
              <button
                onClick={() => setInterval("month")}
                className={`px-5 py-2 text-sm font-medium rounded-full transition-colors ${
                  interval === "month" ? "bg-bark-900 text-white" : "text-muted hover:text-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setInterval("year")}
                className={`px-5 py-2 text-sm font-medium rounded-full transition-colors inline-flex items-center gap-1.5 ${
                  interval === "year" ? "bg-bark-900 text-white" : "text-muted hover:text-foreground"
                }`}
              >
                Yearly
                {monthlyEquivalentSavings > 0 && (
                  <span className="bg-honey-200 text-honey-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    SAVE ${monthlyEquivalentSavings.toFixed(0)}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Plan card */}
          {activePlan ? (
            <div className="bg-white border-2 border-moss-200 rounded-3xl p-7 md:p-9 shadow-sm relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-moss-50/60" />
              <div className="absolute top-16 -right-6 w-20 h-20 rounded-full bg-honey-50/80" />

              <div className="relative">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="font-display text-5xl md:text-6xl font-bold text-bark-900">
                    ${activePlan.price_usd.toFixed(2)}
                  </span>
                  <span className="text-muted text-sm">/{activePlan.interval}</span>
                </div>
                {interval === "year" && monthlyEquivalentSavings > 0 && (
                  <p className="text-xs text-moss-700 font-medium mb-3">
                    ≈ ${(activePlan.price_usd / 12).toFixed(2)}/mo · save ${monthlyEquivalentSavings.toFixed(0)} vs monthly
                  </p>
                )}
                <p className="text-sm text-muted mb-5">{activePlan.description}</p>

                <ul className="space-y-2.5 mb-6">
                  {activePlan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <Check size={16} className="text-moss-600 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {error && (
                  <p className="text-sm text-clay-700 bg-clay-50 border border-clay-200 rounded-lg px-3 py-2 mb-3">
                    {error}
                  </p>
                )}

                {current?.status && ["trialing", "active", "past_due"].includes(current.status) ? (
                  <Link
                    href="/account/membership"
                    className="w-full inline-flex items-center justify-center gap-2 bg-bark-900 hover:bg-bark-800 text-white px-6 py-3.5 rounded-full font-semibold text-sm"
                  >
                    Manage your membership <ArrowRight size={14} />
                  </Link>
                ) : (
                  <button
                    onClick={() => handleSubscribe(activePlan.slug)}
                    disabled={!!subscribing}
                    className="w-full inline-flex items-center justify-center gap-2 bg-moss-500 hover:bg-moss-600 text-white px-6 py-3.5 rounded-full font-semibold text-sm disabled:opacity-60"
                  >
                    {subscribing === activePlan.slug ? (
                      <><Loader2 size={16} className="animate-spin" /> Redirecting…</>
                    ) : (
                      <>Start {activePlan.trial_days}-day free trial</>
                    )}
                  </button>
                )}
                <p className="text-[11px] text-muted text-center mt-3">
                  No charge today. Cancel anytime before the trial ends.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-border rounded-2xl p-6 text-center text-muted text-sm">
              Membership plans are temporarily unavailable. Please check back soon.
            </div>
          )}
        </div>
      </div>

      {/* ─── Benefits grid ──────────────────────────────── */}
      <div className="container-main mt-16">
        <h2 className="text-center font-display text-3xl md:text-4xl font-bold text-bark-900 mb-2">
          Everything in Pet+
        </h2>
        <p className="text-center text-sm text-muted mb-10">Built for pet parents who shop with us regularly.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          <Benefit icon={<Truck />} title="Free shipping always" body="No minimums, no fine print. Every order ships free." />
          <Benefit icon={<PercentCircle />} title="5% off every order" body="Automatically applied at checkout — stacks with sales." />
          <Benefit icon={<Sparkles />} title="1.5× rewards points" body="Climb tiers faster and unlock bigger redemptions." />
          <Benefit icon={<Clock />} title="24h early access" body="Shop new arrivals and limited drops a day before everyone else." />
          <Benefit icon={<Gift />} title="250-point birthday bonus" body="A little surprise drops into your account every year." />
          <Benefit icon={<Headphones />} title="Priority support" body="Skip the queue. Real humans, faster answers." />
        </div>
      </div>

      {/* ─── Comparison ─────────────────────────────────── */}
      <div className="container-main mt-16 max-w-3xl">
        <h2 className="text-center font-display text-3xl font-bold text-bark-900 mb-8">
          Free vs. Pet+
        </h2>
        <div className="bg-white border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-sand-50 border-b border-border">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-foreground">Benefit</th>
                <th className="text-center px-4 py-3 font-medium text-muted">Free account</th>
                <th className="text-center px-4 py-3 font-semibold text-moss-700 inline-flex items-center justify-center gap-1 w-full">
                  <Crown size={14} /> Pet+
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <ComparisonRow label="Shipping" free="Free over $75" pro="Always free" />
              <ComparisonRow label="Discount" free="Sales only" pro="5% off every order" />
              <ComparisonRow label="Rewards points" free="1× per $1" pro="1.5× per $1" />
              <ComparisonRow label="Early access" free="—" pro="24 hours" />
              <ComparisonRow label="Birthday bonus" free="100 pts" pro="250 pts" />
              <ComparisonRow label="Support" free="Standard" pro="Priority" />
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Testimonial / social proof ─────────────────── */}
      <div className="container-main mt-16 max-w-3xl">
        <div className="bg-gradient-to-br from-sand-100 via-sand-50 to-moss-50 border border-moss-200 rounded-3xl p-8 md:p-10 text-center">
          <div className="flex justify-center gap-0.5 text-honey-600 mb-3">
            {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={16} fill="currentColor" />)}
          </div>
          <p className="font-display text-xl md:text-2xl text-bark-900 italic mb-4 leading-relaxed">
            &ldquo;Pet+ paid for itself in two orders. Free shipping plus the 5% off — it&apos;s a no-brainer
            if you&apos;re shopping monthly.&rdquo;
          </p>
          <p className="text-sm text-muted">— Maya, Pet+ member since 2025</p>
        </div>
      </div>

      {/* ─── FAQ ────────────────────────────────────────── */}
      <div className="container-main mt-16 max-w-2xl">
        <h2 className="text-center font-display text-3xl font-bold text-bark-900 mb-8">
          Common questions
        </h2>
        <div className="space-y-3">
          <Faq
            q="Can I cancel anytime?"
            a="Yes. Cancel from your account in one click. You'll keep your benefits until the end of the billing period."
          />
          <Faq
            q="How does the 14-day free trial work?"
            a="You won't be charged for 14 days. Use all the perks (free shipping, 5% off, 1.5× points). If you cancel before day 14, you pay nothing."
          />
          <Faq
            q="Does Pet+ stack with my rewards tier?"
            a="Yes — Pet+ benefits layer on top of your free Bronze/Silver/Gold tier. You earn the higher of the two point multipliers on every order."
          />
          <Faq
            q="Is there a contract?"
            a="No. Monthly bills monthly, yearly bills yearly. Cancel any time, no questions asked."
          />
          <Faq
            q="What payment methods are accepted?"
            a="All major credit cards, Apple Pay, and Google Pay through Stripe — fully encrypted."
          />
        </div>
      </div>

      {/* ─── Bottom CTA ─────────────────────────────────── */}
      {!current && activePlan && (
        <div className="container-main mt-16 max-w-xl text-center">
          <button
            onClick={() => handleSubscribe(activePlan.slug)}
            disabled={!!subscribing}
            className="inline-flex items-center gap-2 bg-bark-900 hover:bg-bark-800 text-white px-8 py-4 rounded-full font-semibold text-base disabled:opacity-60"
          >
            {subscribing ? <Loader2 size={16} className="animate-spin" /> : <Crown size={16} />}
            Try Pet+ free for {activePlan.trial_days} days
          </button>
          <p className="text-xs text-muted mt-3">No charge today. Cancel anytime.</p>
        </div>
      )}
    </div>
  );
}

function Benefit({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="bg-white border border-border rounded-2xl p-5">
      <div className="w-10 h-10 rounded-full bg-moss-50 text-moss-600 flex items-center justify-center mb-3 [&>svg]:w-5 [&>svg]:h-5">
        {icon}
      </div>
      <h3 className="font-semibold text-foreground text-sm mb-1">{title}</h3>
      <p className="text-xs text-muted leading-relaxed">{body}</p>
    </div>
  );
}

function ComparisonRow({ label, free, pro }: { label: string; free: string; pro: string }) {
  return (
    <tr>
      <td className="px-5 py-3 font-medium text-foreground">{label}</td>
      <td className="text-center px-4 py-3 text-muted">{free}</td>
      <td className="text-center px-4 py-3 text-moss-700 font-semibold">{pro}</td>
    </tr>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="group bg-white border border-border rounded-xl">
      <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between font-medium text-sm text-foreground">
        {q}
        <span className="text-muted transition-transform group-open:rotate-45 text-lg leading-none">+</span>
      </summary>
      <div className="px-5 pb-4 text-sm text-muted leading-relaxed">{a}</div>
    </details>
  );
}
