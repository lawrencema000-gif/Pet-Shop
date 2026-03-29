"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ProductSpotlight() {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);

  const spotlightProducts = [
    {
      id: "feeders",
      tab: t('spotlight.tabFeeders'),
      label: t('spotlight.bestSeller'),
      title: t('spotlight.feederName'),
      subtitle: t('spotlight.feederSpec'),
      description: t('spotlight.feederDesc'),
      price: "$139.99",
      comparePrice: "$179.99",
      features: [t('spotlight.feederFeature1'), t('spotlight.feederFeature2'), t('spotlight.feederFeature3'), t('spotlight.feederFeature4')],
      image:
        "https://images.unsplash.com/photo-1583337130417-13104dec14a8?w=800&h=800&fit=crop",
      href: "/categories/pet-feeders",
    },
    {
      id: "fountains",
      tab: t('spotlight.tabFountains'),
      label: t('spotlight.newArrival'),
      title: t('spotlight.fountainName'),
      subtitle: t('spotlight.fountainSpec'),
      description: t('spotlight.fountainDesc'),
      price: "$79.99",
      comparePrice: "$99.99",
      features: [t('spotlight.fountainFeature1'), t('spotlight.fountainFeature2'), t('spotlight.fountainFeature3'), t('spotlight.fountainFeature4')],
      image:
        "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=800&h=800&fit=crop",
      href: "/categories/water-fountains",
    },
    {
      id: "litter",
      tab: t('spotlight.tabLitterBoxes'),
      label: t('spotlight.premium'),
      title: t('spotlight.litterName'),
      subtitle: t('spotlight.litterSpec'),
      description: t('spotlight.litterDesc'),
      price: "$399.99",
      comparePrice: "$499.99",
      features: [t('spotlight.litterFeature1'), t('spotlight.litterFeature2'), t('spotlight.litterFeature3'), t('spotlight.litterFeature4')],
      image:
        "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800&h=800&fit=crop",
      href: "/categories/litter-boxes",
    },
  ];

  const active = spotlightProducts[activeIndex];

  return (
    <section className="py-24 md:py-32 bg-surface-light">
      <div className="container-main">
        <div className="text-center mb-14">
          <span className="text-overline tracking-[0.25em] uppercase text-muted block mb-3">
            {t('spotlight.overline')}
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            {t('spotlight.heading')}
          </h2>
          <p className="text-muted mt-4 max-w-lg mx-auto text-sm">
            {t('spotlight.description')}
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
              {t('spotlight.freeShipping')}
            </div>

            <Link
              href={active.href}
              className="group inline-flex items-center gap-2 bg-accent text-white px-10 py-4 text-sm font-semibold mt-8 hover:bg-accent-dark transition-colors duration-300"
            >
              {t('common.shopNow')}
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
