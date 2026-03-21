"use client";

import React, { useState } from "react";
import {
  Star,
  Heart,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Check,
  Truck,
  ShieldCheck,
  Minus,
  Plus,
} from "lucide-react";

// --- Types ---
interface ProductColor {
  name: string;
  value: string;
}

interface ProductData {
  name: string;
  price: number;
  rating: number;
  reviewCount: number;
  description: string;
  highlights: string[];
  details: string;
  images: string[];
  colors: ProductColor[];
  sizes: string[];
}

interface ProductDetailProps {
  product?: Partial<ProductData>;
}

// --- Default product data ---
const defaultProduct: ProductData = {
  name: "Modern Minimalist Backpack",
  price: 129.99,
  rating: 4.8,
  reviewCount: 124,
  description:
    'Our flagship backpack combines style, durability, and functionality. Crafted from water-resistant materials with premium leather accents, it features multiple compartments including a padded laptop sleeve that fits up to a 16" laptop.',
  highlights: [
    "Water-resistant polyester with genuine leather trim",
    'Padded 16" laptop compartment',
    "Anti-theft back pocket",
    "Ergonomic shoulder straps with breathable mesh",
    "Two water bottle side pockets",
  ],
  details: `Dimensions: 18" × 12" × 6" (H×W×D)
Capacity: 24L
Weight: 2.2 lbs
Material: 900D Polyester, YKK Zippers, Genuine Leather accents`,
  images: [
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
    "https://images.unsplash.com/photo-1622260614153-03223fb72052?w=800&q=80",
    "https://images.unsplash.com/photo-1581605405669-fcdf81165b59?w=800&q=80",
  ],
  colors: [
    { name: "Black", value: "#2C3038" },
    { name: "Navy", value: "#2B4353" },
    { name: "Olive", value: "#5B6D5B" },
    { name: "Burgundy", value: "#862B35" },
  ],
  sizes: ["S", "M", "L"],
};

// --- Star Rating Helper ---
function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={16}
          className={
            i < Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-border"
          }
        />
      ))}
    </div>
  );
}

// --- Main Component ---
export default function ProductDetail({ product: productOverride }: ProductDetailProps = {}) {
  const product: ProductData = { ...defaultProduct, ...productOverride };

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name ?? "");
  const [selectedSize, setSelectedSize] = useState(product.sizes[1] ?? product.sizes[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "details" | "shipping">("description");

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="bg-background min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center gap-1.5 text-xs text-muted">
            <li>
              <a href="#" className="hover:text-foreground transition-colors">Home</a>
            </li>
            <li className="text-border">/</li>
            <li>
              <a href="#" className="hover:text-foreground transition-colors">Bags</a>
            </li>
            <li className="text-border">/</li>
            <li>
              <a href="#" className="hover:text-foreground transition-colors">Backpacks</a>
            </li>
            <li className="text-border">/</li>
            <li className="text-foreground font-medium">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
          {/* Product Gallery */}
          <div className="relative">
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden rounded-xl bg-surface mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.images[currentImageIndex]}
                alt={`${product.name} - View ${currentImageIndex + 1}`}
                className="object-cover h-full w-full"
              />

              <button
                onClick={prevImage}
                className="absolute top-1/2 left-4 -translate-y-1/2 bg-white rounded-full p-2 shadow-elevated hover:bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label="Previous image"
              >
                <ArrowLeft size={20} className="text-foreground" />
              </button>

              <button
                onClick={nextImage}
                className="absolute top-1/2 right-4 -translate-y-1/2 bg-white rounded-full p-2 shadow-elevated hover:bg-surface transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label="Next image"
              >
                <ArrowRight size={20} className="text-foreground" />
              </button>
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`aspect-square rounded-lg overflow-hidden transition-all ${
                    currentImageIndex === idx
                      ? "ring-2 ring-accent shadow-card"
                      : "ring-1 ring-border hover:ring-accent/50"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="object-cover h-full w-full"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-2 flex justify-between items-start">
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-1">
                  {product.name}
                </h1>
                <div className="flex items-center gap-2">
                  <RatingStars rating={product.rating} />
                  <span className="text-sm text-muted">
                    {product.rating} ({product.reviewCount} reviews)
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`p-2 rounded-full transition-colors ${
                  isWishlisted
                    ? "text-sale bg-sale/10"
                    : "text-muted hover:text-sale"
                }`}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart
                  size={24}
                  className={isWishlisted ? "fill-current" : ""}
                />
              </button>
            </div>

            <div className="mt-4 mb-6">
              <span className="text-2xl font-bold text-foreground">
                ${product.price.toFixed(2)}
              </span>
              <span className="ml-2 text-sm text-success font-medium">In stock</span>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-border">
              <nav className="flex gap-8" aria-label="Product information tabs">
                {(["description", "details", "shipping"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab
                        ? "border-accent text-accent"
                        : "border-transparent text-muted hover:text-foreground hover:border-border"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab content */}
            <div className="mb-8">
              {activeTab === "description" && (
                <div>
                  <p className="text-body-sm text-foreground-muted mb-4">
                    {product.description}
                  </p>
                  <h3 className="text-heading-sm font-display text-foreground mb-2">
                    Highlights
                  </h3>
                  <ul className="space-y-2">
                    {product.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-center">
                        <Check size={16} className="text-success mr-2 flex-shrink-0" />
                        <span className="text-sm text-foreground-muted">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === "details" && (
                <div className="whitespace-pre-wrap text-sm text-foreground-muted">
                  {product.details}
                </div>
              )}

              {activeTab === "shipping" && (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Truck size={20} className="text-muted mr-3" />
                    <div>
                      <h3 className="font-medium text-foreground">Free shipping</h3>
                      <p className="text-sm text-muted">2-3 business days</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <ShieldCheck size={20} className="text-muted mr-3" />
                    <div>
                      <h3 className="font-medium text-foreground">30-day returns</h3>
                      <p className="text-sm text-muted">Hassle-free returns</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Color Selection */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-foreground">
                Color — <span className="text-muted">{selectedColor}</span>
              </h3>
              <div className="flex items-center gap-3 mt-2">
                {product.colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`relative rounded-full h-8 w-8 flex items-center justify-center transition-all ${
                      selectedColor === color.name
                        ? "ring-2 ring-offset-2 ring-accent"
                        : "hover:scale-110"
                    }`}
                    style={{ backgroundColor: color.value }}
                    aria-label={`Color: ${color.name}`}
                  >
                    {selectedColor === color.name && (
                      <Check size={14} className="text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground">Size</h3>
                <a
                  href="#"
                  className="text-sm font-medium text-accent hover:text-accent-dark transition-colors"
                >
                  Size guide
                </a>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`border rounded-md py-2 px-3 flex items-center justify-center text-sm font-medium transition-all ${
                      selectedSize === size
                        ? "bg-accent border-accent text-white"
                        : "border-border text-foreground hover:border-accent hover:bg-accent-light"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="mt-8">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-md">
                  <button
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    className="p-2.5 text-muted hover:text-foreground transition-colors disabled:opacity-40"
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={18} />
                  </button>
                  <input
                    type="text"
                    value={quantity}
                    readOnly
                    className="w-12 text-center border-0 focus:ring-0 bg-transparent text-foreground font-medium"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2.5 text-muted hover:text-foreground transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <button
                  type="button"
                  className="flex-1 bg-accent text-white py-3 px-6 rounded-md hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent flex items-center justify-center gap-2 font-medium transition-colors"
                >
                  <ShoppingBag size={20} />
                  Add to cart
                </button>
              </div>
              <button
                type="button"
                className="mt-4 w-full border border-border text-foreground py-3 px-6 rounded-md hover:bg-surface focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent font-medium transition-colors"
              >
                Buy now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
