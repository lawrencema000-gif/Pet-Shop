"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Truck, RotateCcw, Shield, ArrowRight } from "lucide-react";

const trustBadges = [
  { icon: Truck, label: "Free Shipping $75+" },
  { icon: RotateCcw, label: "30-Day Returns" },
  { icon: Shield, label: "1-Year Warranty" },
];

const categoryChips = [
  { label: "Smart Feeders", href: "/categories/pet-feeders" },
  { label: "Water Fountains", href: "/categories/water-fountains" },
  { label: "Litter Boxes", href: "/categories/litter-boxes" },
  { label: "Accessories", href: "/categories/accessories" },
];

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden gradient-warm">
      <div className="container-main">
        <div className="grid md:grid-cols-5 items-center min-h-[520px] md:min-h-[620px] gap-8 md:gap-0">
          {/* Mobile image */}
          <div className="md:hidden relative w-full aspect-[4/3] rounded-premium-xl overflow-hidden mt-8">
            <Image
              src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=900&fit=crop"
              alt="Happy golden retriever with premium pet care products"
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
          </div>

          {/* Left side — text content */}
          <div className="md:col-span-3 py-8 md:py-16 md:pr-16">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="inline-block bg-accent-light text-accent text-xs font-bold tracking-wider uppercase px-4 py-2 rounded-full mb-6">
                SPRING SALE &mdash; UP TO 30% OFF
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-display-lg md:text-display-xl text-foreground"
            >
              Smart Care for{" "}
              <span className="text-accent">Happy Pets</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="text-body-lg text-muted mt-5 max-w-lg leading-relaxed"
            >
              Premium smart pet technology designed to keep your furry friends
              healthy, happy, and connected — even when you&apos;re away.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 flex flex-col sm:flex-row items-start gap-4"
            >
              <Link
                href="/products?sort=best-sellers"
                className="inline-flex items-center gap-2 bg-accent text-white px-8 py-4 rounded-premium font-semibold hover:bg-accent-dark transition-all duration-200 shadow-sm hover:shadow-md text-sm group"
              >
                Shop Best Sellers
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 border-2 border-accent text-accent px-8 py-4 rounded-premium font-semibold hover:bg-accent hover:text-white transition-all duration-200 text-sm"
              >
                Shop All Products
              </Link>
            </motion.div>

            {/* Category quick-chips */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 flex flex-wrap gap-2"
            >
              {categoryChips.map((chip) => (
                <Link
                  key={chip.href}
                  href={chip.href}
                  className="px-4 py-2 rounded-full bg-surface text-foreground-muted text-caption font-medium hover:bg-accent-light hover:text-accent transition-all duration-200"
                >
                  {chip.label}
                </Link>
              ))}
            </motion.div>

            {/* Trust micro-badges */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 flex flex-wrap gap-6"
            >
              {trustBadges.map((badge) => (
                <div
                  key={badge.label}
                  className="flex items-center gap-2 text-muted"
                >
                  <badge.icon className="w-4 h-4 text-accent" />
                  <span className="text-caption font-medium">{badge.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right side — image (desktop) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="hidden md:block md:col-span-2 relative h-[500px] lg:h-[560px] rounded-premium-xl overflow-hidden shadow-elevated"
          >
            <Image
              src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=900&fit=crop"
              alt="Happy golden retriever with premium pet care products"
              fill
              priority
              sizes="40vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/10 to-transparent" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
