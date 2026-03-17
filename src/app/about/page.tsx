import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Heart, Zap, Shield, Leaf, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | PETLIBRO",
  description:
    "We're pet parents on a mission to make pet care smarter. Learn about PETLIBRO's story, values, and the team behind our products.",
};

const values = [
  {
    icon: Heart,
    title: "Pet-First Design",
    description:
      "Every product starts with the question: how does this make life better for pets? Comfort, safety, and happiness guide every design decision.",
  },
  {
    icon: Zap,
    title: "Smart Innovation",
    description:
      "We harness AI, IoT, and precision engineering to solve real problems — not gimmicks. Technology should simplify pet care, not complicate it.",
  },
  {
    icon: Shield,
    title: "Uncompromising Quality",
    description:
      "Food-grade stainless steel, BPA-free plastics, and rigorous testing. We use the same products at home with our own pets.",
  },
  {
    icon: Leaf,
    title: "Sustainable Practices",
    description:
      "From recyclable packaging to energy-efficient devices, we're committed to reducing our environmental footprint with every product we ship.",
  },
];

const milestones = [
  {
    year: "2019",
    title: "The Spark",
    description:
      "Founded in a small apartment by two pet parents frustrated with outdated pet care products. The first prototype: a gravity feeder with a brain.",
  },
  {
    year: "2020",
    title: "First Product Launch",
    description:
      "Launched the Granary Smart Feeder on Kickstarter, raising 400% of our goal in 48 hours. Over 5,000 backers believed in our vision.",
  },
  {
    year: "2021",
    title: "Expanding the Ecosystem",
    description:
      "Introduced the Dockstream Smart Fountain and PETLIBRO app, creating a connected ecosystem for modern pet parents.",
  },
  {
    year: "2022",
    title: "One Million Pets Served",
    description:
      "Crossed the milestone of one million pets using PETLIBRO products worldwide. Launched the One RFID Feeder for multi-pet households.",
  },
  {
    year: "2023",
    title: "Luma: The Future of Litter",
    description:
      "Released the Luma Smart Litter Box with Video Cloud AI — our most ambitious product yet, combining self-cleaning with health monitoring.",
  },
  {
    year: "2024",
    title: "Going Global",
    description:
      "Expanding internationally, deepening our AI health insights, and continuing to build products that pets and their parents love.",
  },
  {
    year: "2025",
    title: "Expanded to 50+ Products",
    description:
      "Grew our catalog to over 50 products, launched the PETLIBRO mobile app with real-time health insights, and introduced same-day delivery in major cities.",
  },
  {
    year: "2026",
    title: "Continuing to Innovate",
    description:
      "Continuing to innovate for happy pets everywhere. New AI-powered health monitoring, expanded accessories line, and deeper smart home integrations.",
  },
];

export default function AboutPage() {
  return (
    <>
      <div className="container-main">
        <Breadcrumb items={[{ label: "About Us" }]} />
      </div>

      <div className="container-main pb-20">
        {/* Hero Section */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Built by Pet Parents,
            <br />
            for Pet Parents
          </h1>
          <p className="text-muted text-lg leading-relaxed max-w-2xl mx-auto">
            We started PETLIBRO because we believed our pets deserved better
            than plastic bowls and manual scooping. What began as a side project
            in a Brooklyn apartment has grown into a mission to bring smart,
            thoughtful technology to pet care — one product at a time.
          </p>
        </div>

        {/* Mission */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="bg-surface rounded-2xl p-8 md:p-12 text-center">
            <p className="text-xs font-semibold tracking-widest text-muted uppercase mb-3">
              Our Mission
            </p>
            <p className="text-xl md:text-2xl font-medium text-foreground leading-relaxed max-w-2xl mx-auto">
              To empower pet parents with intelligent, beautifully designed
              products that elevate the everyday experience of caring for the
              animals we love.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">
            What We Stand For
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((value) => (
              <div
                key={value.title}
                className="p-6 rounded-xl border border-border hover:shadow-card transition-shadow"
              >
                <div className="p-2.5 rounded-lg bg-surface inline-flex mb-4">
                  <value.icon size={22} className="text-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Photo Placeholder */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="aspect-[21/9] rounded-2xl bg-surface border border-border flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm font-semibold text-muted mb-1">
                Our Team
              </p>
              <p className="text-xs text-muted/70">
                50+ passionate pet lovers across engineering, design, and
                customer care
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">
            Our Journey
          </h2>
          <div className="space-y-0">
            {milestones.map((milestone, index) => (
              <div key={milestone.year} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {milestone.year}
                  </div>
                  {index < milestones.length - 1 && (
                    <div className="w-px flex-1 bg-border my-1" />
                  )}
                </div>
                <div className="pb-10">
                  <h3 className="font-semibold text-foreground mb-1">
                    {milestone.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-accent rounded-2xl p-10 text-center text-white">
            <h2 className="text-2xl font-bold mb-3">
              Ready to upgrade your pet&apos;s life?
            </h2>
            <p className="text-white/80 mb-6 max-w-md mx-auto">
              Explore our full range of smart pet care products designed with
              love and precision.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-accent rounded-lg font-medium hover:bg-white/90 transition-colors"
            >
              Shop All Products
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
