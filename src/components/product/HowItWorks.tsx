"use client";

import { motion } from "framer-motion";
import { Zap, Smartphone, Heart } from "lucide-react";

const steps = [
  {
    number: 1,
    icon: Zap,
    title: "Set Up in Minutes",
    description:
      "Unbox, plug in, and follow the simple setup guide. No tools required.",
  },
  {
    number: 2,
    icon: Smartphone,
    title: "Connect the App",
    description:
      "Download the PETLIBRO app and pair your device via Wi-Fi in seconds.",
  },
  {
    number: 3,
    icon: Heart,
    title: "Enjoy Peace of Mind",
    description:
      "Monitor, schedule, and care for your pet from anywhere, anytime.",
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-surface-light rounded-2xl p-8 mt-16">
      <h2 className="text-2xl font-bold text-foreground text-center mb-8">
        How It Works
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.15 }}
            className="flex flex-col items-center text-center"
          >
            {/* Number badge */}
            <div className="relative mb-4">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                <step.icon className="w-7 h-7 text-accent" />
              </div>
              <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center">
                {step.number}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {step.title}
            </h3>
            <p className="text-sm text-muted leading-relaxed max-w-xs">
              {step.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
