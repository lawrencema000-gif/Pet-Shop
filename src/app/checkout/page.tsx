"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { ShieldCheck, ArrowLeft, MapPin, Check, Truck } from "lucide-react";
import { useAuth } from "@/lib/supabase/auth-provider";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCartStore } from "@/lib/store/cart";
import { formatPrice } from "@/lib/utils";
import { SITE_CONFIG, SHIPPING_COST, TAX_RATE } from "@/lib/constants";
import { CouponField } from "@/components/cart/CouponField";
import type { ShippingAddress } from "@/types/order";

export default function CheckoutPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());

  const [loading, setLoading] = useState(false);
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState<ShippingAddress>({
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  });
  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { user } = useAuth();

  // Saved addresses
  interface SavedAddress { id: string; label: string; line1: string; line2?: string; city: string; state: string; zip: string; country: string; is_default: boolean }
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("addresses").select("*").eq("user_id", user.id).order("is_default", { ascending: false }).then(({ data }) => {
      if (data && data.length > 0) {
        setSavedAddresses(data as SavedAddress[]);
        // Auto-fill default address
        const def = data.find((a: SavedAddress) => a.is_default) || data[0];
        if (def && !address.line1) {
          setAddress({ line1: def.line1, line2: def.line2 || "", city: def.city, state: def.state, zip: def.zip, country: def.country });
        }
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const freeShipping = subtotal >= SITE_CONFIG.freeShippingThreshold;
  const shipping = freeShipping ? 0 : SHIPPING_COST;
  const tax = Math.round((subtotal + shipping) * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + shipping + tax - discount) * 100) / 100;

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/cart");
    }
  }, [items.length, router]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t('checkout.errorEmail');
    }
    if (!address.line1.trim()) newErrors.line1 = t('checkout.errorAddress');
    if (!address.city.trim()) newErrors.city = t('checkout.errorCity');
    if (!address.state.trim()) newErrors.state = t('checkout.errorState');
    if (!address.zip.trim()) newErrors.zip = t('checkout.errorZip');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            product_id: item.product_id,
            variant_id: item.variant_id,
            quantity: item.quantity,
          })),
          email,
          shipping_address: address,
          coupon_code: couponCode ?? undefined,
          idempotency_key: idempotencyKey,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ form: data.error || t('checkout.errorGeneric') });
        return;
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
        return;
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setErrors({ form: t('checkout.errorGeneric') });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <Link
        href="/cart"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft size={16} />
        {t('checkout.backToCart')}
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
        {t('checkout.heading')}
      </h1>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-8 text-xs font-medium">
        {[
          { label: t('checkout.contact'), done: !!email.trim() },
          { label: t('checkout.shippingAddress'), done: !!address.line1.trim() && !!address.city.trim() },
          { label: t('checkout.payment'), done: false },
        ].map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            {i > 0 && <div className={`w-8 h-px ${step.done || (i === 1 && !!email.trim()) ? "bg-accent" : "bg-border"}`} />}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
              step.done ? "border-accent bg-accent/10 text-accent" : "border-border text-muted"
            }`}>
              {step.done ? <Check size={12} /> : <span className="w-4 text-center">{i + 1}</span>}
              <span className="hidden sm:inline">{step.label}</span>
            </div>
          </div>
        ))}
      </div>

      {errors.form && (
        <div className="bg-sale/10 border border-sale/20 rounded-lg p-4 mb-6">
          <p className="text-sm text-sale">{errors.form}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col lg:flex-row gap-8 lg:gap-12"
      >
        {/* Form */}
        <div className="flex-1 space-y-8">
          {/* Contact */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {t('checkout.contact')}
            </h2>
            <Input
              label={t('checkout.email')}
              type="email"
              placeholder={t('checkout.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />
          </section>

          {/* Shipping */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {t('checkout.shippingAddress')}
            </h2>

            {/* Saved addresses */}
            {savedAddresses.length > 0 && (
              <div className="mb-4 space-y-2">
                <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Saved Addresses</p>
                <div className="grid gap-2">
                  {savedAddresses.map((sa) => (
                    <button
                      key={sa.id}
                      type="button"
                      onClick={() => setAddress({ line1: sa.line1, line2: sa.line2 || "", city: sa.city, state: sa.state, zip: sa.zip, country: sa.country })}
                      className={`flex items-start gap-3 p-3 rounded-lg border text-left transition-colors ${
                        address.line1 === sa.line1 && address.zip === sa.zip
                          ? "border-accent bg-accent/5"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <MapPin size={16} className="text-muted mt-0.5 shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-foreground">{sa.label || "Address"}</p>
                        <p className="text-muted text-xs">{sa.line1}, {sa.city}, {sa.state} {sa.zip}</p>
                      </div>
                      {address.line1 === sa.line1 && address.zip === sa.zip && (
                        <Check size={16} className="text-accent ml-auto shrink-0 mt-0.5" />
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted">Or enter a new address below:</p>
              </div>
            )}

            <div className="space-y-4">
              <Input
                label={t('checkout.addressLine1')}
                placeholder={t('checkout.addressLine1Placeholder')}
                value={address.line1}
                onChange={(e) =>
                  setAddress({ ...address, line1: e.target.value })
                }
                error={errors.line1}
              />
              <Input
                label={t('checkout.addressLine2')}
                placeholder={t('checkout.addressLine2Placeholder')}
                value={address.line2}
                onChange={(e) =>
                  setAddress({ ...address, line2: e.target.value })
                }
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('checkout.city')}
                  placeholder={t('checkout.cityPlaceholder')}
                  value={address.city}
                  onChange={(e) =>
                    setAddress({ ...address, city: e.target.value })
                  }
                  error={errors.city}
                />
                <Input
                  label={t('checkout.state')}
                  placeholder={t('checkout.statePlaceholder')}
                  value={address.state}
                  onChange={(e) =>
                    setAddress({ ...address, state: e.target.value })
                  }
                  error={errors.state}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('checkout.zip')}
                  placeholder={t('checkout.zipPlaceholder')}
                  value={address.zip}
                  onChange={(e) =>
                    setAddress({ ...address, zip: e.target.value })
                  }
                  error={errors.zip}
                />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{t('checkout.country')}</label>
                  <select
                    value={address.country}
                    onChange={(e) => setAddress({ ...address, country: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-border rounded-md focus:outline-none focus:border-accent bg-background"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="JP">Japan</option>
                    <option value="KR">South Korea</option>
                    <option value="SG">Singapore</option>
                    <option value="HK">Hong Kong</option>
                    <option value="TW">Taiwan</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="IT">Italy</option>
                    <option value="ES">Spain</option>
                    <option value="NL">Netherlands</option>
                    <option value="SE">Sweden</option>
                    <option value="NO">Norway</option>
                    <option value="DK">Denmark</option>
                    <option value="NZ">New Zealand</option>
                    <option value="IE">Ireland</option>
                    <option value="CH">Switzerland</option>
                    <option value="AT">Austria</option>
                    <option value="BE">Belgium</option>
                    <option value="PT">Portugal</option>
                    <option value="PL">Poland</option>
                    <option value="MX">Mexico</option>
                    <option value="BR">Brazil</option>
                    <option value="IN">India</option>
                    <option value="PH">Philippines</option>
                    <option value="MY">Malaysia</option>
                    <option value="TH">Thailand</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Payment */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {t('checkout.payment')}
            </h2>
            <div className="border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <ShieldCheck size={16} className="text-success" />
                <span>{t('checkout.securePayment')}</span>
              </div>
              <p className="text-sm text-muted leading-relaxed">
                {t('checkout.stripeRedirectNote')}
              </p>
            </div>
          </section>

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={loading}
            className="lg:hidden"
          >
            {t('checkout.continueToPayment')} &mdash; {formatPrice(total)}
          </Button>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:w-96">
          <div className="bg-surface-light rounded-xl p-6 lg:sticky lg:top-8">
            <h2 className="text-lg font-bold text-foreground mb-4">
              {t('checkout.orderSummary')}
            </h2>

            <div className="space-y-4 max-h-64 overflow-y-auto mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative w-14 h-14 flex-shrink-0 bg-background rounded overflow-hidden border border-border">
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="56px"
                    />
                    <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[10px] font-medium w-5 h-5 rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-1">
                      {item.name}
                    </p>
                    {item.variant_name && (
                      <p className="text-xs text-muted">{item.variant_name}</p>
                    )}
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">{t('checkout.subtotal')}</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">{t('checkout.shipping')}</span>
                <span className={freeShipping ? "text-success font-medium" : "font-medium"}>
                  {freeShipping ? t('common.free') : formatPrice(SHIPPING_COST)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">{t('checkout.tax')}</span>
                <span className="font-medium">{formatPrice(tax)}</span>
              </div>
              {discount > 0 && couponCode && (
                <div className="flex justify-between text-success">
                  <span>Discount ({couponCode})</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-border mt-4 pt-4">
              <CouponField
                subtotal={subtotal}
                onApply={(discountAmount, code) => {
                  setDiscount(discountAmount);
                  setCouponCode(code);
                }}
                onRemove={() => {
                  setDiscount(0);
                  setCouponCode(null);
                }}
              />
            </div>

            <div className="border-t border-border mt-4 pt-4">
              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-foreground">{t('checkout.total')}</span>
                <span className="text-xl font-bold text-foreground">
                  {formatPrice(total)}
                </span>
              </div>

              {/* Estimated delivery */}
              <div className="flex items-center gap-2 text-xs text-muted mb-4 p-2 bg-success/5 rounded-lg border border-success/20">
                <Truck size={14} className="text-success shrink-0" />
                <span>
                  Estimated delivery: <strong className="text-foreground">
                  {new Date(Date.now() + 5 * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  {" - "}
                  {new Date(Date.now() + 8 * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </strong>
                </span>
              </div>

              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={loading}
                className="hidden lg:flex"
              >
                {t('checkout.continueToPayment')}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
