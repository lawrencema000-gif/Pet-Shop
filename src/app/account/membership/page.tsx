"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Crown, Loader2, Calendar, AlertCircle, CheckCircle2,
  Truck, Sparkles, PercentCircle, Clock, Gift, Headphones,
} from "lucide-react";
import { useAuth } from "@/lib/supabase/auth-provider";

interface Membership {
  id: string;
  status: "trialing" | "active" | "past_due" | "cancelled" | "expired" | "incomplete";
  cancel_at_period_end: boolean;
  current_period_start: string | null;
  current_period_end: string | null;
  trial_end: string | null;
  cancelled_at: string | null;
  plan: {
    slug: string;
    name: string;
    price_usd: number;
    interval: string;
    features: string[];
  };
}

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  trialing: { text: "Free trial", cls: "bg-honey-100 text-honey-800" },
  active: { text: "Active", cls: "bg-moss-100 text-moss-800" },
  past_due: { text: "Past due", cls: "bg-clay-100 text-clay-800" },
  cancelled: { text: "Cancelled", cls: "bg-bark-100 text-bark-700" },
  expired: { text: "Expired", cls: "bg-bark-100 text-bark-700" },
  incomplete: { text: "Incomplete", cls: "bg-clay-100 text-clay-800" },
};

export default function AccountMembershipPage() {
  const { user, loading: authLoading } = useAuth();
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<"cancel" | "resume" | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const res = await fetch("/api/membership");
    if (res.ok) {
      const data = await res.json();
      setMembership(data.membership);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { if (!authLoading) load(); }, [authLoading, load]);

  async function action(act: "cancel" | "resume") {
    setActing(act);
    setError(null);
    const res = await fetch("/api/membership", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: act }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Action failed");
    } else {
      await load();
      setConfirmCancel(false);
    }
    setActing(null);
  }

  if (authLoading || loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-moss-500" /></div>;
  }

  if (!user) {
    return (
      <div className="text-center py-16">
        <Crown size={36} className="mx-auto text-muted mb-3" />
        <p className="text-muted mb-4">Sign in to manage your Pet+ membership.</p>
        <Link href="/auth/login" className="inline-flex bg-moss-500 text-white px-5 py-2 rounded-full text-sm font-medium">Sign in</Link>
      </div>
    );
  }

  // No active membership
  if (!membership) {
    return (
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-bark-900 mb-2 flex items-center gap-2">
          <Crown className="text-honey-600" /> Pet+ Membership
        </h1>
        <p className="text-sm text-muted mb-6">Upgrade for free shipping always, 5% off, and 1.5× rewards.</p>

        <div className="bg-gradient-to-br from-sand-100 via-sand-50 to-moss-50 border border-moss-200 rounded-3xl p-8 text-center">
          <Crown className="mx-auto text-honey-600 mb-3" size={42} />
          <h2 className="text-xl font-display font-bold text-bark-900 mb-2">You&apos;re not a Pet+ member yet</h2>
          <p className="text-sm text-muted mb-5 max-w-sm mx-auto">
            Try Pet+ free for 14 days. No charge today, cancel anytime.
          </p>
          <Link
            href="/membership"
            className="inline-flex items-center gap-2 bg-bark-900 hover:bg-bark-800 text-white px-6 py-3 rounded-full font-medium text-sm"
          >
            See Pet+ benefits
          </Link>
        </div>
      </div>
    );
  }

  const status = STATUS_LABEL[membership.status] ?? STATUS_LABEL.active;
  const isCancelling = membership.cancel_at_period_end;
  const isInactive = ["cancelled", "expired"].includes(membership.status);

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-display font-bold text-bark-900 mb-6 flex items-center gap-2">
        <Crown className="text-honey-600" /> Pet+ Membership
      </h1>

      {/* Hero card */}
      <div className="bg-gradient-to-br from-bark-900 to-bark-800 text-white rounded-3xl p-7 md:p-8 mb-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-honey-200/10" />
        <div className="absolute top-20 right-20 w-20 h-20 rounded-full bg-moss-300/10" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Crown size={16} className="text-honey-300" />
            <span className="font-medium uppercase text-[11px] tracking-widest text-white/70">Your plan</span>
            <span className={`ml-auto text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${status.cls}`}>
              {status.text}
            </span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-1">{membership.plan.name}</h2>
          <p className="text-white/70 text-sm mb-5">
            ${Number(membership.plan.price_usd).toFixed(2)} / {membership.plan.interval}
          </p>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {membership.status === "trialing" && membership.trial_end && (
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-honey-300" />
                <span className="text-white/80">Trial ends {new Date(membership.trial_end).toLocaleDateString()}</span>
              </div>
            )}
            {!isInactive && membership.current_period_end && (
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-honey-300" />
                <span className="text-white/80">
                  {isCancelling ? "Ends" : "Renews"} {new Date(membership.current_period_end).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel notice */}
      {isCancelling && !isInactive && (
        <div className="bg-clay-50 border border-clay-200 rounded-2xl p-5 mb-6 flex items-start gap-3">
          <AlertCircle className="text-clay-600 shrink-0 mt-0.5" size={18} />
          <div className="flex-1">
            <p className="font-medium text-foreground text-sm">Your membership is set to cancel</p>
            <p className="text-sm text-muted mt-1">
              You&apos;ll keep your benefits until {membership.current_period_end ? new Date(membership.current_period_end).toLocaleDateString() : "the end of the period"}, then your account returns to free.
            </p>
            <button
              onClick={() => action("resume")}
              disabled={acting === "resume"}
              className="mt-3 inline-flex items-center gap-1.5 bg-moss-500 hover:bg-moss-600 text-white px-4 py-2 rounded-full text-sm font-medium disabled:opacity-60"
            >
              {acting === "resume" ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              Resume membership
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-clay-50 border border-clay-200 text-clay-800 rounded-xl px-4 py-3 mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Benefits */}
      <div className="bg-white border border-border rounded-2xl p-6 mb-6">
        <h2 className="font-semibold text-foreground mb-4">Your benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Perk icon={<Truck size={16} />} label="Free shipping always" />
          <Perk icon={<PercentCircle size={16} />} label="5% off every order" />
          <Perk icon={<Sparkles size={16} />} label="1.5× rewards points" />
          <Perk icon={<Clock size={16} />} label="24h early access" />
          <Perk icon={<Gift size={16} />} label="250 birthday bonus" />
          <Perk icon={<Headphones size={16} />} label="Priority support" />
        </div>
      </div>

      {/* Cancel */}
      {!isCancelling && !isInactive && (
        <div className="bg-white border border-border rounded-2xl p-6">
          {!confirmCancel ? (
            <>
              <h2 className="font-semibold text-foreground mb-1">Cancel membership</h2>
              <p className="text-sm text-muted mb-4">
                You&apos;ll keep all benefits until your current period ends.
              </p>
              <button
                onClick={() => setConfirmCancel(true)}
                className="text-sm font-medium text-clay-700 hover:text-clay-800 underline"
              >
                Cancel my Pet+ membership
              </button>
            </>
          ) : (
            <>
              <h2 className="font-semibold text-foreground mb-1">Are you sure?</h2>
              <p className="text-sm text-muted mb-4">
                You&apos;ll lose free shipping, 5% off, and 1.5× points after {membership.current_period_end ? new Date(membership.current_period_end).toLocaleDateString() : "this period"}.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => action("cancel")}
                  disabled={acting === "cancel"}
                  className="inline-flex items-center gap-1.5 bg-clay-500 hover:bg-clay-600 text-white px-4 py-2 rounded-full text-sm font-medium disabled:opacity-60"
                >
                  {acting === "cancel" ? <Loader2 size={14} className="animate-spin" /> : null}
                  Yes, cancel
                </button>
                <button
                  onClick={() => setConfirmCancel(false)}
                  className="px-4 py-2 rounded-full text-sm font-medium border border-border hover:bg-sand-50"
                >
                  Keep membership
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Re-subscribe link if expired */}
      {isInactive && (
        <div className="bg-white border border-border rounded-2xl p-6 text-center">
          <p className="text-sm text-muted mb-4">Your Pet+ membership has ended.</p>
          <Link
            href="/membership"
            className="inline-flex items-center gap-2 bg-bark-900 hover:bg-bark-800 text-white px-5 py-2.5 rounded-full text-sm font-medium"
          >
            Resubscribe
          </Link>
        </div>
      )}
    </div>
  );
}

function Perk({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-foreground">
      <div className="w-8 h-8 rounded-full bg-moss-50 text-moss-600 flex items-center justify-center shrink-0">
        {icon}
      </div>
      {label}
    </div>
  );
}
