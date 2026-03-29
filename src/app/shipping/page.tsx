"use client";

import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Truck, Package, Clock, Globe, Info } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ShippingPage() {
  const { t } = useTranslation();

  const shippingMethods = [
    {
      method: t('shippingPage.standardShipping'),
      time: t('shippingPage.standardTime'),
      cost: t('shippingPage.standardCost'),
      note: t('shippingPage.standardNote'),
    },
    {
      method: t('shippingPage.expressShipping'),
      time: t('shippingPage.expressTime'),
      cost: t('shippingPage.expressCost'),
      note: "",
    },
    {
      method: t('shippingPage.overnightDelivery'),
      time: t('shippingPage.overnightTime'),
      cost: t('shippingPage.overnightCost'),
      note: t('shippingPage.overnightNote'),
    },
  ];

  return (
    <>
      <div className="container-main">
        <Breadcrumb items={[{ label: t('shippingPage.heading') }]} />
      </div>

      <div className="container-main pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('shippingPage.title')}
            </h1>
            <p className="text-muted text-lg">
              {t('shippingPage.subtitle')}
            </p>
          </div>

          <div className="bg-surface rounded-md p-6 md:p-8 flex items-start gap-4 mb-10">
            <div className="p-2.5 rounded-lg bg-background border border-border shrink-0">
              <Truck size={22} className="text-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-lg mb-1">
                {t('shippingPage.freeShippingTitle')}
              </h2>
              <p className="text-sm text-muted">
                {t('shippingPage.freeShippingDesc')}
              </p>
            </div>
          </div>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-foreground mb-5 flex items-center gap-2">
              <Package size={20} />
              {t('shippingPage.methodsTitle')}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded overflow-hidden">
                <thead>
                  <tr className="bg-surface">
                    <th className="text-left py-3.5 px-5 font-semibold text-foreground">
                      {t('shippingPage.tableMethod')}
                    </th>
                    <th className="text-left py-3.5 px-5 font-semibold text-foreground">
                      {t('shippingPage.tableDeliveryTime')}
                    </th>
                    <th className="text-left py-3.5 px-5 font-semibold text-foreground">
                      {t('shippingPage.tableCost')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shippingMethods.map((row) => (
                    <tr
                      key={row.method}
                      className="border-t border-border"
                    >
                      <td className="py-3.5 px-5 text-foreground font-medium">
                        {row.method}
                        {row.note && (
                          <span className="block text-xs text-muted mt-0.5">
                            {row.note}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-muted">{row.time}</td>
                      <td className="py-3.5 px-5 text-foreground font-medium">
                        {row.cost}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock size={20} />
              {t('shippingPage.processingTitle')}
            </h2>
            <div className="prose-sm text-muted space-y-3">
              <p>
                {t('shippingPage.processingP1Pre')} <strong className="text-foreground">{t('shippingPage.processingP1Bold')}</strong> {t('shippingPage.processingP1Post')}
              </p>
              <p>{t('shippingPage.processingP2')}</p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Info size={20} />
              {t('shippingPage.trackingTitle')}
            </h2>
            <div className="prose-sm text-muted space-y-3">
              <p>{t('shippingPage.trackingP1')}</p>
              <p>
                {t('shippingPage.trackingP2Pre')}{" "}
                <Link
                  href="/track-order"
                  className="text-foreground underline underline-offset-2 hover:text-accent transition-colors"
                >
                  {t('shippingPage.trackingLink')}
                </Link>{" "}
                {t('shippingPage.trackingP2Post')}
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Globe size={20} />
              {t('shippingPage.internationalTitle')}
            </h2>
            <div className="prose-sm text-muted space-y-3">
              <p>
                {t('shippingPage.internationalP1Pre')} <strong className="text-foreground">{t('shippingPage.internationalUS')}</strong> {t('shippingPage.internationalAnd')}{" "}
                <strong className="text-foreground">{t('shippingPage.internationalCanada')}</strong>. {t('shippingPage.internationalP1Post')}
              </p>
              <p>{t('shippingPage.internationalP2')}</p>
            </div>
          </section>

          <div className="bg-surface rounded-md p-8 text-center">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              {t('shippingPage.questionsTitle')}
            </h2>
            <p className="text-sm text-muted mb-5">
              {t('shippingPage.questionsDesc')}
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors"
              >
                {t('shippingPage.contactSupport')}
              </Link>
              <Link
                href="/track-order"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-foreground rounded-lg text-sm font-medium hover:border-foreground transition-colors"
              >
                {t('shippingPage.trackMyOrder')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
