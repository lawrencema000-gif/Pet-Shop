"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Heart, ShoppingBag, ArrowRight, LogIn, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/supabase/auth-provider";
import { useWishlist } from "@/hooks/useWishlist";
import { useCartStore } from "@/lib/store/cart";
import { supabase } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";

interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  compare_at_price: number | null;
  images: { url: string; is_primary: boolean }[];
  variants: { id: string; name: string; price: number; is_default: boolean }[];
}

export default function WishlistPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { wishlistIds, loading: wishLoading, toggle } = useWishlist();
  const addItem = useCartStore((s) => s.addItem);
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    if (wishLoading || !user) return;
    const ids = Array.from(wishlistIds);
    if (ids.length === 0) {
      setProducts([]);
      setLoadingProducts(false);
      return;
    }
    supabase
      .from("products")
      .select("id, name, slug, base_price, compare_at_price, images:product_images(url, is_primary), variants:product_variants(id, name, price, is_default)")
      .in("id", ids)
      .eq("status", "active")
      .then(({ data }) => {
        setProducts((data as WishlistProduct[]) || []);
        setLoadingProducts(false);
      });
  }, [wishlistIds, wishLoading, user]);

  const handleAddToCart = (product: WishlistProduct) => {
    const defaultVariant = product.variants?.find((v) => v.is_default) || product.variants?.[0];
    const primaryImage = product.images?.find((i) => i.is_primary) || product.images?.[0];
    addItem({
      id: defaultVariant?.id ?? product.id,
      product_id: product.id,
      variant_id: defaultVariant?.id ?? null,
      name: product.name,
      variant_name: defaultVariant?.name ?? null,
      price: defaultVariant?.price ?? product.base_price,
      compare_at_price: product.compare_at_price ?? null,
      image_url: primaryImage?.url ?? "",
      slug: product.slug,
    });
  };

  const loading = authLoading || wishLoading || loadingProducts;

  return (
    <>
      <div className="container-main">
        <Breadcrumb items={[{ label: t("wishlist.heading") }]} />
      </div>

      <div className="container-main pb-20">
        {loading ? (
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-12 h-12 rounded-full border-2 border-accent border-t-transparent animate-spin mx-auto" />
          </div>
        ) : !user ? (
          /* Unauthenticated State */
          <div className="max-w-lg mx-auto text-center py-8">
            <div className="rounded-2xl bg-gradient-to-br from-accent/5 via-surface to-accent/10 border border-border p-10 md:p-14">
              <div className="relative inline-flex mb-6">
                <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center">
                  <Heart className="w-10 h-10 text-accent" strokeWidth={1.5} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-surface border-2 border-border flex items-center justify-center">
                  <LogIn size={14} className="text-muted" />
                </div>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                {t("wishlist.heading")}
              </h1>
              <p className="text-muted leading-relaxed mb-8 max-w-sm mx-auto">
                {t("wishlist.signInDesc")}
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 bg-accent text-white px-8 py-3 rounded-lg text-sm font-semibold hover:bg-accent-dark transition-colors"
              >
                {t("wishlist.signInCta")}
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ) : products.length === 0 ? (
          /* Empty State */
          <div className="max-w-lg mx-auto text-center py-8">
            <div className="rounded-2xl border border-border p-10 md:p-14">
              <div className="relative inline-flex mb-6">
                <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center">
                  <ShoppingBag className="w-10 h-10 text-muted/40" strokeWidth={1.5} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-accent/10 border-2 border-white flex items-center justify-center">
                  <Heart size={14} className="text-accent" />
                </div>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                {t("wishlist.emptyTitle")}
              </h1>
              <p className="text-muted leading-relaxed mb-8 max-w-sm mx-auto">
                {t("wishlist.emptyDesc")}
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-accent text-white px-8 py-3 rounded-lg text-sm font-semibold hover:bg-accent-dark transition-colors"
              >
                {t("common.browseProducts")}
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ) : (
          /* Wishlist Items */
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-6">
              {t("wishlist.heading")} ({products.length})
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => {
                const primaryImage = product.images?.find((i) => i.is_primary) || product.images?.[0];
                const defaultVariant = product.variants?.find((v) => v.is_default) || product.variants?.[0];
                const price = defaultVariant?.price ?? product.base_price;

                return (
                  <div key={product.id} className="group relative border border-border rounded-lg overflow-hidden">
                    <Link href={`/products/${product.slug}`} className="block">
                      <div className="relative aspect-square bg-surface-light">
                        {primaryImage?.url ? (
                          <Image
                            src={primaryImage.url}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted text-sm">
                            {t("common.noImage")}
                          </div>
                        )}
                      </div>
                      <div className="p-4 space-y-1">
                        <h3 className="font-medium text-foreground text-sm line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="font-semibold text-foreground text-sm">
                          {formatPrice(price)}
                        </p>
                      </div>
                    </Link>
                    <div className="px-4 pb-4 flex gap-2">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 py-2 bg-accent text-white text-xs font-semibold rounded hover:bg-accent/90 transition-colors"
                      >
                        {t("addToCart.addToCart")}
                      </button>
                      <button
                        onClick={() => toggle(product.id)}
                        className="p-2 border border-border rounded hover:bg-surface transition-colors"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 size={14} className="text-muted" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
