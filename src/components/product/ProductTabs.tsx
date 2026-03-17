"use client";

import { useState } from "react";
import { motion } from "framer-motion";
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
  { id: "reviews", label: "Reviews" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function ProductTabs({ product, reviews }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("description");

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative px-6 py-3 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "text-foreground"
                : "text-muted hover:text-foreground"
            )}
          >
            {tab.label}
            {tab.id === "reviews" && reviews.length > 0 && (
              <span className="ml-1 text-muted">({reviews.length})</span>
            )}
            {activeTab === tab.id && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                transition={{ duration: 0.2 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="py-8">
        {activeTab === "description" && (
          <div className="prose prose-sm max-w-none text-foreground leading-relaxed">
            {product.description ? (
              <div dangerouslySetInnerHTML={{ __html: product.description }} />
            ) : (
              <p className="text-muted">No description available.</p>
            )}
          </div>
        )}

        {activeTab === "specifications" && (
          <SpecsTable specifications={product.specifications || {}} />
        )}

        {activeTab === "reviews" && (
          <ReviewSection reviews={reviews} productId={product.slug} />
        )}
      </div>
    </div>
  );
}
