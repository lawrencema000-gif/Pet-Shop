"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useCartStore } from "@/lib/store/cart";
import { supabase } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import { SITE_CONFIG, SHIPPING_COST, TAX_RATE } from "@/lib/constants";
import { CouponField } from "@/components/cart/CouponField";
import type { ShippingAddress } from "@/types/order";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const clearCart = useCartStore((s) => s.clearCart);

  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
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

  const freeShipping = subtotal >= SITE_CONFIG.freeShippingThreshold;
  const shipping = freeShipping ? 0 : SHIPPING_COST;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax - discount;

  useEffect(() => {
    if (items.length === 0 && !orderId) {
      router.replace("/cart");
    }
  }, [items.length, orderId, router]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Valid email is required";
    }
    if (!address.line1.trim()) newErrors.line1 = "Address is required";
    if (!address.city.trim()) newErrors.city = "City is required";
    if (!address.state.trim()) newErrors.state = "State is required";
    if (!address.zip.trim()) newErrors.zip = "ZIP code is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: userData?.user?.id ?? null,
          email,
          status: "pending",
          subtotal,
          discount_amount: discount,
          shipping_amount: shipping,
          tax_amount: tax,
          total,
          shipping_address: address,
          coupon_code: couponCode,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        product_name: item.name,
        variant_name: item.variant_name,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      setOrderId(order.id);
      clearCart();
    } catch (err) {
      console.error("Checkout error:", err);
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Order confirmation
  if (orderId) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div>
          <CheckCircle2 size={64} className="text-success mx-auto mb-6" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Order Confirmed!
        </h1>
        <p className="text-muted mb-2">
          Thank you for your order. We&apos;ll send a confirmation to{" "}
          <span className="font-medium text-foreground">{email}</span>.
        </p>
        <p className="text-sm text-muted mb-8">
          Order ID:{" "}
          <span className="font-mono text-foreground">
            {orderId.slice(0, 8).toUpperCase()}
          </span>
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/products">
            <Button variant="outline">Continue Shopping</Button>
          </Link>
          <Link href="/account/orders">
            <Button>View Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
      <Link
        href="/cart"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Cart
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
        Checkout
      </h1>

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
              Contact
            </h2>
            <Input
              label="Email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />
          </section>

          {/* Shipping */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Shipping Address
            </h2>
            <div className="space-y-4">
              <Input
                label="Address Line 1"
                placeholder="123 Main St"
                value={address.line1}
                onChange={(e) =>
                  setAddress({ ...address, line1: e.target.value })
                }
                error={errors.line1}
              />
              <Input
                label="Address Line 2 (Optional)"
                placeholder="Apt, suite, etc."
                value={address.line2}
                onChange={(e) =>
                  setAddress({ ...address, line2: e.target.value })
                }
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  placeholder="New York"
                  value={address.city}
                  onChange={(e) =>
                    setAddress({ ...address, city: e.target.value })
                  }
                  error={errors.city}
                />
                <Input
                  label="State"
                  placeholder="NY"
                  value={address.state}
                  onChange={(e) =>
                    setAddress({ ...address, state: e.target.value })
                  }
                  error={errors.state}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="ZIP Code"
                  placeholder="10001"
                  value={address.zip}
                  onChange={(e) =>
                    setAddress({ ...address, zip: e.target.value })
                  }
                  error={errors.zip}
                />
                <Input
                  label="Country"
                  value={address.country}
                  onChange={(e) =>
                    setAddress({ ...address, country: e.target.value })
                  }
                  disabled
                />
              </div>
            </div>
          </section>

          {/* Payment */}
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Payment
            </h2>
            <div className="border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted">
                <ShieldCheck size={16} />
                <span>Demo Mode</span>
              </div>
              <p className="text-sm text-muted leading-relaxed">
                Payment processing coming soon &mdash; orders are placed as pending for demo purposes.
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
            Place Order &mdash; {formatPrice(total)}
          </Button>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:w-96">
          <div className="bg-surface-light rounded-xl p-6 lg:sticky lg:top-8">
            <h2 className="text-lg font-bold text-foreground mb-4">
              Order Summary
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
                <span className="text-muted">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span className={freeShipping ? "text-success font-medium" : "font-medium"}>
                  {freeShipping ? "Free" : formatPrice(SHIPPING_COST)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Tax</span>
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
                <span className="font-bold text-foreground">Total</span>
                <span className="text-xl font-bold text-foreground">
                  {formatPrice(total)}
                </span>
              </div>

              <Button
                type="submit"
                fullWidth
                size="lg"
                loading={loading}
                className="hidden lg:flex"
              >
                Place Order
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
