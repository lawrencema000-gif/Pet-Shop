"use client";

import { motion } from "framer-motion";
import { Shield, Cpu, Sparkles, Stethoscope } from "lucide-react";

const benefits = [
  {
    icon: Shield,
    title: "Premium Materials",
    description: "Built with food-safe, BPA-free materials for lasting quality.",
  },
  {
    icon: Cpu,
    title: "Smart Technology",
    description: "App-connected with real-time monitoring and scheduling.",
  },
  {
    icon: Sparkles,
    title: "Easy to Clean",
    description: "Dishwasher-safe parts and tool-free disassembly.",
  },
  {
    icon: Stethoscope,
    title: "Vet Recommended",
    description: "Designed with veterinary input for pet health and safety.",
  },
];

export default function BenefitsSection() {
  return (
    <section className="bg-surface-light rounded-premium-xl p-8 mt-16">
      <h2 className="text-2xl font-bold text-foreground text-center mb-8">
        Why Your Pet Will Love This
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {benefits.map((benefit, i) => (
          <motion.div
            key={benefit.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="flex flex-col items-center text-center"
          >
            <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-3">
              <benefit.icon className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">
              {benefit.title}
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              {benefit.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
