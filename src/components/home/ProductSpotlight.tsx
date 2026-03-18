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
    <section className="py-20 md:py-32 bg-surface-light">
      <div className="container-main">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-3 block">
            Featured Collection
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Smart Solutions for Every Pet
          </h2>
          <p className="text-muted mt-4 max-w-lg mx-auto text-base">
            Technology-driven products designed to simplify pet care and keep
            your companions happy and healthy.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-1 mb-14">
          {spotlightProducts.map((product, i) => (
            <button
              key={product.id}
              onClick={() => setActiveIndex(i)}
              className={`px-6 py-3 text-sm font-medium transition-all duration-200 ${
                i === activeIndex
                  ? "bg-foreground text-white"
                  : "text-muted hover:text-foreground hover:bg-surface"
              }`}
            >
              {product.tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Image */}
          <div className="relative aspect-square bg-white overflow-hidden">
            <Image
              key={active.id}
              src={active.image}
              alt={active.title}
              fill
              sizes="(max-width: 750px) 100vw, 50vw"
              className="object-cover fade-in"
            />
            {/* Label badge */}
            <span className="absolute top-4 left-4 bg-accent text-white text-[10px] font-bold tracking-wider uppercase px-3 py-1.5">
              {active.label}
            </span>
          </div>

          {/* Info */}
          <div key={active.id} className="fade-in">
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-accent mb-3">
              {active.subtitle}
            </p>
            <h3 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
              {active.title}
            </h3>
            <p className="text-muted mt-5 leading-relaxed text-base">
              {active.description}
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 mt-6">
              {active.features.map((feature) => (
                <span
                  key={feature}
                  className="px-3 py-1.5 text-xs font-medium bg-white border border-border text-foreground"
                >
                  {feature}
                </span>
              ))}
            </div>

            {/* Price */}
            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-2xl font-bold text-foreground">
                {active.price}
              </span>
              <span className="text-base text-muted line-through">
                {active.comparePrice}
              </span>
            </div>

            <Link
              href={active.href}
              className="group inline-flex items-center gap-2 bg-accent text-white px-10 py-4 text-sm font-semibold mt-8 hover:bg-accent-dark transition-colors"
            >
              Shop Now
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
