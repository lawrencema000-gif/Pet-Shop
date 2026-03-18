"use client";

import { motion } from "framer-motion";
import { X, Check, Smartphone, Clock, ShieldCheck, BarChart3 } from "lucide-react";
import Link from "next/link";

const TRADITIONAL = [
  { text: "Manual feeding — inconsistent portions", icon: X },
  { text: "Stale standing water — bacteria buildup", icon: X },
  { text: "Daily scooping — unpleasant chore", icon: X },
  { text: "No health insights — problems go unnoticed", icon: X },
  { text: "Anxiety when traveling — who feeds my pet?", icon: X },
];

const SMART = [
  { text: "App-controlled portions — perfect every time", icon: Check },
  { text: "5-stage filtered, flowing water — always fresh", icon: Check },
  { text: "Self-cleaning — fully automatic", icon: Check },
  { text: "AI health monitoring — early detection", icon: Check },
  { text: "Remote access — feed & watch from anywhere", icon: Check },
];

const STATS = [
  { value: "47%", label: "Healthier eating habits", icon: BarChart3 },
  { value: "2hrs", label: "Saved per week on pet chores", icon: Clock },
  { value: "99%", label: "Customer satisfaction rate", icon: ShieldCheck },
  { value: "24/7", label: "Remote monitoring & control", icon: Smartphone },
];

export default function ProblemSolution() {
  return (
    <section className="py-section bg-surface-light">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
        >
          <span className="text-overline text-accent font-semibold tracking-widest uppercase mb-3 block">
            Why Go Smart?
          </span>
          <h2 className="text-heading-lg font-bold text-foreground mb-4">
            Traditional Pet Care vs. Smart Pet Care
          </h2>
          <p className="text-body text-muted max-w-2xl mx-auto">
            See how upgrading to smart pet technology transforms your daily routine
            and improves your pet&apos;s health.
          </p>
        </motion.div>

        {/* Comparison columns */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-16">
          {/* Traditional */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="bg-background rounded-premium-lg p-6 md:p-8 border border-border"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-sale/10 flex items-center justify-center">
                <X className="w-5 h-5 text-sale" />
              </div>
              <h3 className="text-heading-sm font-bold text-foreground">Traditional Way</h3>
            </div>
            <ul className="space-y-4">
              {TRADITIONAL.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-sale/10 flex items-center justify-center">
                    <X className="w-3 h-3 text-sale" />
                  </span>
                  <span className="text-body-sm text-foreground-muted">{item.text}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Smart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="bg-background rounded-premium-lg p-6 md:p-8 border-2 border-accent shadow-card"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-accent-light flex items-center justify-center">
                <Check className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-heading-sm font-bold text-foreground">The Smart Way</h3>
              <span className="ml-auto text-xs font-semibold text-accent bg-accent-light px-2.5 py-1 rounded-full">
                Recommended
              </span>
            </div>
            <ul className="space-y-4">
              {SMART.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-accent-light flex items-center justify-center">
                    <Check className="w-3 h-3 text-accent" />
                  </span>
                  <span className="text-body-sm text-foreground">{item.text}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-10"
        >
          {STATS.map((stat, i) => (
            <div
              key={i}
              className="bg-background rounded-premium p-5 text-center border border-border"
            >
              <stat.icon className="w-5 h-5 text-accent mx-auto mb-2" />
              <p className="text-heading font-bold text-accent">{stat.value}</p>
              <p className="text-caption text-muted mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-accent text-white px-8 py-3.5 rounded-premium font-medium text-sm hover:bg-accent-dark transition-colors shadow-sm hover:shadow-md"
          >
            Explore Smart Products
          </Link>
        </div>
      </div>
    </section>
  );
}
