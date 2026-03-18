"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Check } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";

interface Bundle {
  id: string;
  name: string;
  description: string;
  items: string[];
  originalPrice: number;
  bundlePrice: number;
  image: string;
  badge?: string;
}

const BUNDLES: Bundle[] = [
  {
    id: "complete-care",
    name: "Complete Care Set",
    description:
      "Everything your pet needs for a fully automated care routine. Our most popular bundle for first-time smart pet parents.",
    items: [
      "Granary Smart Camera Feeder",
      "Dockstream 2 Smart Water Fountain",
      "Premium Filter 3-Pack",
      "Stainless Steel Food Bowl",
    ],
    originalPrice: 329.96,
    bundlePrice: 249.99,
    image:
      "https://images.unsplash.com/photo-1583337130417-13104dec14c7?w=800&h=600&fit=crop",
    badge: "Best Seller",
  },
  {
    id: "cat-parent-pro",
    name: "Cat Parent Pro",
    description:
      "The ultimate cat care bundle. Covers feeding, hydration, and litter — all connected through one app for complete peace of mind.",
    items: [
      "Granary Smart Camera Feeder",
      "Dockstream 2 Smart Water Fountain",
      "Luma Self-Cleaning Litter Box",
      "Carbon Filter 6-Pack",
    ],
    originalPrice: 849.96,
    bundlePrice: 649.99,
    image:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&h=600&fit=crop",
    badge: "Best Value",
  },
  {
    id: "hydration-station",
    name: "Hydration Station",
    description:
      "Keep your pet perfectly hydrated with our premium water fountain bundle. Includes everything for a full year of fresh, filtered water.",
    items: [
      "Dockstream 2 Smart Water Fountain",
      "Replacement Pump",
      "Premium Filter 6-Pack",
      "Cleaning Brush Kit",
    ],
    originalPrice: 189.96,
    bundlePrice: 149.99,
    image:
      "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=800&h=600&fit=crop",
  },
  {
    id: "multi-pet-feeder",
    name: "Multi-Pet Feeding Kit",
    description:
      "Perfect for multi-pet households. RFID technology ensures each pet gets exactly the right food — no more food stealing.",
    items: [
      "One RFID Smart Feeder x2",
      "RFID Collar Tags x4",
      "Feeder Mat (Large)",
      "Food Storage Container",
    ],
    originalPrice: 479.96,
    bundlePrice: 379.99,
    image:
      "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=600&fit=crop",
  },
];

export default function BundlesPage() {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddBundle = (bundle: Bundle) => {
    addItem({
      id: `bundle-${bundle.id}`,
      product_id: `bundle-${bundle.id}`,
      variant_id: null,
      name: bundle.name,
      variant_name: "Bundle",
      price: bundle.bundlePrice,
      compare_at_price: bundle.originalPrice,
      image_url: bundle.image,
      slug: `/bundles#${bundle.id}`,
    });
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-surface-light">
        <nav className="container-main flex items-center gap-2 py-3 text-sm text-muted">
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">Bundles</span>
        </nav>
      </div>

      {/* Hero */}
      <section className="bg-surface py-14 md:py-20">
        <div className="container-main text-center">
          <span className="inline-block rounded-full bg-success/10 px-4 py-1.5 text-sm font-semibold text-success">
            Save More Together
          </span>
          <h1 className="mt-4 text-4xl font-bold text-foreground md:text-6xl">
            Bundle &amp; Save
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted md:text-lg">
            Get everything your pet needs in one smart package. Save up to 25%
            compared to buying individually.
          </p>
        </div>
      </section>

      {/* Bundles Grid */}
      <section className="container-main py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2">
          {BUNDLES.map((bundle) => {
            const savings = bundle.originalPrice - bundle.bundlePrice;
            const savingsPercent = Math.round(
              (savings / bundle.originalPrice) * 100
            );

            return (
              <article
                key={bundle.id}
                className="group overflow-hidden rounded-md border border-border bg-background shadow-card transition-shadow hover:shadow-card-hover"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-surface">
                  <Image
                    src={bundle.image}
                    alt={bundle.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 750px) 100vw, 50vw"
                  />
                  {bundle.badge && (
                    <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-bold text-white">
                      {bundle.badge}
                    </span>
                  )}
                  <span className="absolute right-3 top-3 rounded-full bg-success px-3 py-1 text-xs font-bold text-white">
                    Save {savingsPercent}%
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 md:p-6">
                  <h3 className="text-xl font-bold text-foreground">
                    {bundle.name}
                  </h3>
                  <p className="mt-2 text-sm text-muted leading-relaxed">
                    {bundle.description}
                  </p>

                  {/* Items */}
                  <ul className="mt-4 space-y-2">
                    {bundle.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-center gap-2 text-sm text-foreground-muted"
                      >
                        <Check className="h-4 w-4 shrink-0 text-success" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  {/* Pricing */}
                  <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-foreground">
                          ${bundle.bundlePrice.toFixed(2)}
                        </span>
                        <span className="text-sm text-muted line-through">
                          ${bundle.originalPrice.toFixed(2)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs font-medium text-success">
                        You save ${savings.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAddBundle(bundle)}
                      className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                    >
                      Add Bundle
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Why Bundle */}
      <section className="border-t border-border bg-surface-light py-14 md:py-16">
        <div className="container-main">
          <h2 className="mb-10 text-center text-2xl font-bold text-foreground md:text-3xl">
            Why Bundle?
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Save Up to 25%",
                description:
                  "Bundling saves you money compared to buying each product separately. The more you bundle, the more you save.",
              },
              {
                title: "One Connected App",
                description:
                  "All PETLIBRO devices work together in one app. Monitor feeding, hydration, and litter box usage from a single dashboard.",
              },
              {
                title: "Free Shipping",
                description:
                  "Every bundle qualifies for free shipping, no minimum required. Your complete setup arrives at your door, hassle-free.",
              },
              {
                title: "Extended Warranty",
                description:
                  "Bundle purchases receive an extended 2-year warranty on all included devices, doubling the standard coverage.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <h3 className="text-base font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
