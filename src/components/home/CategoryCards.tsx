import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/types/product";

interface CategoryCardsProps {
  categories: Category[];
}

export default function CategoryCards({ categories }: CategoryCardsProps) {
  if (!categories.length) return null;

  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
        Shop by Category
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categories/${category.slug}`}
            className="group relative overflow-hidden rounded-2xl aspect-[4/3]"
          >
            {category.image_url ? (
              <Image
                src={category.image_url}
                alt={category.name}
                fill
                sizes="(max-width: 750px) 100vw, (max-width: 990px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="absolute inset-0 bg-surface" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <h3 className="text-2xl font-bold">{category.name}</h3>
              <span className="inline-block mt-2 text-sm opacity-90 group-hover:opacity-100 transition-opacity">
                Shop Now &rarr;
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
