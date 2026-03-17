"use client";

import { TESTIMONIALS } from "@/lib/constants";

export default function Testimonials() {
  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
        What Pet Parents Say
      </h2>
      <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 scrollbar-hide">
        {TESTIMONIALS.map((t) => (
          <div
            key={t.id}
            className="bg-white p-6 md:p-8 rounded-2xl shadow-card min-w-[300px] flex-shrink-0 snap-start"
          >
            {/* Stars */}
            <div className="text-amber-400 text-lg mb-3">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className={i < t.rating ? "opacity-100" : "opacity-30"}>
                  &#9733;
                </span>
              ))}
            </div>

            {/* Quote */}
            <p className="text-foreground italic leading-relaxed">
              &ldquo;{t.text}&rdquo;
            </p>

            {/* Divider */}
            <div className="border-t border-border my-4" />

            {/* Author */}
            <p className="font-semibold text-sm">{t.name}</p>
            <p className="text-sm text-muted">{t.product}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
