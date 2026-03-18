import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/types/product";

interface CategoryCardsProps {
  categories: Category[];
}

export default function CategoryCards({ categories }: CategoryCardsProps) {
  if (!categories.length) return null;

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 text-foreground">
        Shop by Category
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {categories.slice(0, 3).map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="group block card-lift"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-surface-light">
              {category.image_url ? (
                <Image
                  src={category.image_url}
                  alt={category.name}
                  fill
                  sizes="(max-width: 750px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-surface" />
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>
            <div className="pt-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground text-lg">
                  {category.name}
                </h3>
                <span className="text-sm text-muted group-hover:text-accent transition-colors">
                  Shop Now
                </span>
              </div>
              <ArrowRight
                size={16}
                className="text-muted opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
