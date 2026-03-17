"use client";

import Link from "next/link";
import { TESTIMONIALS } from "@/lib/constants";
import { BadgeCheck } from "lucide-react";

export default function Testimonials() {
  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
        What Pet Parents Say
      </h2>
      <p className="text-muted text-center mb-10 max-w-lg mx-auto">
        Thousands of happy pet parents trust PETLIBRO. Here&apos;s what they
        have to say.
      </p>

      {/* 3-column grid on desktop, single column on mobile */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TESTIMONIALS.slice(0, 6).map((t) => (
          <div
            key={t.id}
            className="bg-white p-6 md:p-8 rounded-2xl shadow-card flex flex-col"
          >
            {/* Stars */}
            <div className="text-amber-400 text-xl mb-3">
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
            <p className="text-foreground leading-relaxed flex-1 text-sm">
              &ldquo;{t.text}&rdquo;
            </p>

            {/* Divider */}
            <div className="border-t border-border my-4" />

            {/* Author row */}
            <div className="flex items-center gap-3">
              {/* Avatar with initials */}
              <div
                className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}
              >
                {t.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">{t.name}</p>
                  {t.verified && (
                    <span className="inline-flex items-center gap-1 text-xs text-success font-medium">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  )}
                </div>
                <Link
                  href={t.productHref}
                  className="text-xs text-muted hover:text-accent transition-colors truncate block"
                >
                  {t.product}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
