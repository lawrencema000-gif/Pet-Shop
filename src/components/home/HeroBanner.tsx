"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Truck, RotateCcw, Shield } from "lucide-react";

const trustBadges = [
  { icon: Truck, label: "Free Shipping $75+" },
  { icon: RotateCcw, label: "30-Day Returns" },
  { icon: Shield, label: "1-Year Warranty" },
];

export default function HeroBanner() {
  return (
    <section className="relative bg-gradient-to-br from-white via-white to-surface-light overflow-hidden">
      <div className="container-main">
        <div className="grid md:grid-cols-5 items-center min-h-[500px] md:min-h-[600px] gap-8 md:gap-0">
          {/* Mobile image - shown first on mobile */}
          <div className="md:hidden relative w-full aspect-[4/3] rounded-2xl overflow-hidden mt-8">
            <Image
              src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=900&fit=crop"
              alt="Happy golden retriever"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>

          {/* Left side - text (60% = 3/5 cols) */}
          <div className="md:col-span-3 py-8 md:py-16 md:pr-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <span className="inline-block bg-sale/10 text-sale text-xs font-bold tracking-wider uppercase px-4 py-2 rounded-full mb-6">
                SPRING SALE &mdash; UP TO 30% OFF
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground"
            >
              Smart Care for{" "}
              <span className="text-foreground-muted">Happy Pets</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-lg text-muted mt-5 max-w-lg leading-relaxed"
            >
              Premium smart pet technology designed to keep your furry friends
              healthy, happy, and connected — even when you&apos;re away.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 flex flex-col sm:flex-row items-start gap-4"
            >
              <Link
                href="/products?sort=best-sellers"
                className="bg-accent text-white px-8 py-4 rounded-lg font-semibold hover:bg-foreground-muted transition-colors text-sm"
              >
                Shop Best Sellers
              </Link>
              <Link
                href="/products"
                className="border-2 border-accent text-accent px-8 py-4 rounded-lg font-semibold hover:bg-accent hover:text-white transition-colors text-sm"
              >
                Shop All Products
              </Link>
            </motion.div>

            {/* Mini trust badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mt-10 flex flex-wrap gap-6"
            >
              {trustBadges.map((badge) => (
                <div
                  key={badge.label}
                  className="flex items-center gap-2 text-muted"
                >
                  <badge.icon className="w-4 h-4 text-accent" />
                  <span className="text-xs font-medium">{badge.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right side - image (40% = 2/5 cols) - desktop only */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="hidden md:block md:col-span-2 relative h-[500px] lg:h-[560px] rounded-2xl overflow-hidden"
          >
            <Image
              src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=900&fit=crop"
              alt="Happy golden retriever"
              fill
              priority
              sizes="40vw"
              className="object-cover"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
