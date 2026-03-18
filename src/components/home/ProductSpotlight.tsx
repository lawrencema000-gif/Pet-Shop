"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const spotlightProducts = [
  {
    id: "feeders",
    tab: "Smart Feeders",
    label: "Best Seller",
    title: "Granary Smart Camera Feeder",
    subtitle: "Wi-Fi · HD Camera · App Control",
    description:
      "Schedule meals, monitor portions, and watch your pet eat from anywhere with the built-in HD camera and two-way audio. Compatible with iOS and Android.",
    price: "$139.99",
    comparePrice: "$179.99",
    features: ["HD Camera", "App Control", "Voice Recording", "Portion Control"],
    image:
      "https://images.unsplash.com/photo-1583337130417-13104dec14a8?w=800&h=800&fit=crop",
    href: "/categories/pet-feeders",
  },
  {
    id: "fountains",
    tab: "Water Fountains",
    label: "New Arrival",
    title: "Dockstream 2 Smart Fountain",
    subtitle: "5-Stage Filtration · Ultra-Quiet",
    description:
      "5-stage filtration, ultra-quiet pump, and real-time water level monitoring keep your pet hydrated and healthy. Dishwasher-safe components.",
    price: "$79.99",
    comparePrice: "$99.99",
    features: ["5-Stage Filter", "Ultra-Quiet", "LED Indicator", "Easy Clean"],
    image:
      "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=800&h=800&fit=crop",
    href: "/categories/water-fountains",
  },
  {
    id: "litter",
    tab: "Litter Boxes",
    label: "Premium",
    title: "Luma Smart Litter Box",
    subtitle: "Self-Cleaning · AI Health Monitor",
    description:
      "Automatic self-cleaning with Video Cloud AI health monitoring. Whisper-quiet operation supports up to 3 cats. Odor-lock sealed waste drawer.",
    price: "$399.99",
    comparePrice: "$499.99",
    features: ["Self-Cleaning", "AI Health", "Multi-Cat", "Odor Lock"],
    image:
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800&h=800&fit=crop",
    href: "/categories/litter-boxes",
  },
];

export default function ProductSpotlight() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = spotlightProducts[activeIndex];

  return (
    <section className="py-24 md:py-32 bg-surface-light">
      <div className="container-main">
        <div className="text-center mb-14">
          <span className="text-overline tracking-[0.25em] uppercase text-muted block mb-3">
            Featured Collection
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Smart Solutions for Every Pet
          </h2>
          <p className="text-muted mt-4 max-w-lg mx-auto text-sm">
            Technology-driven products designed to simplify pet care and keep
            your companions happy and healthy.
          </p>
        </div>

        {/* Tabs — underline style */}
        <div className="flex justify-center gap-8 mb-14 border-b border-border/60">
          {spotlightProducts.map((product, i) => (
            <button
              key={product.id}
              onClick={() => setActiveIndex(i)}
              className={`relative pb-4 text-sm font-medium transition-colors duration-300 ${
                i === activeIndex
                  ? "text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {product.tab}
              {i === activeIndex && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
              )}
            </button>
          ))}
        </div>

        {/* Content — larger image ratio */}
        <div className="grid md:grid-cols-12 gap-10 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Image — 7 cols (58%) */}
          <div className="md:col-span-7 relative aspect-[4/5] bg-white overflow-hidden">
            <Image
              key={active.id}
              src={active.image}
              alt={active.title}
              fill
              sizes="(max-width: 750px) 100vw, 58vw"
              className="object-cover fade-in"
            />
            <span className="absolute top-5 left-5 bg-accent text-white text-[10px] font-bold tracking-wider uppercase px-3 py-1.5">
              {active.label}
            </span>
          </div>

          {/* Info — 5 cols */}
          <div key={active.id} className="md:col-span-5 fade-in">
            <p className="text-overline tracking-[0.15em] uppercase text-accent mb-3">
              {active.subtitle}
            </p>
            <h3 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight">
              {active.title}
            </h3>
            <p className="text-muted mt-5 leading-relaxed text-sm">
              {active.description}
            </p>

            {/* Feature pills — thin border */}
            <div className="flex flex-wrap gap-2 mt-6">
              {active.features.map((feature) => (
                <span
                  key={feature}
                  className="px-3 py-1 text-xs font-medium border border-border/80 text-foreground-muted"
                >
                  {feature}
                </span>
              ))}
            </div>

            {/* Price with savings */}
            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-2xl font-bold text-foreground">
                {active.price}
              </span>
              <span className="text-sm text-muted line-through">
                {active.comparePrice}
              </span>
              <span className="text-xs font-semibold text-gold bg-gold-light px-2 py-0.5">
                Save ${(parseFloat(active.comparePrice.replace("$", "")) - parseFloat(active.price.replace("$", ""))).toFixed(0)}
              </span>
            </div>

            <div className="text-xs text-success font-medium mt-2">
              Free shipping included
            </div>

            <Link
              href={active.href}
              className="group inline-flex items-center gap-2 bg-accent text-white px-10 py-4 text-sm font-semibold mt-8 hover:bg-accent-dark transition-colors duration-300"
            >
              Shop Now
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
