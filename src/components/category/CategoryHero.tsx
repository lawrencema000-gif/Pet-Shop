"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface CategoryHeroProps {
  name: string;
  description?: string;
  imageUrl?: string;
}

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1600&h=500&fit=crop&q=80";

export default function CategoryHero({
  name,
  description,
  imageUrl,
}: CategoryHeroProps) {
  return (
    <div className="relative w-full h-48 sm:h-56 md:h-72 rounded-premium-lg overflow-hidden mb-8">
      <Image
        src={imageUrl || DEFAULT_IMAGE}
        alt={name}
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 flex flex-col justify-center px-8 md:px-12"
      >
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
          {name}
        </h1>
        {description && (
          <p className="text-white/80 mt-2 max-w-xl text-sm md:text-base">
            {description}
          </p>
        )}
      </motion.div>
    </div>
  );
}
