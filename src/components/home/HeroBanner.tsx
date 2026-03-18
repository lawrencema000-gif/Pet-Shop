"use client";

import Image from "next/image";
import Link from "next/link";

export default function HeroBanner() {
  return (
    <section className="relative bg-surface-light overflow-hidden">
      <div className="container-main">
        <div className="grid md:grid-cols-2 items-center min-h-[480px] md:min-h-[560px] gap-8">
          {/* Left — text */}
          <div className="py-12 md:py-20">
            <p className="text-xs font-semibold tracking-widest uppercase text-accent mb-4">
              Smart Pet Care
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.08] tracking-tight">
              Smarter Care,{" "}
              <span className="text-accent">Happier Pets</span>
            </h1>
            <p className="text-muted mt-5 text-lg max-w-md leading-relaxed">
              App-controlled feeders, self-cleaning litter boxes, and smart
              fountains — designed for modern pet parents.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Link
                href="/products"
                className="inline-flex items-center bg-accent text-white px-8 py-3.5 text-sm font-semibold hover:bg-accent-dark transition-colors"
              >
                Shop Now
              </Link>
              <Link
                href="/categories/pet-feeders"
                className="inline-flex items-center border border-foreground text-foreground px-8 py-3.5 text-sm font-semibold hover:bg-foreground hover:text-white transition-colors"
              >
                Explore Feeders
              </Link>
            </div>
          </div>

          {/* Right — image */}
          <div className="relative h-[360px] md:h-[520px]">
            <Image
              src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=900&fit=crop"
              alt="Happy dog with smart pet care products"
              fill
              priority
              sizes="(max-width: 750px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
