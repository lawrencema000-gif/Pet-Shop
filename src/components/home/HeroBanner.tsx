"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function HeroBanner() {
  return (
    <section className="relative min-h-[500px] md:min-h-[600px] flex items-center justify-center bg-gradient-to-br from-accent to-foreground-muted overflow-hidden">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.05)_0%,transparent_70%)]" />

      <div className="relative z-10 max-w-2xl mx-auto text-center text-white px-4">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-sm tracking-widest uppercase mb-4 text-white/70"
        >
          SPRING SALE
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-4xl md:text-6xl font-bold leading-tight"
        >
          Refresh their routine
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-2xl md:text-3xl font-light mt-3"
        >
          with up to 30% off
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-lg opacity-80 mt-6 max-w-lg mx-auto"
        >
          Smart pet care products designed to keep your furry friends happy and
          healthy.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/products"
            className="bg-white text-accent px-8 py-4 rounded-lg font-semibold hover:bg-surface transition-colors"
          >
            Shop Now
          </Link>
          <Link
            href="/products?sale=true"
            className="text-white underline underline-offset-4 hover:opacity-80 transition-opacity"
          >
            Explore Deals &rarr;
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
