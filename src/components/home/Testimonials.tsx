"use client";

import Link from "next/link";
import { TESTIMONIALS } from "@/lib/constants";
import { CheckCircle } from "lucide-react";

export default function Testimonials() {
  return (
    <div>
      <div className="text-center mb-12">
        <span className="text-overline tracking-[0.25em] uppercase text-muted block mb-3">
          Reviews
        </span>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
          What Pet Parents Say
        </h2>
        {/* Aggregate rating */}
        <div className="inline-flex items-center gap-3 text-sm text-muted">
          <div className="flex gap-0.5 text-gold">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span>4.9 out of 5 from 2,400+ reviews</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {TESTIMONIALS.slice(0, 3).map((t) => (
          <div
            key={t.id}
            className="border border-border/60 p-6 md:p-8 bg-white"
          >
            {/* Stars */}
            <div className="flex gap-0.5 text-gold mb-4">
              {Array.from({ length: 5 }, (_, i) => (
                <svg key={i} className={`w-4 h-4 fill-current ${i < t.rating ? "opacity-100" : "opacity-20"}`} viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>

            {/* Quote */}
            <p className="text-foreground-muted leading-relaxed text-sm mb-6">
              &ldquo;{t.text}&rdquo;
            </p>

            {/* Author */}
            <div className="border-t border-border/40 pt-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-foreground">{t.name}</p>
                <Link
                  href={t.productHref}
                  className="text-xs text-muted hover:text-accent transition-colors"
                >
                  {t.product}
                </Link>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] text-success font-medium">
                <CheckCircle size={12} />
                Verified
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
