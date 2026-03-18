"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Smartphone, Wifi, Sparkles, ShieldCheck } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Smartphone,
    title: "Smart App Control",
    description:
      "Monitor and manage feeding schedules, water intake, and more from your phone.",
    stat: "100K+",
    statLabel: "Meals Served",
  },
  {
    icon: Wifi,
    title: "Connected Living",
    description:
      "All devices connect seamlessly through our intuitive mobile app.",
    stat: "50+",
    statLabel: "Connected Devices",
  },
  {
    icon: Sparkles,
    title: "Easy Maintenance",
    description:
      "Self-cleaning designs and dishwasher-safe parts make life easier.",
    stat: "90%",
    statLabel: "Less Cleaning Time",
  },
  {
    icon: ShieldCheck,
    title: "Safe & Certified",
    description:
      "BPA-free materials and food-grade components for your pet's safety.",
    stat: "100%",
    statLabel: "Vet Approved",
  },
];

export default function WhyChooseUs() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="relative bg-surface py-16 md:py-24 overflow-hidden"
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="container-main relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold">
            Why Pet Parents Love Us
          </h2>
          <p className="text-muted mt-3 max-w-lg mx-auto">
            Smart technology meets thoughtful design to give your pets the care
            they deserve.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center p-6 bg-background rounded-premium-lg shadow-card"
            >
              <div className="rounded-full bg-accent-light p-5 w-20 h-20 mx-auto flex items-center justify-center">
                <feature.icon className="w-9 h-9 text-accent" />
              </div>
              <h3 className="font-semibold text-lg mt-4">{feature.title}</h3>
              <p className="text-sm text-muted mt-2">{feature.description}</p>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xl font-bold text-accent">{feature.stat}</p>
                <p className="text-xs text-muted">{feature.statLabel}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-12"
        >
          <Link
            href="/about"
            className="inline-flex items-center gap-2 bg-accent text-white px-8 py-3 rounded-premium text-sm font-semibold hover:bg-accent-dark transition-colors"
          >
            Learn More About Us &rarr;
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
