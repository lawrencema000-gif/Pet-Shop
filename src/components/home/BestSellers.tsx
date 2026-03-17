import Link from "next/link";
import type { Product } from "@/types/product";
import ProductCard from "@/components/product/ProductCard";

interface BestSellersProps {
  products: Product[];
}

export default function BestSellers({ products }: BestSellersProps) {
  if (!products.length) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl md:text-3xl font-bold">Best Sellers</h2>
        <Link
          href="/products?sort=best-sellers"
          className="text-sm font-medium text-muted hover:text-foreground transition-colors"
        >
          View All &rarr;
        </Link>
      </div>
      <div className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 scrollbar-hide">
        {products.map((product) => (
          <div key={product.id} className="min-w-[260px] snap-start flex-shrink-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
