"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const spotlightProducts = [
  {
    id: "feeders",
    tab: "Smart Feeders",
    title: "Granary Smart Camera Feeder",
    description:
      "Schedule meals, monitor portions, and watch your pet eat from anywhere with the built-in HD camera and two-way audio.",
    price: "$139.99",
    image:
      "https://images.unsplash.com/photo-1450778869180-e77d3083dbb0?w=800&h=600&fit=crop",
    href: "/categories/pet-feeders",
  },
  {
    id: "fountains",
    tab: "Water Fountains",
    title: "Dockstream 2 Smart Fountain",
    description:
      "5-stage filtration, ultra-quiet pump, and real-time water level monitoring keep your pet hydrated and healthy.",
    price: "$79.99",
    image:
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=600&fit=crop",
    href: "/categories/water-fountains",
  },
  {
    id: "litter",
    tab: "Litter Boxes",
    title: "Luma Smart Litter Box",
    description:
      "Automatic self-cleaning with Video Cloud AI health monitoring. Whisper-quiet operation for up to 3 cats.",
    price: "$399.99",
    image:
      "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=800&h=600&fit=crop",
    href: "/categories/litter-boxes",
  },
];

export default function ProductSpotlight() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = spotlightProducts[activeIndex];

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container-main">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Featured Products
          </h2>
          <p className="text-muted mt-3 max-w-md mx-auto">
            Explore our most popular smart pet care solutions.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-1 mb-10">
          {spotlightProducts.map((product, i) => (
            <button
              key={product.id}
              onClick={() => setActiveIndex(i)}
              className={`px-5 py-2.5 text-sm font-medium transition-colors ${
                i === activeIndex
                  ? "bg-foreground text-white"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {product.tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-2 gap-10 items-center max-w-5xl mx-auto">
          {/* Image */}
          <div className="relative aspect-[4/3] bg-surface-light overflow-hidden">
            <Image
              key={active.id}
              src={active.image}
              alt={active.title}
              fill
              sizes="(max-width: 750px) 100vw, 50vw"
              className="object-cover fade-in"
            />
          </div>

          {/* Info */}
          <div key={active.id} className="fade-in">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground">
              {active.title}
            </h3>
            <p className="text-muted mt-4 leading-relaxed">
              {active.description}
            </p>
            <p className="text-xl font-bold text-foreground mt-4">
              {active.price}
            </p>
            <Link
              href={active.href}
              className="inline-flex items-center bg-accent text-white px-8 py-3 text-sm font-semibold mt-6 hover:bg-accent-dark transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
