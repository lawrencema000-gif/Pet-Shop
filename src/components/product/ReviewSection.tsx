"use client";

import { useTranslation } from "react-i18next";
import { StarRating } from "@/components/ui/StarRating";
import { Badge } from "@/components/ui/Badge";
import type { Review } from "@/types/product";

interface ReviewSectionProps {
  reviews: Review[];
  productId: string;
}

export default function ReviewSection({
  reviews,
  productId,
}: ReviewSectionProps) {
  const { t } = useTranslation();
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

  // Star breakdown
  const breakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { star, count, percentage };
  });

  return (
    <div className="space-y-8" id="reviews">
      {/* Summary */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Average */}
        <div className="text-center md:text-left shrink-0">
          <div className="text-5xl font-bold text-foreground">
            {avgRating.toFixed(1)}
          </div>
          <StarRating rating={avgRating} className="mt-2 justify-center md:justify-start" />
          <p className="text-sm text-muted mt-1">
            {t("reviewSection.reviewCount", { count: totalReviews })}
          </p>
        </div>

        {/* Breakdown */}
        <div className="flex-1 space-y-2">
          {breakdown.map(({ star, count, percentage }) => (
            <div key={star} className="flex items-center gap-3 text-sm">
              <span className="w-12 text-muted shrink-0">{t("reviewSection.stars", { count: star })}</span>
              <div className="flex-1 h-2.5 bg-surface rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-muted text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Write a Review */}
      <div className="border-t border-border pt-6">
        <a
          href={`/auth/login?redirect=/products/${productId}#reviews`}
          className="inline-flex items-center px-6 py-2.5 border border-accent text-accent text-sm font-semibold rounded-lg hover:bg-accent hover:text-white transition-colors"
        >
          {t("reviewSection.writeReview")}
        </a>
      </div>

      {/* Review List */}
      {reviews.length > 0 ? (
        <div className="space-y-6 border-t border-border pt-6">
          {reviews.map((review) => (
            <div key={review.id} className="space-y-2">
              <div className="flex items-center gap-3">
                <StarRating rating={review.rating} size={14} />
                {review.is_verified_purchase && (
                  <Badge variant="new" className="text-[10px] px-2 py-0.5">
                    {t("reviewSection.verifiedPurchase")}
                  </Badge>
                )}
              </div>
              {review.title && (
                <h4 className="font-semibold text-foreground text-sm">
                  {review.title}
                </h4>
              )}
              {review.body && (
                <p className="text-sm text-muted leading-relaxed">
                  {review.body}
                </p>
              )}
              <div className="flex items-center gap-2 text-xs text-muted">
                <span>
                  {review.profiles?.full_name || "Anonymous"}
                </span>
                <span className="w-1 h-1 rounded-full bg-muted" />
                <span>
                  {new Date(review.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted border-t border-border pt-6">
          {t("reviewSection.noReviews")}
        </p>
      )}
    </div>
  );
}
