"use client";

import { Smartphone, Sparkles, ShieldCheck, Trophy } from "lucide-react";

const features = [
  {
    icon: Smartphone,
    title: "Smart Technology",
    description:
      "Control feeding, hydration, and litter from your phone with our intuitive app.",
  },
  {
    icon: Sparkles,
    title: "Easy to Clean",
    description:
      "Self-cleaning designs and dishwasher-safe parts save you hours every week.",
  },
  {
    icon: ShieldCheck,
    title: "Safe & Certified",
    description:
      "BPA-free, food-grade materials that are vet-approved for your pet's safety.",
  },
  {
    icon: Trophy,
    title: "Award-Winning Design",
    description:
      "Recognized for innovation and aesthetics — products you're proud to display.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-surface py-24 md:py-32">
      <div className="container-main">
        <div className="text-center mb-16">
          <span className="text-overline tracking-[0.25em] uppercase text-muted block mb-3">
            The PETLIBRO Difference
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Crafted for Modern Pet Parents
          </h2>
          <p className="text-muted mt-4 max-w-lg mx-auto text-sm">
            Smart technology meets thoughtful design to give your pets the care
            they deserve.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="text-center p-6"
            >
              <div className="w-16 h-16 rounded-full bg-gold-light flex items-center justify-center mx-auto ring-1 ring-gold/20">
                <feature.icon className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-semibold text-base mt-5 text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm text-muted mt-2 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
