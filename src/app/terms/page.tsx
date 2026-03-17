import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | PETLIBRO",
  description:
    "Read the terms and conditions that govern your use of the PETLIBRO website and services.",
};

export default function TermsPage() {
  return (
    <>
      <div className="container-main">
        <Breadcrumb items={[{ label: "Terms of Service" }]} />
      </div>

      <div className="container-main pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Terms of Service
            </h1>
            <p className="text-sm text-muted">
              Last updated: March 15, 2026
            </p>
          </div>

          <div className="prose-sm space-y-8 text-muted [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mb-3 [&_p]:leading-relaxed [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_li]:list-disc">
            <section>
              <h2>1. Acceptance of Terms</h2>
              <p>
                By accessing or using the PETLIBRO website (the &quot;Site&quot;),
                mobile application, or any of our services, you agree to be
                bound by these Terms of Service (&quot;Terms&quot;). If you do not agree
                to these Terms, you may not use our services.
              </p>
              <p>
                We reserve the right to update these Terms at any time. Continued
                use of the Site after changes constitutes acceptance of the
                revised Terms.
              </p>
            </section>

            <section>
              <h2>2. Eligibility</h2>
              <p>
                You must be at least 18 years of age to make purchases on our
                Site. By using our services, you represent and warrant that you
                meet this requirement and have the legal capacity to enter into
                a binding agreement.
              </p>
            </section>

            <section>
              <h2>3. Account Registration</h2>
              <p>
                When you create an account, you agree to provide accurate,
                current, and complete information. You are responsible for
                maintaining the confidentiality of your account credentials and
                for all activities that occur under your account.
              </p>
              <p>
                You must notify us immediately of any unauthorized use of your
                account. We are not liable for losses arising from unauthorized
                access to your account.
              </p>
            </section>

            <section>
              <h2>4. Products & Pricing</h2>
              <p>
                We strive to provide accurate product descriptions, images, and
                pricing. However, we do not warrant that descriptions or other
                content on the Site are error-free. If a product is listed at an
                incorrect price due to a typographical error, we reserve the
                right to cancel the order and issue a full refund.
              </p>
              <p>
                All prices are listed in US Dollars and are subject to change
                without notice. Promotional pricing and discounts are valid for
                the specified period only.
              </p>
            </section>

            <section>
              <h2>5. Orders & Payment</h2>
              <p>
                By placing an order, you are making an offer to purchase. We
                reserve the right to accept or decline any order for any reason,
                including stock availability, suspected fraud, or pricing
                errors.
              </p>
              <p>
                Payment must be made at the time of purchase using one of our
                accepted payment methods. All transactions are processed through
                secure, PCI-compliant payment providers.
              </p>
            </section>

            <section>
              <h2>6. Shipping & Delivery</h2>
              <p>
                Shipping timelines are estimates and not guarantees. We are not
                responsible for delays caused by carriers, weather, customs, or
                other factors outside our control. For full details, see our{" "}
                <Link
                  href="/shipping"
                  className="text-foreground underline underline-offset-2 hover:text-accent"
                >
                  Shipping Policy
                </Link>
                .
              </p>
            </section>

            <section>
              <h2>7. Returns & Refunds</h2>
              <p>
                Returns are subject to our{" "}
                <Link
                  href="/returns"
                  className="text-foreground underline underline-offset-2 hover:text-accent"
                >
                  Returns & Refunds Policy
                </Link>
                . Please review it before making a purchase. By completing a
                purchase, you acknowledge and accept the terms of our return
                policy.
              </p>
            </section>

            <section>
              <h2>8. Intellectual Property</h2>
              <p>
                All content on the Site — including text, images, logos,
                graphics, product designs, software, and trademarks — is the
                property of PETLIBRO or its licensors and is protected by
                copyright, trademark, and other intellectual property laws.
              </p>
              <p>
                You may not reproduce, distribute, modify, or create derivative
                works from any content on this Site without our prior written
                consent.
              </p>
            </section>

            <section>
              <h2>9. User Conduct</h2>
              <p>You agree not to:</p>
              <ul>
                <li>Use the Site for any unlawful purpose</li>
                <li>Interfere with or disrupt the Site&apos;s functionality</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Transmit viruses, malware, or other harmful code</li>
                <li>Scrape, mine, or collect data from the Site without permission</li>
                <li>Submit false or misleading information</li>
              </ul>
            </section>

            <section>
              <h2>10. Limitation of Liability</h2>
              <p>
                To the fullest extent permitted by law, PETLIBRO shall not be
                liable for any indirect, incidental, special, consequential, or
                punitive damages arising from your use of our products or
                services. Our total liability for any claim shall not exceed the
                amount you paid for the product giving rise to the claim.
              </p>
            </section>

            <section>
              <h2>11. Disclaimer of Warranties</h2>
              <p>
                Our products and services are provided &quot;as is&quot; and &quot;as
                available&quot; without warranties of any kind, either express or
                implied, except as expressly stated in our{" "}
                <Link
                  href="/warranty"
                  className="text-foreground underline underline-offset-2 hover:text-accent"
                >
                  Warranty Policy
                </Link>
                . We do not warrant that the Site will be uninterrupted,
                error-free, or secure.
              </p>
            </section>

            <section>
              <h2>12. Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless PETLIBRO, its
                officers, employees, and agents from any claims, damages, or
                expenses arising from your use of the Site, violation of these
                Terms, or infringement of any third-party rights.
              </p>
            </section>

            <section>
              <h2>13. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance
                with the laws of the State of New York, without regard to
                conflict of law principles. Any disputes arising under these
                Terms shall be subject to the exclusive jurisdiction of the
                courts in New York County, New York.
              </p>
            </section>

            <section>
              <h2>14. Contact</h2>
              <p>
                For questions about these Terms, please contact us at{" "}
                <a
                  href="mailto:legal@petlibro.com"
                  className="text-foreground underline underline-offset-2 hover:text-accent"
                >
                  legal@petlibro.com
                </a>{" "}
                or visit our{" "}
                <Link
                  href="/contact"
                  className="text-foreground underline underline-offset-2 hover:text-accent"
                >
                  Contact page
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
