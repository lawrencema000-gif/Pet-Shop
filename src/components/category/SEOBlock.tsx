interface SEOBlockProps {
  categoryName: string;
  productCount: number;
}

export default function SEOBlock({ categoryName, productCount }: SEOBlockProps) {
  return (
    <div className="text-sm text-muted leading-relaxed border-t border-border pt-8 mt-8">
      <p>
        Browse our collection of {productCount} {categoryName}. At Pet and Angels, we
        design smart pet products that make life easier for you and your pets.
        From app-controlled feeders to self-cleaning litter boxes, discover
        technology that keeps your pet happy and healthy.
      </p>
    </div>
  );
}
