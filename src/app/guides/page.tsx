import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, BookOpen, ArrowRight } from "lucide-react";
import { GUIDES } from "@/lib/guides-data";

export const metadata: Metadata = {
  title: "Buying Guides | Pet and Angels",
  description:
    "Expert buying guides to help you find the perfect smart pet products. Compare feeders, water fountains, litter boxes, and more.",
};

export default function GuidesPage() {
  return (
    <>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-surface-light">
        <nav className="container-main flex items-center gap-2 py-3 text-sm text-muted">
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">Buying Guides</span>
        </nav>
      </div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-accent/5 via-background to-accent/5 py-14 md:py-20">
        <div className="container-main text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent">
            <BookOpen className="h-4 w-4" />
            Expert Advice
          </span>
          <h1 className="mt-4 text-4xl font-bold text-foreground md:text-6xl">
            Expert Buying Guides
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted md:text-lg">
            Not sure which product is right for you? Our in-depth guides break
            down everything you need to know — features, prices, and
            recommendations tailored to your pet and lifestyle.
          </p>
        </div>
      </section>

      {/* Guides Grid */}
      <section className="container-main py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-3">
          {GUIDES.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="group overflow-hidden rounded-md border border-border bg-background shadow-card transition-shadow hover:shadow-card-hover"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-surface">
                <Image
                  src={guide.image}
                  alt={guide.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 750px) 100vw, 33vw"
                />
              </div>
              <div className="p-5 md:p-6">
                <p className="text-xs font-medium text-accent uppercase tracking-wide">
                  {guide.readTime}
                </p>
                <h3 className="mt-2 text-lg font-bold text-foreground group-hover:text-accent transition-colors">
                  {guide.title}
                </h3>
                <p className="mt-2 text-sm text-muted leading-relaxed line-clamp-3">
                  {guide.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                  Read Guide
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-surface-light py-14 md:py-16">
        <div className="container-main text-center">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">
            Still not sure?
          </h2>
          <p className="mt-3 text-muted max-w-md mx-auto">
            Answer a few quick questions and we&apos;ll recommend the perfect
            products for your pet&apos;s needs.
          </p>
          <Link
            href="/help-me-choose"
            className="mt-6 inline-block rounded-full bg-accent px-8 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Take the Help Me Choose Quiz
          </Link>
        </div>
      </section>
    </>
  );
}
