"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Heart, Zap, Shield, Leaf, ArrowRight } from "lucide-react";

export default function AboutPage() {
  const { t } = useTranslation();

  const values = [
    {
      icon: Heart,
      title: t('about.value1Title'),
      description: t('about.value1Desc'),
    },
    {
      icon: Zap,
      title: t('about.value2Title'),
      description: t('about.value2Desc'),
    },
    {
      icon: Shield,
      title: t('about.value3Title'),
      description: t('about.value3Desc'),
    },
    {
      icon: Leaf,
      title: t('about.value4Title'),
      description: t('about.value4Desc'),
    },
  ];

  const milestones = [
    {
      year: "2019",
      title: t('about.timeline2019Title'),
      description: t('about.timeline2019Desc'),
    },
    {
      year: "2020",
      title: t('about.timeline2020Title'),
      description: t('about.timeline2020Desc'),
    },
    {
      year: "2021",
      title: t('about.timeline2021Title'),
      description: t('about.timeline2021Desc'),
    },
    {
      year: "2022",
      title: t('about.timeline2022Title'),
      description: t('about.timeline2022Desc'),
    },
    {
      year: "2023",
      title: t('about.timeline2023Title'),
      description: t('about.timeline2023Desc'),
    },
    {
      year: "2024",
      title: t('about.timeline2024Title'),
      description: t('about.timeline2024Desc'),
    },
    {
      year: "2025",
      title: t('about.timeline2025Title'),
      description: t('about.timeline2025Desc'),
    },
    {
      year: "2026",
      title: t('about.timeline2026Title'),
      description: t('about.timeline2026Desc'),
    },
  ];

  return (
    <>
      <div className="container-main">
        <Breadcrumb items={[{ label: t('about.heading1') }]} />
      </div>

      <div className="container-main pb-20">
        {/* Hero Section */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            {t('about.heading1')}
            <br />
            {t('about.heading2')}
          </h1>
          <p className="text-muted text-lg leading-relaxed max-w-2xl mx-auto">
            {t('about.intro')}
          </p>
        </div>

        {/* Mission */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="bg-surface rounded-lg p-8 md:p-12 text-center">
            <p className="text-xs font-semibold tracking-widest text-muted uppercase mb-3">
              {t('about.missionTitle')}
            </p>
            <p className="text-xl md:text-2xl font-medium text-foreground leading-relaxed max-w-2xl mx-auto">
              {t('about.missionText')}
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">
            {t('about.valuesTitle')}
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((value) => (
              <div
                key={value.title}
                className="p-6 rounded-xl border border-border hover:shadow-card transition-shadow"
              >
                <div className="p-2.5 rounded-lg bg-surface inline-flex mb-4">
                  <value.icon size={22} className="text-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Photo Placeholder */}
        <div className="max-w-4xl mx-auto mb-20">
          <div className="aspect-[21/9] rounded-lg bg-surface border border-border flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm font-semibold text-muted mb-1">
                {t('about.teamTitle')}
              </p>
              <p className="text-xs text-muted/70">
                {t('about.teamDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">
            {t('about.journeyTitle')}
          </h2>
          <div className="space-y-0">
            {milestones.map((milestone, index) => (
              <div key={milestone.year} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {milestone.year}
                  </div>
                  {index < milestones.length - 1 && (
                    <div className="w-px flex-1 bg-border my-1" />
                  )}
                </div>
                <div className="pb-10">
                  <h3 className="font-semibold text-foreground mb-1">
                    {milestone.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-accent rounded-lg p-10 text-center text-white">
            <h2 className="text-2xl font-bold mb-3">
              {t('about.ctaHeading')}
            </h2>
            <p className="text-white/80 mb-6 max-w-md mx-auto">
              {t('about.ctaDesc')}
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-accent rounded-lg font-medium hover:bg-white/90 transition-colors"
            >
              {t('common.shopAllProducts')}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
