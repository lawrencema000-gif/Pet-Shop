import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import OrganizationSchema from "@/components/seo/OrganizationSchema";
import WebsiteSchema from "@/components/seo/WebsiteSchema";
import { AuthProvider } from "@/lib/supabase/auth-provider";
import { ToastProvider } from "@/components/ui/Toast";
import { StoreShell } from "@/components/layout/StoreShell";
import { I18nProvider } from "@/components/I18nProvider";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.petandangel.com"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  title: {
    default: "Pet and Angels | Smart Pet Care Products for Modern Pet Parents",
    template: "%s | Pet and Angels",
  },
  description:
    "Discover smart pet feeders, water fountains, self-cleaning litter boxes, and premium accessories. Free shipping on orders over $75. 30-day returns. 1-year warranty.",
  keywords: [
    "smart pet feeder",
    "automatic pet feeder",
    "pet water fountain",
    "self-cleaning litter box",
    "smart pet products",
    "pet tech",
    "pet care",
    "dog feeder",
    "cat fountain",
  ],
  authors: [{ name: "Pet and Angels" }],
  creator: "Pet and Angels",
  publisher: "Pet and Angels",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.petandangel.com",
    siteName: "Pet and Angels",
    title: "Pet and Angels | Smart Pet Care Products",
    description:
      "Smart pet feeders, water fountains, litter boxes & accessories. Free shipping $75+.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "Pet and Angels Smart Pet Care",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pet and Angels | Smart Pet Care Products",
    description:
      "Smart pet feeders, water fountains, litter boxes & accessories.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.petandangel.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        <GoogleAnalytics />
        <AuthProvider>
          <I18nProvider>
            <ToastProvider>
              <OrganizationSchema />
              <WebsiteSchema />
              <StoreShell>{children}</StoreShell>
            </ToastProvider>
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
