"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Check,
  Truck,
  ShieldCheck,
  RotateCcw,
  Minus,
  Plus,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";
import { StarRating } from "@/components/ui/StarRating";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { useTranslation } from "react-i18next";
import type { Product, ProductVariant } from "@/types/product";

interface ProductDetailProps {
  product: Product;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const { t } = useTranslation();
  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);

  // Images sorted by display_order
  const images = useMemo(
    () => [...(product.images ?? [])].sort((a, b) => a.display_order - b.display_order),
    [product.images]
  );

  // Variants
  const defaultVariant = product.variants?.find((v) => v.is_default) || product.variants?.[0];
  const [selectedVariantId, setSelectedVariantId] = useState(defaultVariant?.id ?? "");
  const selectedVariant = product.variants?.find((v) => v.id === selectedVariantId);

  const price = selectedVariant?.price ?? product.base_price;
  const compareAt = selectedVariant?.compare_at_price ?? product.compare_at_price;
  const stockQuantity = selectedVariant?.stock_quantity ?? 99;
  const stockStatus = stockQuantity === 0 ? "out" : stockQuantity < 5 ? "low" : "in";

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "details" | "shipping">("description");
  const [addedToCart, setAddedToCart] = useState(false);

  // Group variants by type
  const variantGroups = useMemo(() => {
    if (!product.variants?.length) return {};
    const groups: Record<string, ProductVariant[]> = {};
    for (const v of product.variants) {
      if (!groups[v.variant_type]) groups[v.variant_type] = [];
      groups[v.variant_type].push(v);
    }
    return groups;
  }, [product.variants]);

  const typeLabels: Record<string, string> = { color: "Color", bundle: "Bundle", style: "Style", size: "Size" };

  const nextImage = () => setCurrentImageIndex((p) => (p === images.length - 1 ? 0 : p + 1));
  const prevImage = () => setCurrentImageIndex((p) => (p === 0 ? images.length - 1 : p - 1));

  const specsText = useMemo(() => {
    if (!product.specifications || Object.keys(product.specifications).length === 0) return null;
    return Object.entries(product.specifications).map(([k, v]) => `${k}: ${v}`).join("\n");
  }, [product.specifications]);

  const handleAddToCart = () => {
    const primaryImage = images[0]?.url ?? "";
    addItem({
      id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
      product_id: product.id,
      variant_id: selectedVariant?.id ?? null,
      name: product.name,
      variant_name: selectedVariant?.name ?? null,
      price,
      compare_at_price: compareAt,
      image_url: selectedVariant?.image_url ?? primaryImage,
      slug: product.slug,
    }, quantity);
    setAddedToCart(true);
    openDrawer();
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: product.name, url: window.location.href });
    } else if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const deliveryStart = new Date();
  deliveryStart.setDate(deliveryStart.getDate() + 5);
  const deliveryEnd = new Date();
  deliveryEnd.setDate(deliveryEnd.getDate() + 7);
  const fmtDate = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const currentImage = images[currentImageIndex];

  const tabLabels: Record<string, string> = {
    description: t('productDetailUI.description'),
    details: t('productDetailUI.details'),
    shipping: t('productDetailUI.shipping'),
  };

  return (
    <div className="bg-background font-sans">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center gap-1.5 text-xs text-muted">
            <li><Link href="/" className="hover:text-foreground transition-colors">{t('productDetailUI.home')}</Link></li>
            {product.category && (
              <>
                <li className="text-border">/</li>
                <li><Link href={`/categories/${product.category.slug}`} className="hover:text-foreground transition-colors">{product.category.name}</Link></li>
              </>
            )}
            <li className="text-border">/</li>
            <li className="text-foreground font-medium line-clamp-1">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
          {/* Gallery */}
          <div className="relative">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-surface mb-4">
              {currentImage?.url ? (
                <Image src={currentImage.url} alt={currentImage.alt_text || `${product.name}`} fill sizes="(max-width: 990px) 100vw, 50vw" className="object-cover" priority />
              ) : (
                <div className="flex items-center justify-center h-full text-muted">{t('productDetailUI.noImageAvailable')}</div>
              )}
              {images.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow-elevated hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent" aria-label={t('productDetailUI.previousImage')}><ArrowLeft size={20} className="text-foreground" /></button>
                  <button onClick={nextImage} className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/90 rounded-full p-2 shadow-elevated hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent" aria-label={t('productDetailUI.nextImage')}><ArrowRight size={20} className="text-foreground" /></button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, idx) => (
                  <button key={img.id} onClick={() => setCurrentImageIndex(idx)} className={cn("relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors shrink-0", currentImageIndex === idx ? "border-accent" : "border-transparent hover:border-border")}>
                    <Image src={img.url} alt={img.alt_text || `Thumbnail ${idx + 1}`} fill sizes="80px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground leading-tight">{product.name}</h1>
                {product.subtitle && <p className="mt-1 text-muted text-base">{product.subtitle}</p>}
              </div>
              <button onClick={() => setIsWishlisted(!isWishlisted)} className={cn("p-2 rounded-full transition-colors", isWishlisted ? "text-sale bg-sale/10" : "text-muted hover:text-sale")} aria-label={isWishlisted ? t('productDetailUI.removeFromWishlist') : t('productDetailUI.addToWishlist')}>
                <Heart size={24} className={isWishlisted ? "fill-current" : ""} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {product.rating_count > 0 && (
                  <>
                    <StarRating rating={product.rating_avg} />
                    <a href="#reviews" className="text-sm text-muted hover:text-foreground transition-colors">({product.rating_count} {t('productDetailUI.reviews')})</a>
                  </>
                )}
              </div>
              <button onClick={handleShare} className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"><Share2 size={16} /> {t('productDetailUI.share')}</button>
            </div>

            <div className="flex items-center gap-2">
              <span className={cn("w-2.5 h-2.5 rounded-full", stockStatus === "in" ? "bg-success" : stockStatus === "low" ? "bg-orange-400" : "bg-red-500")} />
              <span className={cn("text-sm font-medium", stockStatus === "in" ? "text-success" : stockStatus === "low" ? "text-orange-500" : "text-red-500")}>
                {stockStatus === "in" ? t('productDetailUI.inStock') : stockStatus === "low" ? t('productDetailUI.lowStock', { count: stockQuantity }) : t('productDetailUI.outOfStock')}
              </span>
            </div>

            <PriceDisplay price={price} compareAtPrice={compareAt} size="lg" />

            {/* Tabs */}
            <div className="border-b border-border">
              <nav className="flex gap-8" aria-label={t('productDetailUI.productInfoTabs')}>
                {(["description", "details", "shipping"] as const).map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={cn("py-3 px-1 border-b-2 font-medium text-sm transition-colors", activeTab === tab ? "border-accent text-accent" : "border-transparent text-muted hover:text-foreground hover:border-border")}>
                    {tabLabels[tab]}
                  </button>
                ))}
              </nav>
            </div>

            <div className="min-h-[120px]">
              {activeTab === "description" && (
                <div>
                  {product.description && <p className="text-sm text-muted mb-4">{product.description}</p>}
                  {product.features?.length > 0 && (
                    <>
                      <h3 className="text-sm font-semibold text-foreground mb-2">{t('productDetailUI.highlights')}</h3>
                      <ul className="space-y-2">
                        {product.features.map((f, i) => (
                          <li key={i} className="flex items-center"><Check size={16} className="text-success mr-2 flex-shrink-0" /><span className="text-sm text-muted">{f}</span></li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              )}
              {activeTab === "details" && <div className="text-sm text-muted">{specsText ? <div className="whitespace-pre-wrap">{specsText}</div> : <p>{t('productDetailUI.noAdditionalDetails')}</p>}</div>}
              {activeTab === "shipping" && (
                <div className="space-y-4">
                  <div className="flex items-center"><Truck size={20} className="text-accent mr-3" /><div><h3 className="font-medium text-foreground">{t('productDetailUI.freeShipping')}</h3><p className="text-sm text-muted">{t('productDetailUI.estDelivery', { start: fmtDate(deliveryStart), end: fmtDate(deliveryEnd) })}</p></div></div>
                  <div className="flex items-center"><ShieldCheck size={20} className="text-accent mr-3" /><div><h3 className="font-medium text-foreground">{t('productDetailUI.thirtyDayReturns')}</h3><p className="text-sm text-muted">{t('productDetailUI.hassleFreeReturns')}</p></div></div>
                </div>
              )}
            </div>

            {/* Variant Selectors */}
            {Object.entries(variantGroups).map(([type, variants]) => (
              <div key={type} className="space-y-2">
                <h3 className="text-sm font-medium text-foreground">{typeLabels[type] || type}{selectedVariant && selectedVariant.variant_type === type && <span className="font-normal text-muted ml-2">— {selectedVariant.name}</span>}</h3>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => {
                    const isSelected = v.id === selectedVariantId;
                    const isOOS = v.stock_quantity === 0;
                    return (
                      <button key={v.id} onClick={() => !isOOS && setSelectedVariantId(v.id)} disabled={isOOS} className={cn("border rounded-md py-2 px-4 text-sm font-medium transition-all", isSelected ? "bg-accent border-accent text-white" : "border-border text-foreground hover:border-accent hover:bg-accent-light", isOOS && "opacity-40 line-through cursor-not-allowed")}>
                        {v.name}{isOOS && <span className="ml-1 text-[10px] no-underline">(OOS)</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Quantity + Add to Cart */}
            <div className="pt-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-md">
                  <button onClick={() => quantity > 1 && setQuantity(quantity - 1)} className="p-2.5 text-muted hover:text-foreground transition-colors disabled:opacity-40" disabled={quantity <= 1} aria-label={t('productDetailUI.decreaseQuantity')}><Minus size={18} /></button>
                  <input type="text" value={quantity} readOnly className="w-12 text-center border-0 focus:ring-0 bg-transparent text-foreground font-medium" />
                  <button onClick={() => setQuantity(Math.min(quantity + 1, stockQuantity))} className="p-2.5 text-muted hover:text-foreground transition-colors disabled:opacity-40" disabled={stockStatus === "out"} aria-label={t('productDetailUI.increaseQuantity')}><Plus size={18} /></button>
                </div>
                <button type="button" onClick={handleAddToCart} disabled={stockStatus === "out"} className={cn("flex-1 py-3 px-6 rounded-md flex items-center justify-center gap-2 font-medium transition-all", stockStatus === "out" ? "bg-surface text-muted cursor-not-allowed" : addedToCart ? "bg-success text-white" : "bg-accent text-white hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent")}>
                  {addedToCart ? (<><Check size={20} /> {t('productDetailUI.added')}</>) : stockStatus === "out" ? t('productDetailUI.outOfStock') : (<><ShoppingBag size={20} /> {t('productDetailUI.addToCart')}</>)}
                </button>
              </div>
              <Link href="/checkout" onClick={handleAddToCart} className="mt-4 w-full border border-border text-foreground py-3 px-6 rounded-md hover:bg-surface focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent font-medium transition-colors flex items-center justify-center">
                {t('productDetailUI.buyNow')}
              </Link>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted"><Truck size={16} className="text-accent" /><span>{t('productDetailUI.estimatedDelivery')} <span className="font-medium text-foreground">{t('productDetailUI.deliveryRange', { start: fmtDate(deliveryStart), end: fmtDate(deliveryEnd) })}</span></span></div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
              {[{ icon: Truck, label: t('productDetailUI.trustFreeShipping'), sub: t('productDetailUI.trustFreeShippingSub') }, { icon: RotateCcw, label: t('productDetailUI.trustReturns'), sub: t('productDetailUI.trustReturnsSub') }, { icon: ShieldCheck, label: t('productDetailUI.trustWarranty'), sub: t('productDetailUI.trustWarrantySub') }].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center gap-2 py-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center"><Icon size={20} className="text-accent" /></div>
                  <span className="text-xs font-medium text-foreground">{label}</span>
                  <span className="text-[10px] text-muted">{sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
