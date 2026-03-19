"use client";

import { useState } from "react";
import { Tag, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface CouponFieldProps {
  subtotal: number;
  onApply: (discount: number, code: string) => void;
  onRemove: () => void;
}

export function CouponField({ subtotal, onApply, onRemove }: CouponFieldProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState<{
    code: string;
    discount: number;
  } | null>(null);

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const { data: coupon, error: fetchError } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code.trim().toUpperCase())
        .single();

      if (fetchError || !coupon) {
        setError("Invalid coupon code");
        setLoading(false);
        return;
      }

      if (!coupon.is_active) {
        setError("This coupon is no longer active");
        setLoading(false);
        return;
      }

      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        setError("This coupon has expired");
        setLoading(false);
        return;
      }

      if (coupon.min_order_amount && subtotal < coupon.min_order_amount) {
        setError(
          `Minimum order amount is $${coupon.min_order_amount.toFixed(2)}`
        );
        setLoading(false);
        return;
      }

      if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
        setError("This coupon has reached its usage limit");
        setLoading(false);
        return;
      }

      let discount = 0;
      if (coupon.discount_type === "percentage") {
        discount = subtotal * (coupon.discount_value / 100);
      } else {
        discount = Math.min(coupon.discount_value, subtotal);
      }
      discount = Math.round(discount * 100) / 100;

      setApplied({ code: coupon.code, discount });
      onApply(discount, coupon.code);
    } catch {
      setError("Failed to validate coupon");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setApplied(null);
    setCode("");
    setError(null);
    onRemove();
  };

  if (applied) {
    return (
      <div className="flex items-center justify-between bg-success/10 rounded-lg px-3 py-2">
        <div className="flex items-center gap-2">
          <Check size={16} className="text-success" />
          <span className="text-sm font-medium text-success">
            {applied.code}
          </span>
        </div>
        <button
          onClick={handleRemove}
          className="p-1 text-muted hover:text-foreground transition-colors"
          aria-label="Remove coupon"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Tag
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError(null);
            }}
            placeholder="Coupon code"
            className={cn(
              "w-full border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-foreground placeholder:text-muted bg-background transition-colors focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent",
              error && "border-sale"
            )}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleApply}
          disabled={!code.trim() || loading}
          className="px-4"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : "Apply"}
        </Button>
      </div>
      {error && <p className="text-xs text-sale mt-1.5">{error}</p>}
    </div>
  );
}
