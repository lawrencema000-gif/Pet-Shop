"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductShowcaseProps {
  title: string;
  description: string;
  features: string[];
  imageUrl: string;
  href: string;
  reversed?: boolean;
}

export default function ProductShowcase({
  title,
  description,
  features,
  imageUrl,
  href,
  reversed = false,
}: ProductShowcaseProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="container-main py-16 md:py-24">
      <div
        className={cn(
          "grid md:grid-cols-2 gap-10 md:gap-16 items-center",
          reversed && "md:[&>*:first-child]:order-2"
        )}
      >
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: reversed ? 40 : -40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative aspect-[4/3] rounded-premium-xl overflow-hidden"
        >
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 750px) 100vw, 50vw"
            className="object-cover"
          />
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, x: reversed ? -40 : 40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          className="space-y-4"
        >
          <p className="text-sm uppercase tracking-wider text-muted">
            Collection
          </p>
          <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>
          <p className="text-muted leading-relaxed">{description}</p>
          <ul className="space-y-3 pt-2">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
          <div className="pt-4">
            <Link
              href={href}
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:opacity-70 transition-opacity"
            >
              Explore Collection &rarr;
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
