"use client";

import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Shield, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function WarrantyPage() {
  const { t } = useTranslation();

  const coverageTiers = [
    {
      category: t('warrantyPage.smartElectronicsCategory'),
      duration: t('warrantyPage.smartElectronicsDuration'),
      items: t('warrantyPage.electronicsItems', { returnObjects: true }) as string[],
    },
    {
      category: t('warrantyPage.accessoriesCategory'),
      duration: t('warrantyPage.accessoriesDuration'),
      items: t('warrantyPage.accessoriesItems', { returnObjects: true }) as string[],
    },
  ];

  const coveredIssues = t('warrantyPage.coveredItems', { returnObjects: true }) as string[];
  const notCoveredIssues = t('warrantyPage.notCoveredItems', { returnObjects: true }) as string[];

  const claimSteps = [
    {
      step: 1,
      title: t('warrantyPage.claimStep1Title'),
      description: t('warrantyPage.claimStep1Description'),
    },
    {
      step: 2,
      title: t('warrantyPage.claimStep2Title'),
      description: t('warrantyPage.claimStep2Description'),
    },
    {
      step: 3,
      title: t('warrantyPage.claimStep3Title'),
      description: t('warrantyPage.claimStep3Description'),
    },
    {
      step: 4,
      title: t('warrantyPage.claimStep4Title'),
      description: t('warrantyPage.claimStep4Description'),
    },
  ];

  return (
    <>
      <div className="container-main">
        <Breadcrumb items={[{ label: t('warrantyPage.breadcrumb') }]} />
      </div>

      <div className="container-main pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('warrantyPage.title')}
            </h1>
            <p className="text-muted text-lg">
              {t('warrantyPage.subtitle')}
            </p>
          </div>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-5 flex items-center gap-2">
              <Shield size={20} />
              {t('warrantyPage.coverageOverviewTitle')}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {coverageTiers.map((tier) => (
                <div
                  key={tier.category}
                  className="bg-surface rounded-md p-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground">
                      {tier.category}
                    </h3>
                    <span className="px-3 py-1 text-xs font-bold bg-accent text-white rounded-full">
                      {tier.duration}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {tier.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-muted"
                      >
                        <ArrowRight
                          size={14}
                          className="text-border shrink-0 mt-0.5"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              {t('warrantyPage.whatsCoveredTitle')}
            </h2>
            <div className="space-y-2.5">
              {coveredIssues.map((issue) => (
                <div key={issue} className="flex items-start gap-3">
                  <CheckCircle
                    size={18}
                    className="text-success shrink-0 mt-0.5"
                  />
                  <p className="text-sm text-muted">{issue}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              {t('warrantyPage.whatsNotCoveredTitle')}
            </h2>
            <div className="space-y-2.5">
              {notCoveredIssues.map((issue) => (
                <div key={issue} className="flex items-start gap-3">
                  <XCircle
                    size={18}
                    className="text-sale shrink-0 mt-0.5"
                  />
                  <p className="text-sm text-muted">{issue}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              {t('warrantyPage.howToFileTitle')}
            </h2>
            <div className="space-y-0">
              {claimSteps.map((step, index) => (
                <div key={step.step} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center text-sm font-bold shrink-0">
                      {step.step}
                    </div>
                    {index < claimSteps.length - 1 && (
                      <div className="w-px flex-1 bg-border my-1" />
                    )}
                  </div>
                  <div className="pb-8">
                    <h3 className="font-semibold text-foreground mb-1">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="bg-surface rounded-md p-8 text-center">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              {t('warrantyPage.ctaTitle')}
            </h2>
            <p className="text-sm text-muted mb-5">
              {t('warrantyPage.ctaDescription')}
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              {t('warrantyPage.ctaButton')}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
