"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Instagram, Heart } from "lucide-react";

const UGC_POSTS = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1583337130417-13104dec14a3?w=400&h=400&fit=crop",
    username: "@happypaws_daily",
    likes: 2847,
    alt: "Dog eating from smart feeder",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=400&h=400&fit=crop",
    username: "@whiskers.world",
    likes: 1923,
    alt: "Cat near water fountain",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop",
    username: "@goldenpup_adventures",
    likes: 3156,
    alt: "Golden retriever with owner",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=400&fit=crop",
    username: "@catlover_emma",
    likes: 2104,
    alt: "Cat relaxing at home",
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1450778869180-e77d3083dbb0?w=400&h=400&fit=crop",
    username: "@pettech_review",
    likes: 1789,
    alt: "Smart pet setup at home",
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=400&fit=crop",
    username: "@dogsofinstagram",
    likes: 4521,
    alt: "Two dogs playing",
  },
];

export default function SocialProof() {
  return (
    <section className="py-section bg-surface-light overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10"
        >
          <span className="text-overline text-accent font-semibold tracking-widest uppercase mb-3 block">
            #PETLIBRO Community
          </span>
          <h2 className="text-heading-lg font-bold text-foreground mb-3">
            Loved by Pet Parents Everywhere
          </h2>
          <p className="text-body text-muted max-w-lg mx-auto">
            Join 150,000+ pet families sharing their smart pet care journey.
          </p>
        </motion.div>

        {/* UGC Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {UGC_POSTS.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
                delay: i * 0.05,
              }}
              className="group relative aspect-square rounded-premium overflow-hidden cursor-pointer"
            >
              <Image
                src={post.image}
                alt={post.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 990px) 33vw, 16vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/50 transition-colors duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center text-white">
                  <Instagram className="w-5 h-5 mx-auto mb-1.5" />
                  <p className="text-xs font-medium">{post.username}</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Heart className="w-3 h-3 fill-white" />
                    <span className="text-xs">{post.likes.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Follow CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-8"
        >
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground-muted hover:text-accent transition-colors"
          >
            <Instagram className="w-4 h-4" />
            Follow @petlibro on Instagram
          </a>
        </motion.div>
      </div>
    </section>
  );
}
