"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Truck, RotateCcw, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import SpecsTable from "./SpecsTable";
import ReviewSection from "./ReviewSection";
import type { Product, Review } from "@/types/product";

interface ProductTabsProps {
  product: Product;
  reviews: Review[];
}

const tabs = [
  { id: "description", label: "Description" },
  { id: "specifications", label: "Specifications" },
  { id: "shipping", label: "Shipping & Returns" },
  { id: "reviews", label: "Reviews" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function ProductTabs({ product, reviews }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("description");

  return (
    <div>
      {/* Tab Navigation — premium underline style */}
      <div className="relative border-b border-border">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap",
                activeTab === tab.id
                  ? "text-foreground"
                  : "text-muted hover:text-foreground"
              )}
            >
              {tab.label}
              {tab.id === "reviews" && reviews.length > 0 && (
                <span className="ml-1.5 text-xs bg-accent/10 text-accent px-1.5 py-0.5 rounded-full">
                  {reviews.length}
                </span>
              )}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="py-8"
        >
          {activeTab === "description" && (
            <div className="prose prose-sm max-w-none text-foreground leading-relaxed">
              {product.description ? (
                <p style={{ whiteSpace: "pre-wrap" }}>{product.description}</p>
              ) : (
                <p className="text-muted">No description available.</p>
              )}
            </div>
          )}

          {activeTab === "specifications" && (
            <SpecsTable specifications={product.specifications || {}} />
          )}

          {activeTab === "shipping" && (
            <div className="space-y-8 max-w-2xl">
              {/* Shipping */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Truck className="w-5 h-5 text-accent" />
                  Shipping Information
                </h3>
                <div className="space-y-3 text-sm text-muted leading-relaxed">
                  <div className="flex items-start gap-3 p-3 bg-surface rounded-lg">
                    <span className="font-medium text-foreground min-w-[140px]">Standard Shipping</span>
                    <span>5-7 business days — Free on orders over $75</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-surface rounded-lg">
                    <span className="font-medium text-foreground min-w-[140px]">Express Shipping</span>
                    <span>2-3 business days — $12.99</span>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-surface rounded-lg">
                    <span className="font-medium text-foreground min-w-[140px]">Overnight</span>
                    <span>Next business day — $24.99</span>
                  </div>
                </div>
              </div>

              {/* Returns */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-accent" />
                  Return Policy
                </h3>
                <div className="space-y-3 text-sm text-muted leading-relaxed">
                  <p>
                    We offer a <span className="font-medium text-foreground">30-day return policy</span> on all products. Items must be in their original packaging and in unused condition.
                  </p>
                  <ul className="space-y-2 list-none pl-0">
                    <li className="flex items-start gap-2">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                      Free return shipping on defective items
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                      Refund processed within 5-7 business days
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                      Exchange available for different size or color
                    </li>
                  </ul>
                </div>
              </div>

              {/* Processing */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent" />
                  Processing Time
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  Orders placed before <span className="font-medium text-foreground">2:00 PM EST</span> on business days are typically processed and shipped the same day. Orders placed after this time or on weekends/holidays will be processed the next business day.
                </p>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <ReviewSection reviews={reviews} productId={product.slug} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
