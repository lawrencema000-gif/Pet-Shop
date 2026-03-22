import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  Download,
  FileText,
  Image,
  BookOpen,
  ArrowRight,
  Mail,
  Calendar,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Press | PETLIBRO",
  description: "PETLIBRO press information, brand assets, and media contact.",
};

const brandAssets = [
  {
    icon: FileText,
    title: "Logo Pack",
    description:
      "Primary logo, wordmark, and icon in SVG, PNG, and EPS formats for light and dark backgrounds.",
  },
  {
    icon: BookOpen,
    title: "Brand Guidelines",
    description:
      "Typography, color palette, voice and tone, logo usage rules, and spacing requirements.",
  },
  {
    icon: Image,
    title: "Product Photos",
    description:
      "High-resolution lifestyle and studio product photography, ready for editorial use.",
  },
];

const pressReleases = [
  {
    date: "March 15, 2026",
    title: "PETLIBRO Launches Luma XL Smart Litter Box",
    excerpt:
      "The new Luma XL features a 30% larger interior, whisper-quiet operation, and enhanced Video Cloud AI for multi-cat households. Available for pre-order starting today.",
  },
  {
    date: "January 22, 2026",
    title: "PETLIBRO Reaches 2 Million Pets Served",
    excerpt:
      "PETLIBRO celebrates a major milestone as over two million pets worldwide now use its connected ecosystem of smart feeders, fountains, and litter boxes.",
  },
  {
    date: "January 8, 2026",
    title: "CES 2026: PETLIBRO Unveils AquaStream Pro",
    excerpt:
      "Debuted at CES 2026, the AquaStream Pro smart fountain features real-time water quality monitoring, UV-C sterilization, and seamless app integration.",
  },
  {
    date: "November 12, 2025",
    title: "PETLIBRO Raises Series B to Expand Smart Pet Care",
    excerpt:
      "PETLIBRO announces a $45M Series B funding round led by Accel Partners, with plans to accelerate international expansion and deepen AI-powered health insights.",
  },
];

const mediaLogos = [
  "TechCrunch",
  "The Verge",
  "WIRED",
  "Pet Business Magazine",
];

export default function PressPage() {
  return (
    <>
      <div className="container-main">
        <Breadcrumb items={[{ label: "Press & Media" }]} />
      </div>

      <div className="container-main pb-20">
        {/* Hero Section */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Press &amp; Media
          </h1>
          <p className="text-muted text-lg leading-relaxed max-w-2xl mx-auto">
            PETLIBRO is a smart pet care brand building connected products that
            keep pets healthy, happy, and well-fed. We combine thoughtful design
            with modern technology to help pet parents care for their furry
            companions.
          </p>
        </div>

        {/* Brand Assets */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">
            Brand Assets
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {brandAssets.map((asset) => (
              <div
                key={asset.title}
                className="p-6 rounded-xl border border-border hover:shadow-card transition-shadow text-center group"
              >
                <div className="p-3 rounded-lg bg-surface inline-flex mb-4">
                  <asset.icon size={24} className="text-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {asset.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed mb-4">
                  {asset.description}
                </p>
                <button
                  className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-dark transition-colors"
                  disabled
                >
                  <Download size={14} />
                  Coming Soon
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Press Releases */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-2xl font-bold text-foreground text-center mb-3">
            Press Releases
          </h2>
          <p className="text-muted text-center mb-10 max-w-lg mx-auto">
            The latest news and announcements from PETLIBRO.
          </p>
          <div className="space-y-4">
            {pressReleases.map((release) => (
              <div
                key={release.title}
                className="p-6 rounded-xl border border-border hover:shadow-card transition-shadow group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={13} className="text-muted" />
                  <span className="text-xs font-medium text-muted">
                    {release.date}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-2">
                  {release.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed mb-3">
                  {release.excerpt}
                </p>
                <Link
                  href="#"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-dark transition-colors"
                >
                  Read More
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* In the Media */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">
            In the Media
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {mediaLogos.map((name) => (
              <div
                key={name}
                className="px-6 py-3 rounded-lg bg-surface border border-border text-sm font-semibold text-muted tracking-wide"
              >
                {name}
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-accent rounded-lg p-10 text-center text-white">
            <h2 className="text-2xl font-bold mb-3">Media Inquiries</h2>
            <p className="text-white/80 mb-6 max-w-md mx-auto">
              For press inquiries, interview requests, or access to brand assets,
              reach out to our communications team.
            </p>
            <a
              href="mailto:press@petlibro.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-accent rounded-lg font-medium hover:bg-white/90 transition-colors"
            >
              <Mail size={16} />
              press@petlibro.com
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
