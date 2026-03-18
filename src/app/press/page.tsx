import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Press | PETLIBRO",
  description: "PETLIBRO press information, brand assets, and media contact.",
};

export default function PressPage() {
  return (
    <main className="container-main py-20">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-3">Press &amp; Media</h1>
        <p className="text-muted mb-10 leading-relaxed">
          PETLIBRO is a smart pet care brand building connected products that keep
          pets healthy, happy, and well-fed. We combine thoughtful design with
          modern technology to help pet parents care for their furry companions.
        </p>
        <div className="bg-surface rounded-lg p-8 text-left space-y-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted mb-1">
              Media Inquiries
            </h2>
            <a
              href="mailto:press@petlibro.com"
              className="text-accent font-medium hover:underline"
            >
              press@petlibro.com
            </a>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted mb-1">
              Brand
            </h2>
            <p className="text-sm">PETLIBRO &mdash; Smart Pet Care for Modern Pet Parents</p>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted mb-1">
              Founded
            </h2>
            <p className="text-sm">2024</p>
          </div>
        </div>
      </div>
    </main>
  );
}
