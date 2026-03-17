"use client";

import { Award, Zap, Heart } from "lucide-react";

export default function WhyChooseSection() {
  const benefits = [
    {
      icon: Award,
      title: "Premium Quality",
      description:
        "Crafted with the finest materials and rigorous quality standards to ensure lasting durability for your pet.",
    },
    {
      icon: Zap,
      title: "Smart Technology",
      description:
        "Powered by intelligent features that simplify pet care and adapt to your pet's unique needs and habits.",
    },
    {
      icon: Heart,
      title: "Pet-Approved Design",
      description:
        "Designed with your pet's comfort and safety in mind, tested and loved by thousands of happy pets.",
    },
  ];

  return (
    <section className="py-12 border-t border-border">
      <h2 className="text-2xl font-bold text-foreground text-center mb-10">
        Why Choose This Product
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {benefits.map((benefit) => (
          <div
            key={benefit.title}
            className="flex flex-col items-center text-center space-y-4 p-6 rounded-xl bg-surface/50"
          >
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
              <benefit.icon className="w-7 h-7 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              {benefit.title}
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              {benefit.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
