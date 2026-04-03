"use client";

import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { useTranslation } from "react-i18next";

export default function PrivacyPage() {
  const { t } = useTranslation();

  return (
    <>
      <div className="container-main">
        <Breadcrumb items={[{ label: t('privacy.breadcrumb') }]} />
      </div>

      <div className="container-main pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('privacy.title')}
            </h1>
            <p className="text-sm text-muted">
              {t('privacy.lastUpdated')}
            </p>
          </div>

          <div className="prose-sm space-y-8 text-muted [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mb-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mb-2 [&_p]:leading-relaxed [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_li]:list-disc">
            <section>
              <h2>{t('privacy.introductionTitle')}</h2>
              <p>{t('privacy.introductionP1')}</p>
              <p>{t('privacy.introductionP2')}</p>
            </section>

            <section>
              <h2>{t('privacy.infoCollectTitle')}</h2>

              <h3>{t('privacy.personalInfoTitle')}</h3>
              <p>{t('privacy.personalInfoDesc')}</p>
              <ul>
                {(t('privacy.personalItems', { returnObjects: true }) as string[]).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>

              <h3>{t('privacy.deviceInfoTitle')}</h3>
              <p>{t('privacy.deviceInfoDesc')}</p>
              <ul>
                {(t('privacy.deviceItems', { returnObjects: true }) as string[]).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>

              <h3>{t('privacy.smartProductTitle')}</h3>
              <p>{t('privacy.smartProductDesc')}</p>
              <ul>
                {(t('privacy.smartProductItems', { returnObjects: true }) as string[]).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2>{t('privacy.howWeUseTitle')}</h2>
              <p>{t('privacy.howWeUseDesc')}</p>
              <ul>
                {(t('privacy.useItems', { returnObjects: true }) as string[]).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2>{t('privacy.infoSharingTitle')}</h2>
              <p>{t('privacy.infoSharingDesc')}</p>
              <ul>
                <li>
                  <strong className="text-foreground">{t('privacy.serviceProviders')}</strong> — {t('privacy.serviceProvidersDesc')}
                </li>
                <li>
                  <strong className="text-foreground">{t('privacy.analyticsPartners')}</strong> — {t('privacy.analyticsPartnersDesc')}
                </li>
                <li>
                  <strong className="text-foreground">{t('privacy.legalAuthorities')}</strong> — {t('privacy.legalAuthoritiesDesc')}
                </li>
              </ul>
            </section>

            <section>
              <h2>{t('privacy.dataSecurityTitle')}</h2>
              <p>{t('privacy.dataSecurityDesc')}</p>
            </section>

            <section>
              <h2>{t('privacy.cookiesTitle')}</h2>
              <p>{t('privacy.cookiesDesc')}</p>
            </section>

            <section>
              <h2>{t('privacy.yourRightsTitle')}</h2>
              <p>{t('privacy.yourRightsDesc')}</p>
              <ul>
                {(t('privacy.rightsItems', { returnObjects: true }) as string[]).map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              <p>
                {t('privacy.exerciseRights')}{" "}
                <a
                  href="mailto:privacy@petandangel.com"
                  className="text-foreground underline underline-offset-2 hover:text-accent"
                >
                  privacy@petandangel.com
                </a>
                .
              </p>
            </section>

            <section>
              <h2>{t('privacy.childrensPrivacyTitle')}</h2>
              <p>{t('privacy.childrensPrivacyDesc')}</p>
            </section>

            <section>
              <h2>{t('privacy.changesToPolicyTitle')}</h2>
              <p>{t('privacy.changesToPolicyDesc')}</p>
            </section>

            <section>
              <h2>{t('privacy.contactTitle')}</h2>
              <p>{t('privacy.contactDesc')}</p>
              <ul>
                <li>
                  {t('privacy.contactEmail')}{" "}
                  <a
                    href="mailto:privacy@petandangel.com"
                    className="text-foreground underline underline-offset-2 hover:text-accent"
                  >
                    privacy@petandangel.com
                  </a>
                </li>
                <li>
                  {t('privacy.contactOrVisit')}{" "}
                  <Link
                    href="/contact"
                    className="text-foreground underline underline-offset-2 hover:text-accent"
                  >
                    {t('privacy.contactPage')}
                  </Link>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
