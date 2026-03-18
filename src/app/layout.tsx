import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import StickyTab from "@/components/layout/StickyTab";
import OrganizationSchema from "@/components/seo/OrganizationSchema";
import WebsiteSchema from "@/components/seo/WebsiteSchema";
import { AuthProvider } from "@/lib/supabase/auth-provider";
import { ToastProvider } from "@/components/ui/Toast";
import SkipLink from "@/components/ui/SkipLink";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pet-shop-lac-ten.vercel.app"),
  title: {
    default: "PETLIBRO | Smart Pet Care Products for Modern Pet Parents",
    template: "%s | PETLIBRO",
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
  authors: [{ name: "PETLIBRO" }],
  creator: "PETLIBRO",
  publisher: "PETLIBRO",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pet-shop-lac-ten.vercel.app",
    siteName: "PETLIBRO",
    title: "PETLIBRO | Smart Pet Care Products",
    description:
      "Smart pet feeders, water fountains, litter boxes & accessories. Free shipping $75+.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&h=630&fit=crop",
        width: 1200,
        height: 630,
        alt: "PETLIBRO Smart Pet Care",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PETLIBRO | Smart Pet Care Products",
    description:
      "Smart pet feeders, water fountains, litter boxes & accessories.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://pet-shop-lac-ten.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <ToastProvider>
            <SkipLink />
            <OrganizationSchema />
            <WebsiteSchema />
            <AnnouncementBar />
            <Header />
            <main id="main-content" className="min-h-screen">{children}</main>
            <Footer />
            <StickyTab />
            <CartDrawer />
            <div id="aria-live" aria-live="polite" role="status" className="sr-only" />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
