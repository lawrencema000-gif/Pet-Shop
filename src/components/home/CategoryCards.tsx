import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/types/product";

interface CategoryCardsProps {
  categories: Category[];
}

export default function CategoryCards({ categories }: CategoryCardsProps) {
  if (!categories.length) return null;

  const display = categories.slice(0, 3);

  return (
    <div>
      <div className="text-center mb-14">
        <span className="text-overline tracking-[0.25em] uppercase text-muted block mb-3">
          Curated Collections
        </span>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
          Shop by Category
        </h2>
      </div>

      {/* Asymmetric bento grid */}
      <div className="grid md:grid-cols-2 gap-4 md:gap-5">
        {/* First card — tall, spans full left column */}
        {display[0] && (
          <Link
            href={`/categories/${display[0].slug}`}
            className="group block relative overflow-hidden md:row-span-2 aspect-[3/4] md:aspect-auto"
          >
            <div className="absolute inset-0 bg-surface-light">
              {display[0].image_url && (
                <Image
                  src={display[0].image_url}
                  alt={display[0].name}
                  fill
                  sizes="(max-width: 750px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <h3 className="font-display text-2xl md:text-3xl font-bold text-white mb-1">
                {display[0].name}
              </h3>
              <span className="inline-flex items-center gap-2 text-white/70 text-sm group-hover:text-white transition-colors duration-300">
                Explore
                <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        )}

        {/* Right column — two stacked cards */}
        {display.slice(1, 3).map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="group block relative overflow-hidden aspect-[4/3]"
          >
            <div className="absolute inset-0 bg-surface-light">
              {category.image_url && (
                <Image
                  src={category.image_url}
                  alt={category.name}
                  fill
                  sizes="(max-width: 750px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="font-display text-xl md:text-2xl font-bold text-white mb-1">
                {category.name}
              </h3>
              <span className="inline-flex items-center gap-2 text-white/70 text-sm group-hover:text-white transition-colors duration-300">
                Explore
                <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
