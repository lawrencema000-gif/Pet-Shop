"use client";

import Link from "next/link";
import { TESTIMONIALS } from "@/lib/constants";

export default function Testimonials() {
  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-foreground">
        What Pet Parents Say
      </h2>
      <p className="text-muted text-center mb-10 max-w-lg mx-auto">
        Thousands of happy pet parents trust PETLIBRO.
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {TESTIMONIALS.slice(0, 3).map((t) => (
          <div
            key={t.id}
            className="border border-border p-6 md:p-8"
          >
            {/* Stars */}
            <div className="text-amber-400 text-lg mb-3">
              {Array.from({ length: 5 }, (_, i) => (
                <span
                  key={i}
                  className={i < t.rating ? "opacity-100" : "opacity-30"}
                >
                  &#9733;
                </span>
              ))}
            </div>

            {/* Quote */}
            <p className="text-foreground leading-relaxed text-sm mb-4">
              &ldquo;{t.text}&rdquo;
            </p>

            {/* Author */}
            <div className="border-t border-border pt-4">
              <p className="font-medium text-sm text-foreground">{t.name}</p>
              <Link
                href={t.productHref}
                className="text-xs text-muted hover:text-accent transition-colors"
              >
                {t.product}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
