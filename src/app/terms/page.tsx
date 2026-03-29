"use client";

import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { useTranslation } from "react-i18next";

export default function TermsPage() {
  const { t } = useTranslation();

  return (
    <>
      <div className="container-main">
        <Breadcrumb items={[{ label: t('terms.breadcrumb') }]} />
      </div>

      <div className="container-main pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('terms.title')}
            </h1>
            <p className="text-sm text-muted">
              {t('terms.lastUpdated')}
            </p>
          </div>

          <div className="prose-sm space-y-8 text-muted [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mb-3 [&_p]:leading-relaxed [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_li]:list-disc">
            <section>
              <h2>{t('terms.section1Title')}</h2>
              <p>{t('terms.section1P1')}</p>
              <p>{t('terms.section1P2')}</p>
            </section>

            <section>
              <h2>{t('terms.section2Title')}</h2>
              <p>{t('terms.section2P1')}</p>
            </section>

            <section>
              <h2>{t('terms.section3Title')}</h2>
              <p>{t('terms.section3P1')}</p>
              <p>{t('terms.section3P2')}</p>
            </section>

            <section>
              <h2>{t('terms.section4Title')}</h2>
              <p>{t('terms.section4P1')}</p>
              <p>{t('terms.section4P2')}</p>
            </section>

            <section>
              <h2>{t('terms.section5Title')}</h2>
              <p>{t('terms.section5P1')}</p>
              <p>{t('terms.section5P2')}</p>
            </section>

            <section>
              <h2>{t('terms.section6Title')}</h2>
              <p>
                {t('terms.section6P1')}{" "}
                <Link
                  href="/shipping"
                  className="text-foreground underline underline-offset-2 hover:text-accent"
                >
                  {t('terms.shippingPolicyLink')}
                </Link>
                .
              </p>
            </section>

            <section>
              <h2>{t('terms.section7Title')}</h2>
              <p>
                {t('terms.section7P1Pre')}{" "}
                <Link
                  href="/returns"
                  className="text-foreground underline underline-offset-2 hover:text-accent"
                >
                  {t('terms.returnsRefundsLink')}
                </Link>
                . {t('terms.section7P1Post')}
              </p>
            </section>

            <section>
              <h2>{t('terms.section8Title')}</h2>
              <p>{t('terms.section8P1')}</p>
              <p>{t('terms.section8P2')}</p>
            </section>

            <section>
              <h2>{t('terms.section9Title')}</h2>
              <p>{t('terms.section9Desc')}</p>
              <ul>
                {(t('terms.section9Items', { returnObjects: true }) as string[]).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2>{t('terms.section10Title')}</h2>
              <p>{t('terms.section10P1')}</p>
            </section>

            <section>
              <h2>{t('terms.section11Title')}</h2>
              <p>
                {t('terms.section11P1Pre')}{" "}
                <Link
                  href="/warranty"
                  className="text-foreground underline underline-offset-2 hover:text-accent"
                >
                  {t('terms.warrantyPolicyLink')}
                </Link>
                . {t('terms.section11P1Post')}
              </p>
            </section>

            <section>
              <h2>{t('terms.section12Title')}</h2>
              <p>{t('terms.section12P1')}</p>
            </section>

            <section>
              <h2>{t('terms.section13Title')}</h2>
              <p>{t('terms.section13P1')}</p>
            </section>

            <section>
              <h2>{t('terms.section14Title')}</h2>
              <p>
                {t('terms.section14P1')}{" "}
                <a
                  href="mailto:legal@petlibro.com"
                  className="text-foreground underline underline-offset-2 hover:text-accent"
                >
                  legal@petlibro.com
                </a>{" "}
                {t('terms.section14OrVisit')}{" "}
                <Link
                  href="/contact"
                  className="text-foreground underline underline-offset-2 hover:text-accent"
                >
                  {t('terms.contactPage')}
                </Link>
                .
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
