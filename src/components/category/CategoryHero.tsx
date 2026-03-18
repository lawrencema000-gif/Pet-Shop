"use client";

interface CategoryHeroProps {
  name: string;
  description?: string;
  imageUrl?: string;
}

export default function CategoryHero({
  name,
  description,
}: CategoryHeroProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl md:text-4xl font-bold text-foreground">
        {name}
      </h1>
      {description && (
        <p className="text-muted mt-2 max-w-xl text-sm md:text-base">
          {description}
        </p>
      )}
    </div>
  );
}
