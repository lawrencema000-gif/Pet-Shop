"use client";

import { Smartphone, Sparkles, ShieldCheck } from "lucide-react";

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
];

export default function WhyChooseUs() {
  return (
    <section className="bg-surface py-16 md:py-24">
      <div className="container-main">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Why Pet Parents Love Us
          </h2>
          <p className="text-muted mt-3 max-w-lg mx-auto">
            Smart technology meets thoughtful design to give your pets the care
            they deserve.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="text-center p-8"
            >
              <div className="w-14 h-14 rounded-full bg-accent-light flex items-center justify-center mx-auto">
                <feature.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-lg mt-5 text-foreground">
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
