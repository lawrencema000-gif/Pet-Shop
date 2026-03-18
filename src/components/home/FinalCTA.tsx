"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function FinalCTA() {
  return (
    <section className="py-section-lg">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative bg-accent rounded-premium-xl p-10 md:p-16 text-center overflow-hidden"
        >
          {/* Decorative circles */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
          <div className="absolute top-1/2 right-10 w-24 h-24 bg-white/5 rounded-full hidden lg:block" />

          <div className="relative z-10">
            <Sparkles className="w-8 h-8 text-white/80 mx-auto mb-4" />
            <h2 className="text-display font-bold text-white mb-4 leading-tight">
              Ready to Upgrade Your
              <br />
              Pet&apos;s Lifestyle?
            </h2>
            <p className="text-body-lg text-white/80 max-w-xl mx-auto mb-8">
              Join 150,000+ pet parents who&apos;ve made the switch to smarter,
              healthier pet care. Free shipping on orders over $75.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 bg-white text-accent px-8 py-3.5 rounded-premium font-semibold text-sm hover:bg-background transition-colors shadow-md"
              >
                Shop All Products
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/quiz"
                className="inline-flex items-center gap-2 bg-white/10 text-white border border-white/20 px-8 py-3.5 rounded-premium font-medium text-sm hover:bg-white/20 transition-colors backdrop-blur-sm"
              >
                Take the Quiz
              </Link>
            </div>

            {/* Trust microcopy */}
            <p className="text-xs text-white/60 mt-6">
              Free shipping over $75 &middot; 30-day returns &middot; 1-year warranty
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
