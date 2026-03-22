import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  PawPrint,
  BookOpen,
  HeartPulse,
  Laptop,
  MapPin,
  Building2,
  ArrowRight,
  Mail,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers | PETLIBRO",
  description: "Join the PETLIBRO team. We're always looking for passionate pet lovers.",
};

const perks = [
  {
    icon: PawPrint,
    title: "Pet-Friendly Office",
    description:
      "Bring your furry (or scaly) companion to work every day. Our offices are designed with pets in mind — treats, play areas, and all.",
  },
  {
    icon: BookOpen,
    title: "Growth & Learning",
    description:
      "$2,000 annual learning budget, conference passes, internal mentorship programs, and dedicated time for personal projects.",
  },
  {
    icon: HeartPulse,
    title: "Health & Wellness",
    description:
      "Comprehensive medical, dental, and vision coverage. Plus a monthly wellness stipend for gym, therapy, or whatever keeps you thriving.",
  },
  {
    icon: Laptop,
    title: "Remote Flexibility",
    description:
      "Hybrid and fully-remote options available. We trust you to do your best work from wherever you and your pet feel most comfortable.",
  },
];

const openPositions = [
  {
    title: "Senior Frontend Engineer",
    department: "Engineering",
    location: "Remote",
    description:
      "Build the next generation of our e-commerce platform and PETLIBRO app using React, Next.js, and TypeScript. You'll shape the interfaces that millions of pet parents interact with daily.",
  },
  {
    title: "Product Designer",
    department: "Design",
    location: "NYC / Remote",
    description:
      "Own end-to-end product design for our connected pet devices and digital experiences. From user research to high-fidelity prototypes, you'll define how people experience PETLIBRO.",
  },
  {
    title: "Customer Success Lead",
    department: "Support",
    location: "Austin, TX",
    description:
      "Lead our customer success team and build processes that turn pet parents into lifelong PETLIBRO advocates. You'll shape support strategy and mentor a growing team.",
  },
  {
    title: "Supply Chain Analyst",
    department: "Operations",
    location: "NYC",
    description:
      "Optimize our global supply chain to ensure PETLIBRO products reach pet parents faster and more sustainably. You'll work cross-functionally with manufacturing and logistics partners.",
  },
];

export default function CareersPage() {
  return (
    <>
      <div className="container-main">
        <Breadcrumb items={[{ label: "Careers" }]} />
      </div>

      <div className="container-main pb-20">
        {/* Hero Section */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Join the PETLIBRO Pack
          </h1>
          <p className="text-muted text-lg leading-relaxed max-w-2xl mx-auto">
            We&apos;re building the future of pet care — and we need passionate,
            creative people who believe pets deserve better. If you love solving
            hard problems and have a soft spot for animals, you&apos;ll fit right in.
          </p>
        </div>

        {/* Why PETLIBRO Section */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">
            Why PETLIBRO?
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {perks.map((perk) => (
              <div
                key={perk.title}
                className="p-6 rounded-xl border border-border hover:shadow-card transition-shadow"
              >
                <div className="p-2.5 rounded-lg bg-surface inline-flex mb-4">
                  <perk.icon size={22} className="text-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {perk.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {perk.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Open Positions */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-2xl font-bold text-foreground text-center mb-3">
            Open Positions
          </h2>
          <p className="text-muted text-center mb-10 max-w-lg mx-auto">
            We&apos;re growing fast. Find your place on the team.
          </p>
          <div className="space-y-4">
            {openPositions.map((position) => (
              <div
                key={position.title}
                className="p-6 rounded-xl border border-border hover:shadow-card transition-shadow group"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-lg mb-1">
                      {position.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-muted bg-surface px-2.5 py-1 rounded-full">
                        <Building2 size={12} />
                        {position.department}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-muted bg-surface px-2.5 py-1 rounded-full">
                        <MapPin size={12} />
                        {position.location}
                      </span>
                    </div>
                    <p className="text-sm text-muted leading-relaxed">
                      {position.description}
                    </p>
                  </div>
                  <Link
                    href={`mailto:careers@petlibro.com?subject=Application: ${position.title}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent-dark transition-colors shrink-0 self-start"
                  >
                    Apply Now
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-accent rounded-lg p-10 text-center text-white">
            <h2 className="text-2xl font-bold mb-3">
              Don&apos;t see your role?
            </h2>
            <p className="text-white/80 mb-6 max-w-md mx-auto">
              We&apos;re always looking for exceptional people. Send us your resume
              and tell us why you&apos;d be a great addition to the pack.
            </p>
            <a
              href="mailto:careers@petlibro.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-accent rounded-lg font-medium hover:bg-white/90 transition-colors"
            >
              <Mail size={16} />
              careers@petlibro.com
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
