import Link from "next/link";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accessibility | PETLIBRO",
  description:
    "PETLIBRO is committed to making our website accessible to everyone. Learn about our accessibility efforts.",
};

export default function AccessibilityPage() {
  return (
    <>
      <div className="container-main">
        <Breadcrumb items={[{ label: "Accessibility" }]} />
      </div>

      <div className="container-main pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Accessibility Statement
            </h1>
            <p className="text-sm text-muted">
              Last updated: January 15, 2024
            </p>
          </div>

          <div className="prose-sm space-y-8 text-muted [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mb-3 [&_p]:leading-relaxed [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_li]:list-disc">
            <section>
              <h2>Our Commitment</h2>
              <p>
                PETLIBRO is committed to ensuring digital accessibility for
                people of all abilities. We are continually improving the user
                experience for everyone and applying the relevant accessibility
                standards to ensure we provide equal access to all users.
              </p>
            </section>

            <section>
              <h2>Conformance Status</h2>
              <p>
                We aim to conform to the{" "}
                <strong className="text-foreground">
                  Web Content Accessibility Guidelines (WCAG) 2.1 Level AA
                </strong>
                . These guidelines explain how to make web content more
                accessible to people with a wide range of disabilities,
                including visual, auditory, motor, and cognitive impairments.
              </p>
            </section>

            <section>
              <h2>Measures We Take</h2>
              <p>
                To ensure accessibility, we have implemented the following
                measures:
              </p>
              <ul>
                <li>
                  Semantic HTML markup for proper content structure and screen
                  reader compatibility
                </li>
                <li>
                  Sufficient color contrast ratios between text and background
                  elements
                </li>
                <li>
                  Keyboard navigation support throughout the entire site,
                  including forms, menus, and interactive elements
                </li>
                <li>
                  Descriptive alt text for all meaningful images and
                  informative graphics
                </li>
                <li>
                  ARIA labels and landmarks to provide additional context for
                  assistive technologies
                </li>
                <li>
                  Resizable text that scales properly up to 200% without loss
                  of content or functionality
                </li>
                <li>
                  Focus indicators on all interactive elements for keyboard
                  users
                </li>
                <li>
                  Form labels and error messages that are clearly associated
                  with their respective inputs
                </li>
              </ul>
            </section>

            <section>
              <h2>Assistive Technology Compatibility</h2>
              <p>
                Our website is designed to be compatible with the following
                assistive technologies:
              </p>
              <ul>
                <li>Screen readers (NVDA, JAWS, VoiceOver, TalkBack)</li>
                <li>Screen magnification software</li>
                <li>Speech recognition software</li>
                <li>Keyboard-only navigation</li>
              </ul>
            </section>

            <section>
              <h2>Known Limitations</h2>
              <p>
                While we strive for comprehensive accessibility, some areas
                of our site may have limitations:
              </p>
              <ul>
                <li>
                  Some older product images may lack detailed alt text — we
                  are actively updating these
                </li>
                <li>
                  Third-party content such as embedded videos or social media
                  widgets may not fully meet accessibility standards
                </li>
                <li>
                  PDF documents may not be fully accessible — contact us for
                  alternative formats
                </li>
              </ul>
              <p>
                We are working to address these issues and continuously improve
                accessibility across our entire site.
              </p>
            </section>

            <section>
              <h2>Feedback & Assistance</h2>
              <p>
                We welcome your feedback on the accessibility of our website.
                If you encounter any barriers or have suggestions for
                improvement, please let us know:
              </p>
              <ul>
                <li>
                  Email:{" "}
                  <a
                    href="mailto:accessibility@petlibro.com"
                    className="text-foreground underline underline-offset-2 hover:text-accent"
                  >
                    accessibility@petlibro.com
                  </a>
                </li>
                <li>Phone: (888) 555-PETS</li>
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
              <p>
                We aim to respond to accessibility feedback within 2 business
                days and to resolve reported issues as quickly as possible.
              </p>
            </section>

            <section>
              <h2>Ongoing Efforts</h2>
              <p>
                Accessibility is an ongoing commitment. We regularly review our
                site through automated testing tools and manual audits, and we
                incorporate accessibility best practices into our development
                workflow. Our team receives training on accessibility standards
                and inclusive design principles.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
