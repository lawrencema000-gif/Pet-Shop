"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Heart, ShoppingBag, ArrowRight, LogIn } from "lucide-react";
import { useAuth } from "@/lib/supabase/auth-provider";

export default function WishlistPage() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();

  return (
    <>
      <div className="container-main">
        <Breadcrumb items={[{ label: "Wishlist" }]} />
      </div>

      <div className="container-main pb-20">
        {loading ? (
          /* Loading State */
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-12 h-12 rounded-full border-2 border-accent border-t-transparent animate-spin mx-auto" />
          </div>
        ) : !user ? (
          /* Unauthenticated State */
          <div className="max-w-lg mx-auto text-center py-8">
            <div className="rounded-2xl bg-gradient-to-br from-accent/5 via-surface to-accent/10 border border-border p-10 md:p-14">
              <div className="relative inline-flex mb-6">
                <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center">
                  <Heart
                    className="w-10 h-10 text-accent"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-surface border-2 border-border flex items-center justify-center">
                  <LogIn size={14} className="text-muted" />
                </div>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                {t('wishlist.heading')}
              </h1>
              <p className="text-muted leading-relaxed mb-8 max-w-sm mx-auto">
                {t('wishlist.signInDesc')}
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 bg-accent text-white px-8 py-3 rounded-lg text-sm font-semibold hover:bg-accent-dark transition-colors"
              >
                {t('wishlist.signInCta')}
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ) : (
          /* Authenticated Empty State */
          <div className="max-w-lg mx-auto text-center py-8">
            <div className="rounded-2xl border border-border p-10 md:p-14">
              <div className="relative inline-flex mb-6">
                <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center">
                  <ShoppingBag
                    className="w-10 h-10 text-muted/40"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-accent/10 border-2 border-white flex items-center justify-center">
                  <Heart size={14} className="text-accent" />
                </div>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                {t('wishlist.emptyTitle')}
              </h1>
              <p className="text-muted leading-relaxed mb-8 max-w-sm mx-auto">
                {t('wishlist.emptyDesc')}
              </p>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-accent text-white px-8 py-3 rounded-lg text-sm font-semibold hover:bg-accent-dark transition-colors"
              >
                {t('common.browseProducts')}
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
