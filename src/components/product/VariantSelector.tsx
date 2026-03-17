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
        {variants.map((v) => (
          <button
            key={v.id}
            onClick={() => onSelect(v.id)}
            title={v.name}
            className={cn(
              "w-8 h-8 rounded-full border-2 transition-all",
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
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {variants.map((v) => (
        <button
          key={v.id}
          onClick={() => onSelect(v.id)}
          className={cn(
            "px-4 py-2 border rounded-lg text-sm font-medium transition-all",
            selectedId === v.id
              ? "border-accent ring-2 ring-accent ring-offset-2 text-foreground"
              : "border-border text-foreground hover:border-foreground-muted"
          )}
        >
          {v.name}
        </button>
      ))}
    </div>
  );
}
