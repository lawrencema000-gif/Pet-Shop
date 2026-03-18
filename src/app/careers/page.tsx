import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers | PETLIBRO",
  description: "Join the PETLIBRO team. We're always looking for passionate pet lovers.",
};

export default function CareersPage() {
  return (
    <main className="container-main py-20">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-3">Careers at PETLIBRO</h1>
        <p className="text-muted mb-8 leading-relaxed">
          We&apos;re always looking for passionate pet lovers to join our team. At PETLIBRO, we believe great products start with great people who care deeply
          about pets and their owners.
        </p>
        <div className="bg-surface rounded-premium-xl p-8">
          <h2 className="text-lg font-semibold mb-2">No open positions right now</h2>
          <p className="text-sm text-muted mb-4">
            We don&apos;t have any open roles at the moment, but we&apos;d love to hear
            from you. Send your resume and a note about why you love pets to:
          </p>
          <a
            href="mailto:careers@petlibro.com"
            className="text-accent font-medium hover:underline"
          >
            careers@petlibro.com
          </a>
        </div>
      </div>
    </main>
  );
}
