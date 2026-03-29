"use client";

import { Smartphone, Sparkles, ShieldCheck, Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";

const features = [
  {
    icon: Smartphone,
    titleKey: "whyChooseUs.smartTech",
    descriptionKey: "whyChooseUs.smartTechDesc",
  },
  {
    icon: Sparkles,
    titleKey: "whyChooseUs.easyClean",
    descriptionKey: "whyChooseUs.easyCleanDesc",
  },
  {
    icon: ShieldCheck,
    titleKey: "whyChooseUs.safeCertified",
    descriptionKey: "whyChooseUs.safeCertifiedDesc",
  },
  {
    icon: Trophy,
    titleKey: "whyChooseUs.awardDesign",
    descriptionKey: "whyChooseUs.awardDesignDesc",
  },
];

export default function WhyChooseUs() {
  const { t } = useTranslation();

  return (
    <section className="bg-surface py-24 md:py-32">
      <div className="container-main">
        <div className="text-center mb-16">
          <span className="text-overline tracking-[0.25em] uppercase text-muted block mb-3">
            {t('whyChooseUs.overline')}
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            {t('whyChooseUs.heading')}
          </h2>
          <p className="text-muted mt-4 max-w-lg mx-auto text-sm">
            {t('whyChooseUs.description')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature.titleKey}
              className="text-center p-6"
            >
              <div className="w-16 h-16 rounded-full bg-gold-light flex items-center justify-center mx-auto ring-1 ring-gold/20">
                <feature.icon className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-semibold text-base mt-5 text-foreground">
                {t(feature.titleKey)}
              </h3>
              <p className="text-sm text-muted mt-2 leading-relaxed">
                {t(feature.descriptionKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
