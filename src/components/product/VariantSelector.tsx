"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ProductVariant } from "@/types/product";

const COLOR_MAP: Record<string, string> = {
  "midnight blue": "#191970",
  "sky blue": "#87ceeb",
  "forest green": "#228b22",
  "hot pink": "#ff69b4",
  "light gray": "#d3d3d3",
  "dark gray": "#a9a9a9",
  "navy blue": "#000080",
  "royal blue": "#4169e1",
  "baby blue": "#89cff0",
  "olive green": "#808000",
  "lime green": "#32cd32",
  "burnt orange": "#cc5500",
  "deep red": "#8b0000",
  "light pink": "#ffb6c1",
  "dark brown": "#654321",
};

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedId: string;
  onSelect: (id: string) => void;
  type: string;
}

export default function VariantSelector({
  variants,
  selectedId,
  onSelect,
  type,
}: VariantSelectorProps) {
  if (type === "color") {
    return (
      <div className="flex flex-wrap gap-3">
        {variants.map((v) => {
          const outOfStock = v.stock_quantity === 0;
          return (
            <button
              key={v.id}
              onClick={() => !outOfStock && onSelect(v.id)}
              disabled={outOfStock}
              title={outOfStock ? `${v.name} - Out of Stock` : v.name}
              className={cn(
                "relative w-8 h-8 rounded-full border-2 transition-all",
                outOfStock && "opacity-40 cursor-not-allowed",
                selectedId === v.id
                  ? "border-accent ring-2 ring-accent ring-offset-2"
                  : "border-border hover:border-foreground-muted"
              )}
            >
              {v.image_url ? (
                <Image
                  src={v.image_url}
                  alt={v.name}
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                />
              ) : (
                <span
                  className="block w-full h-full rounded-full"
                  style={{
                    backgroundColor: COLOR_MAP[v.name.toLowerCase()] || v.name.toLowerCase(),
                  }}
                />
              )}
              {outOfStock && (
                <span className="absolute inset-0 rounded-full border-t-2 border-foreground-muted rotate-45" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {variants.map((v) => {
        const outOfStock = v.stock_quantity === 0;
        return (
          <button
            key={v.id}
            onClick={() => !outOfStock && onSelect(v.id)}
            disabled={outOfStock}
            className={cn(
              "px-4 py-2 border rounded-lg text-sm font-medium transition-all",
              outOfStock && "opacity-50 cursor-not-allowed line-through",
              selectedId === v.id
                ? "border-accent ring-2 ring-accent ring-offset-2 text-foreground"
                : "border-border text-foreground hover:border-foreground-muted"
            )}
          >
            {v.name}
            {outOfStock && (
              <span className="block text-[10px] text-muted no-underline">
                Out of Stock
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
