"use client";

import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  RotateCcw,
  CheckCircle,
  XCircle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ReturnsPage() {
  const { t } = useTranslation();

  const returnSteps = [
    {
      step: 1,
      title: t('returnsPage.step1Title'),
      description: t('returnsPage.step1Description'),
    },
    {
      step: 2,
      title: t('returnsPage.step2Title'),
      description: t('returnsPage.step2Description'),
    },
    {
      step: 3,
      title: t('returnsPage.step3Title'),
      description: t('returnsPage.step3Description'),
    },
    {
      step: 4,
      title: t('returnsPage.step4Title'),
      description: t('returnsPage.step4Description'),
    },
  ];

  return (
    <>
      <div className="container-main">
        <Breadcrumb items={[{ label: t('returnsPage.breadcrumb') }]} />
      </div>

      <div className="container-main pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('returnsPage.title')}
            </h1>
            <p className="text-muted text-lg">
              {t('returnsPage.subtitle')}
            </p>
          </div>

          <div className="bg-surface rounded-md p-6 md:p-8 flex items-start gap-4 mb-10">
            <div className="p-2.5 rounded-lg bg-background border border-border shrink-0">
              <RotateCcw size={22} className="text-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-lg mb-1">
                {t('returnsPage.returnWindowTitle')}
              </h2>
              <p className="text-sm text-muted">
                {t('returnsPage.returnWindowDescription')}
              </p>
            </div>
          </div>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-3">
              {t('returnsPage.conditionRequirementsTitle')}
            </h2>
            <div className="space-y-3 text-sm text-muted">
              <div className="flex items-start gap-3">
                <CheckCircle
                  size={18}
                  className="text-success shrink-0 mt-0.5"
                />
                <p>
                  <strong className="text-foreground">{t('returnsPage.condition1Label')}</strong>{" "}
                  — {t('returnsPage.condition1Description')}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle
                  size={18}
                  className="text-success shrink-0 mt-0.5"
                />
                <p>
                  <strong className="text-foreground">
                    {t('returnsPage.condition2Label')}
                  </strong>{" "}
                  — {t('returnsPage.condition2Description')}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle
                  size={18}
                  className="text-success shrink-0 mt-0.5"
                />
                <p>
                  <strong className="text-foreground">{t('returnsPage.condition3Label')}</strong> — {t('returnsPage.condition3Description')}
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-6">
              {t('returnsPage.howItWorksTitle')}
            </h2>
            <div className="space-y-0">
              {returnSteps.map((step, index) => (
                <div key={step.step} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center text-sm font-bold shrink-0">
                      {step.step}
                    </div>
                    {index < returnSteps.length - 1 && (
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

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <RefreshCw size={20} />
              {t('returnsPage.exchangesTitle')}
            </h2>
            <div className="prose-sm text-muted space-y-3">
              <p>
                {t('returnsPage.exchangesDescription1')}
              </p>
              <p>
                {t('returnsPage.exchangesDescription2')}
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <XCircle size={20} />
              {t('returnsPage.nonReturnableTitle')}
            </h2>
            <p className="text-sm text-muted mb-4">
              {t('returnsPage.nonReturnableDescription')}
            </p>
            <ul className="space-y-2">
              {(t('returnsPage.nonReturnableItems', { returnObjects: true }) as string[]).map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-sm text-muted"
                >
                  <ArrowRight size={14} className="text-border shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <div className="bg-surface rounded-md p-8 text-center">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              {t('returnsPage.ctaTitle')}
            </h2>
            <p className="text-sm text-muted mb-5">
              {t('returnsPage.ctaDescription')}
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              {t('returnsPage.ctaButton')}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
