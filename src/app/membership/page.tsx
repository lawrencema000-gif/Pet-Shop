import type { Metadata } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import MembershipClient from "./MembershipClient";

export const metadata: Metadata = {
  title: "Pet+ Membership | Pet and Angels",
  description:
    "Join Pet+ for free shipping always, 5% off every order, 1.5× rewards points, early access to drops, priority support, and a 250-point birthday bonus. 14-day free trial.",
};

export const revalidate = 300;

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

export default async function MembershipPage() {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from("membership_plans")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  const plans: Plan[] = (data ?? []).map((p) => ({
    ...p,
    price_usd: Number(p.price_usd),
    points_earn_multiplier: Number(p.points_earn_multiplier),
    features: Array.isArray(p.features) ? p.features : [],
  }));

  return <MembershipClient plans={plans} />;
}
