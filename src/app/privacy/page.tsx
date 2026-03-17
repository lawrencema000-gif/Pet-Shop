import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | PETLIBRO",
  description:
    "Learn how PETLIBRO collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <>
      <div className="container-main">
        <Breadcrumb items={[{ label: "Privacy Policy" }]} />
      </div>

      <div className="container-main pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Privacy Policy
            </h1>
            <p className="text-sm text-muted">
              Last updated: January 15, 2024
            </p>
          </div>

          <div className="prose-sm space-y-8 text-muted [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mb-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mb-2 [&_p]:leading-relaxed [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_li]:list-disc">
            <section>
              <h2>Introduction</h2>
              <p>
                PETLIBRO (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting
                your privacy. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you visit our
                website, use our mobile application, or purchase our products.
              </p>
              <p>
                By using our services, you agree to the collection and use of
                information in accordance with this policy. If you do not agree,
                please do not use our services.
              </p>
            </section>

            <section>
              <h2>Information We Collect</h2>

              <h3>Personal Information</h3>
              <p>
                When you create an account, place an order, or contact us, we
                may collect:
              </p>
              <ul>
                <li>Full name and email address</li>
                <li>Shipping and billing address</li>
                <li>Phone number</li>
                <li>Payment information (processed securely through our payment providers)</li>
                <li>Account credentials</li>
              </ul>

              <h3>Device & Usage Information</h3>
              <p>
                We automatically collect certain information when you visit our
                site:
              </p>
              <ul>
                <li>Browser type, operating system, and device information</li>
                <li>IP address and approximate location</li>
                <li>Pages visited, time spent, and navigation patterns</li>
                <li>Referring website or search terms</li>
              </ul>

              <h3>Smart Product Data</h3>
              <p>
                If you use our PETLIBRO app with smart products, we may collect:
              </p>
              <ul>
                <li>Feeding schedules and portion data</li>
                <li>Water consumption metrics</li>
                <li>Device usage patterns and diagnostics</li>
                <li>Pet profiles you create within the app</li>
              </ul>
            </section>

            <section>
              <h2>How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Process and fulfill your orders</li>
                <li>Send order confirmations, shipping updates, and receipts</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Improve our products, website, and services</li>
                <li>Personalize your shopping experience</li>
                <li>Send marketing communications (with your consent)</li>
                <li>Detect and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2>Information Sharing</h2>
              <p>
                We do not sell your personal information to third parties. We may
                share your data with:
              </p>
              <ul>
                <li>
                  <strong className="text-foreground">Service providers</strong> — Payment processors,
                  shipping carriers, and email services that help us operate our
                  business
                </li>
                <li>
                  <strong className="text-foreground">Analytics partners</strong> — To help us
                  understand how customers use our website and app
                </li>
                <li>
                  <strong className="text-foreground">Legal authorities</strong> — When required by law
                  or to protect our rights and safety
                </li>
              </ul>
            </section>

            <section>
              <h2>Data Security</h2>
              <p>
                We implement industry-standard security measures including SSL
                encryption, secure payment processing, and regular security
                audits. While no method of transmission over the internet is
                100% secure, we strive to protect your personal information using
                commercially acceptable means.
              </p>
            </section>

            <section>
              <h2>Cookies & Tracking</h2>
              <p>
                We use cookies and similar tracking technologies to improve your
                browsing experience, analyze site traffic, and personalize
                content. You can control cookie preferences through your browser
                settings. Disabling cookies may affect some site functionality.
              </p>
            </section>

            <section>
              <h2>Your Rights</h2>
              <p>Depending on your location, you may have the right to:</p>
              <ul>
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt out of marketing communications</li>
                <li>Data portability</li>
                <li>Withdraw consent at any time</li>
              </ul>
              <p>
                To exercise any of these rights, contact us at{" "}
                <a
                  href="mailto:privacy@petlibro.com"
                  className="text-foreground underline underline-offset-2 hover:text-accent"
                >
                  privacy@petlibro.com
                </a>
                .
              </p>
            </section>

            <section>
              <h2>Children&apos;s Privacy</h2>
              <p>
                Our services are not directed to children under 13. We do not
                knowingly collect personal information from children. If we
                become aware that we have collected data from a child under 13,
                we will take steps to delete it promptly.
              </p>
            </section>

            <section>
              <h2>Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. Changes
                will be posted on this page with an updated revision date. We
                encourage you to review this policy periodically.
              </p>
            </section>

            <section>
              <h2>Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy or our data
                practices, please contact us:
              </p>
              <ul>
                <li>
                  Email:{" "}
                  <a
                    href="mailto:privacy@petlibro.com"
                    className="text-foreground underline underline-offset-2 hover:text-accent"
                  >
                    privacy@petlibro.com
                  </a>
                </li>
                <li>
                  Or visit our{" "}
                  <Link
                    href="/contact"
                    className="text-foreground underline underline-offset-2 hover:text-accent"
                  >
                    Contact page
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
