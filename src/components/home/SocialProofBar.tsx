"use client";

import { useTranslation } from "react-i18next";

export default function SocialProofBar() {
  const { t } = useTranslation();
  return (
    <section className="border-y border-border/60 bg-white">
      <div className="container-main py-10 md:py-14">
        {/* Stats */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 mb-10">
          {[
            { value: t('socialProof.happyPetParentsCount'), label: t('socialProof.happyPetParents') },
            { value: t('socialProof.averageRatingValue'), label: t('socialProof.averageRating') },
            { value: t('socialProof.awardWinning'), label: t('socialProof.productDesign') },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl md:text-3xl font-display font-bold text-foreground">
                {stat.value}
              </p>
              <p className="text-xs tracking-[0.15em] uppercase text-muted mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Press logos / As Featured In */}
        <div className="text-center">
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted/60 mb-6">
            {t('socialProof.asFeaturedIn')}
          </p>
          <div className="flex items-center justify-center gap-10 md:gap-16 text-muted/30 flex-wrap">
            {["TechCrunch", "Wired", "Forbes", "The Verge", "Pet Business"].map(
              (name) => (
                <span
                  key={name}
                  className="text-sm md:text-base font-semibold tracking-wide select-none"
                >
                  {name}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
