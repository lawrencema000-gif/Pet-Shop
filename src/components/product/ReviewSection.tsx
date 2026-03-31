"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Star, Loader2, CheckCircle } from "lucide-react";
import { StarRating } from "@/components/ui/StarRating";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/supabase/auth-provider";
import { supabase } from "@/lib/supabase/client";
import type { Review } from "@/types/product";

interface ReviewSectionProps {
  reviews: Review[];
  productId: string;
}

function ReviewForm({ productId, onSubmitted }: { productId: string; onSubmitted: () => void }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (rating === 0) { setError(t("reviewSection.errorRating")); return; }
    if (!body.trim()) { setError(t("reviewSection.errorBody")); return; }
    if (!user) return;

    setSubmitting(true);
    const { error: insertError } = await supabase.from("reviews").insert({
      product_id: productId,
      user_id: user.id,
      rating,
      title: title.trim() || null,
      body: body.trim(),
      is_verified_purchase: false,
    });

    if (insertError) {
      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setSubmitting(false);
    setTimeout(() => {
      onSubmitted();
    }, 1500);
  };

  if (success) {
    return (
      <div className="flex items-center gap-2 text-success text-sm py-4">
        <CheckCircle size={18} />
        {t("reviewSection.submitSuccess")}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Star picker */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          {t("reviewSection.yourRating")}
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <Star
                size={24}
                className={
                  star <= (hoverRating || rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-border"
                }
              />
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          {t("reviewSection.reviewTitle")}
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("reviewSection.titlePlaceholder")}
          maxLength={100}
          className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-accent bg-background"
        />
      </div>

      {/* Body */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          {t("reviewSection.reviewBody")}
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t("reviewSection.bodyPlaceholder")}
          rows={4}
          maxLength={2000}
          className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:border-accent bg-background resize-none"
        />
      </div>

      {error && <p className="text-sm text-sale">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
      >
        {submitting && <Loader2 size={16} className="animate-spin" />}
        {t("reviewSection.submitReview")}
      </button>
    </form>
  );
}

export default function ReviewSection({
  reviews: initialReviews,
  productId,
}: ReviewSectionProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [reviews, setReviews] = useState(initialReviews);
  const [showForm, setShowForm] = useState(false);

  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

  const breakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { star, count, percentage };
  });

  const handleReviewSubmitted = async () => {
    // Refresh reviews from DB
    const { data } = await supabase
      .from("reviews")
      .select("*, profiles(full_name)")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    if (data) setReviews(data);
    setShowForm(false);
  };

  const alreadyReviewed = user && reviews.some((r) => r.user_id === user.id);

  return (
    <div className="space-y-8" id="reviews">
      {/* Summary */}
      <div className="flex flex-col md:flex-row gap-8">
        <div className="text-center md:text-left shrink-0">
          <div className="text-5xl font-bold text-foreground">
            {avgRating.toFixed(1)}
          </div>
          <StarRating rating={avgRating} className="mt-2 justify-center md:justify-start" />
          <p className="text-sm text-muted mt-1">
            {t("reviewSection.reviewCount", { count: totalReviews })}
          </p>
        </div>

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
        {!user ? (
          <a
            href={`/auth/login?redirect=/products/${productId}#reviews`}
            className="inline-flex items-center px-6 py-2.5 border border-accent text-accent text-sm font-semibold rounded-lg hover:bg-accent hover:text-white transition-colors"
          >
            {t("reviewSection.loginToReview")}
          </a>
        ) : alreadyReviewed ? (
          <p className="text-sm text-muted">{t("reviewSection.alreadyReviewed")}</p>
        ) : showForm ? (
          <ReviewForm productId={productId} onSubmitted={handleReviewSubmitted} />
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-6 py-2.5 border border-accent text-accent text-sm font-semibold rounded-lg hover:bg-accent hover:text-white transition-colors"
          >
            {t("reviewSection.writeReview")}
          </button>
        )}
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
                <span>{review.profiles?.full_name || "Anonymous"}</span>
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
