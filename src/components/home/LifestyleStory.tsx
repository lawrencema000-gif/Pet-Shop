"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function LifestyleStory() {
  return (
    <section className="py-section-lg overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image grid */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="relative aspect-[3/4] rounded-premium-lg overflow-hidden shadow-card">
                  <Image
                    src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=800&fit=crop"
                    alt="Happy dog with owner"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative aspect-square rounded-premium-lg overflow-hidden shadow-card">
                  <Image
                    src="https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500&h=500&fit=crop"
                    alt="Cat lounging peacefully"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="relative aspect-square rounded-premium-lg overflow-hidden shadow-card">
                  <Image
                    src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&h=500&fit=crop"
                    alt="Dogs playing outdoors"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative aspect-[3/4] rounded-premium-lg overflow-hidden shadow-card">
                  <Image
                    src="https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=600&h=800&fit=crop"
                    alt="Cat with owner at home"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
            {/* Floating accent element */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-accent-light rounded-full -z-10" />
            <div className="absolute -top-4 -left-4 w-16 h-16 bg-highlight rounded-full -z-10" />
          </motion.div>

          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            <span className="text-overline text-accent font-semibold tracking-widest uppercase mb-4 block">
              Our Philosophy
            </span>
            <h2 className="text-display font-bold text-foreground mb-6 leading-tight">
              Designed for the Way
              <br />
              <span className="text-accent">You Live Together</span>
            </h2>
            <div className="space-y-4 text-body text-foreground-muted mb-8">
              <p>
                We believe pet care should blend seamlessly into your life — not
                complicate it. Every product we design starts with one question:
                how can we make the bond between you and your pet even stronger?
              </p>
              <p>
                From app-connected feeders that give you peace of mind at work, to
                whisper-quiet fountains that keep water fresh around the clock, our
                technology works quietly in the background so you can focus on what
                matters — quality time with your best friend.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-surface-light rounded-premium p-4">
                <p className="text-heading font-bold text-accent">150K+</p>
                <p className="text-caption text-muted">Happy Pet Families</p>
              </div>
              <div className="bg-surface-light rounded-premium p-4">
                <p className="text-heading font-bold text-accent">4.8/5</p>
                <p className="text-caption text-muted">Average Rating</p>
              </div>
            </div>

            <Link
              href="/about"
              className="group inline-flex items-center gap-2 text-accent font-medium hover:gap-3 transition-all"
            >
              Read Our Story
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
