"use client";

import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  Download,
  FileText,
  Image,
  BookOpen,
  ArrowRight,
  Mail,
  Calendar,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function PressPage() {
  const { t } = useTranslation();

  const brandAssets = [
    {
      icon: FileText,
      title: t('pressPage.logoPack'),
      description: t('pressPage.logoPackDescription'),
    },
    {
      icon: BookOpen,
      title: t('pressPage.brandGuidelines'),
      description: t('pressPage.brandGuidelinesDescription'),
    },
    {
      icon: Image,
      title: t('pressPage.productPhotos'),
      description: t('pressPage.productPhotosDescription'),
    },
  ];

  const pressReleases = [
    {
      date: t('pressPage.release1Date'),
      title: t('pressPage.release1Title'),
      excerpt: t('pressPage.release1Excerpt'),
    },
    {
      date: t('pressPage.release2Date'),
      title: t('pressPage.release2Title'),
      excerpt: t('pressPage.release2Excerpt'),
    },
    {
      date: t('pressPage.release3Date'),
      title: t('pressPage.release3Title'),
      excerpt: t('pressPage.release3Excerpt'),
    },
    {
      date: t('pressPage.release4Date'),
      title: t('pressPage.release4Title'),
      excerpt: t('pressPage.release4Excerpt'),
    },
  ];

  const mediaLogos = [
    "TechCrunch",
    "The Verge",
    "WIRED",
    "Pet Business Magazine",
  ];

  return (
    <>
      <div className="container-main">
        <Breadcrumb items={[{ label: t('pressPage.breadcrumb') }]} />
      </div>

      <div className="container-main pb-20">
        {/* Hero Section */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            {t('pressPage.title')}
          </h1>
          <p className="text-muted text-lg leading-relaxed max-w-2xl mx-auto">
            {t('pressPage.subtitle')}
          </p>
        </div>

        {/* Brand Assets */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">
            {t('pressPage.brandAssetsTitle')}
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {brandAssets.map((asset) => (
              <div
                key={asset.title}
                className="p-6 rounded-xl border border-border hover:shadow-card transition-shadow text-center group"
              >
                <div className="p-3 rounded-lg bg-surface inline-flex mb-4">
                  <asset.icon size={24} className="text-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {asset.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed mb-4">
                  {asset.description}
                </p>
                <button
                  className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-dark transition-colors"
                  disabled
                >
                  <Download size={14} />
                  {t('pressPage.comingSoon')}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Press Releases */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-2xl font-bold text-foreground text-center mb-3">
            {t('pressPage.pressReleasesTitle')}
          </h2>
          <p className="text-muted text-center mb-10 max-w-lg mx-auto">
            {t('pressPage.pressReleasesSubtitle')}
          </p>
          <div className="space-y-4">
            {pressReleases.map((release) => (
              <div
                key={release.title}
                className="p-6 rounded-xl border border-border hover:shadow-card transition-shadow group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={13} className="text-muted" />
                  <span className="text-xs font-medium text-muted">
                    {release.date}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-2">
                  {release.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed mb-3">
                  {release.excerpt}
                </p>
                <Link
                  href="#"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-dark transition-colors"
                >
                  {t('pressPage.readMore')}
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* In the Media */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">
            {t('pressPage.inTheMediaTitle')}
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {mediaLogos.map((name) => (
              <div
                key={name}
                className="px-6 py-3 rounded-lg bg-surface border border-border text-sm font-semibold text-muted tracking-wide"
              >
                {name}
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-accent rounded-lg p-10 text-center text-white">
            <h2 className="text-2xl font-bold mb-3">{t('pressPage.mediaInquiriesTitle')}</h2>
            <p className="text-white/80 mb-6 max-w-md mx-auto">
              {t('pressPage.mediaInquiriesDescription')}
            </p>
            <a
              href="mailto:press@petandangel.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-accent rounded-lg font-medium hover:bg-white/90 transition-colors"
            >
              <Mail size={16} />
              press@petandangel.com
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
