"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ProductVariant } from "@/types/product";

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
                  backgroundColor: v.name.toLowerCase(),
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
