"use client";

import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { useRef, useState } from "react";

export default function HeroBanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <section className="relative w-full h-[85vh] min-h-[600px] max-h-[900px] overflow-hidden bg-foreground">
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

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-black/20" />

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container-main">
          <div className="max-w-2xl slide-up">
            <span className="inline-block text-white/80 text-xs font-semibold tracking-[0.2em] uppercase mb-6">
              Next-Generation Pet Care
            </span>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.95] tracking-tight">
              Smarter
              <br />
              Care.
            </h1>

            <p className="text-white/70 mt-6 text-lg md:text-xl max-w-lg leading-relaxed">
              App-controlled feeders, self-cleaning litter boxes, and smart
              fountains. Technology that keeps your pets happy.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
              <Link
                href="/products"
                className="group inline-flex items-center gap-3 bg-white text-foreground px-10 py-4 text-sm font-semibold hover:bg-white/90 transition-all duration-200"
              >
                Shop Collection
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
              <Link
                href="/categories/pet-feeders"
                className="inline-flex items-center gap-3 border border-white/40 text-white px-10 py-4 text-sm font-semibold hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
              >
                <Play size={14} className="fill-white" />
                Watch How It Works
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-8 text-white/50 text-xs font-medium tracking-wide">
              <span>Free Shipping $75+</span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span>30-Day Returns</span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span>1-Year Warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="w-5 h-8 rounded-full border-2 border-white/30 flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 rounded-full bg-white/60 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
