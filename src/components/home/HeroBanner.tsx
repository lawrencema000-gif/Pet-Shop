"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useRef, useState } from "react";

export default function HeroBanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <section className="relative w-full h-screen overflow-hidden bg-foreground">
      {/* Video background */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        onLoadedData={() => setVideoLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          videoLoaded ? "opacity-100" : "opacity-0"
        }`}
        poster="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1920&h=1080&fit=crop&q=80"
      >
        <source
          src="https://cdn.coverr.co/videos/coverr-a-golden-retriever-lying-down-7735/1080p.mp4"
          type="video/mp4"
        />
      </video>

      {/* Poster fallback while video loads */}
      {!videoLoaded && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1920&h=1080&fit=crop&q=80')",
          }}
        />
      )}

      {/* Gradient overlays — deeper for luxury contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
      <div className="absolute inset-0 bg-black/15" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container-main">
          <div className="max-w-2xl stagger-in">
            <span className="inline-block text-white/80 text-overline tracking-[0.25em] uppercase text-shadow-sm">
              Next-Generation Pet Care
            </span>

            <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-[6.5rem] font-bold text-white leading-[0.9] tracking-tight text-shadow-hero">
              Smarter
              <br />
              Care.
            </h1>

            <p className="text-white/80 text-lg md:text-xl max-w-lg leading-relaxed text-shadow-sm">
              App-controlled feeders, self-cleaning litter boxes, and smart
              fountains — designed for pets, engineered for you.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link
                href="/products"
                className="group inline-flex items-center gap-3 bg-white text-foreground px-12 py-4.5 text-sm font-semibold tracking-wide hover:bg-white/90 transition-all duration-300"
              >
                Explore the Collection
                <ArrowRight
                  size={16}
                  className="transition-transform duration-300 group-hover:translate-x-1.5"
                />
              </Link>
              <Link
                href="/categories/pet-feeders"
                className="inline-flex items-center gap-3 border border-white/25 text-white px-12 py-4.5 text-sm font-semibold tracking-wide hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
              >
                Our Story
              </Link>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-white/70">
                <div className="flex -space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3.5 h-3.5 text-gold fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-xs font-medium">4.9</span>
              </div>
              <span className="w-px h-3 bg-white/20" />
              <span className="text-white/60 text-xs tracking-wide">Trusted by 50,000+ Pet Parents</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3">
        <span className="text-white/30 text-[10px] tracking-[0.3em] uppercase">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </section>
  );
}
