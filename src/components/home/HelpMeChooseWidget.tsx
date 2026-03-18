"use client";

import Link from "next/link";
import { HelpCircle, Dog, Cat } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";

export default function HelpMeChooseWidget() {
  return (
    <section className="py-16">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="bg-surface-light rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8"
        >
          {/* Text */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
              Not sure which product is right for your pet?
            </h2>
            <p className="text-muted mb-6 max-w-lg">
              Answer a few quick questions and we&apos;ll recommend the perfect
              products tailored to your pet&apos;s needs.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link href="/help-me-choose">
                <Button size="lg">Take Our Quiz</Button>
              </Link>

              <div className="flex items-center gap-2 text-sm text-muted">
                <span>Or browse by pet type:</span>
                <Link
                  href="/categories/dogs"
                  className="inline-flex items-center gap-1 font-medium text-foreground hover:text-accent transition-colors"
                >
                  <Dog size={16} />
                  Dogs
                </Link>
                <span className="text-border">|</span>
                <Link
                  href="/categories/cats"
                  className="inline-flex items-center gap-1 font-medium text-foreground hover:text-accent transition-colors"
                >
                  <Cat size={16} />
                  Cats
                </Link>
              </div>
            </div>
          </div>

          {/* Icon */}
          <div className="flex-shrink-0 hidden md:flex items-center justify-center w-32 h-32 rounded-full bg-accent/10">
            <HelpCircle size={56} className="text-accent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
