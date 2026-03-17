"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { Package } from "lucide-react";

const bundles = [
  {
    name: "Feeding Starter Kit",
    items: ["Smart Feeder", "Placemat"],
    price: 149.99,
    originalPrice: 164.98,
    savings: 9,
    color: "from-amber-50 to-orange-50",
    borderColor: "border-amber-200",
  },
  {
    name: "Hydration Bundle",
    items: ["Smart Fountain", "Extra Filters (3-pack)"],
    price: 99.99,
    originalPrice: 114.98,
    savings: 13,
    color: "from-blue-50 to-cyan-50",
    borderColor: "border-blue-200",
  },
  {
    name: "Complete Care Set",
    items: ["Smart Feeder", "Smart Fountain", "Smart Litter Box"],
    price: 549.99,
    originalPrice: 619.97,
    savings: 11,
    color: "from-emerald-50 to-teal-50",
    borderColor: "border-emerald-200",
    popular: true,
  },
];

export default function FeaturedBundles() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="bg-surface py-16 md:py-24">
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold">
            Save More with Bundles
          </h2>
          <p className="text-muted mt-3">
            Get everything your pet needs at a better price.
          </p>
        </motion.div>

        {/* Desktop grid, mobile horizontal scroll */}
        <div className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto snap-x snap-mandatory pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          {bundles.map((bundle, i) => (
            <motion.div
              key={bundle.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative min-w-[280px] flex-shrink-0 snap-start bg-gradient-to-br ${bundle.color} border ${bundle.borderColor} rounded-2xl p-6 md:p-8 flex flex-col`}
            >
              {bundle.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-bold px-4 py-1 rounded-full">
                  Most Popular
                </span>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-white/80 flex items-center justify-center">
                  <Package className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-lg font-bold">{bundle.name}</h3>
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {bundle.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-muted"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    ${bundle.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted line-through">
                    ${bundle.originalPrice.toFixed(2)}
                  </span>
                </div>
                <span className="inline-block mt-1 text-xs font-semibold text-success bg-success/10 px-2 py-0.5 rounded">
                  Save {bundle.savings}%
                </span>
              </div>

              <button className="w-full bg-accent text-white py-3 rounded-lg text-sm font-semibold hover:bg-foreground-muted transition-colors">
                Add Bundle to Cart
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-8"
        >
          <Link
            href="/products"
            className="text-sm font-medium text-accent hover:opacity-70 transition-opacity"
          >
            View All Bundles &rarr;
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
