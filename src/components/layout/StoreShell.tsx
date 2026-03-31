"use client";

import { usePathname } from "next/navigation";
import { AnnouncementBar } from "./AnnouncementBar";
import { Header } from "./Header";
import { Footer } from "./Footer";
import StickyTab from "./StickyTab";
import { CartDrawer } from "@/components/cart/CartDrawer";
import ExitIntentPopup from "@/components/ui/ExitIntentPopup";
import SkipLink from "@/components/ui/SkipLink";
import { LiveChatWidget } from "@/components/chat/LiveChatWidget";
import { CookieConsent } from "@/components/ui/CookieConsent";

export function StoreShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <SkipLink />
      <AnnouncementBar />
      <Header />
      <main id="main-content" className="min-h-screen">
        {children}
      </main>
      <Footer />
      <StickyTab />
      <CartDrawer />
      <ExitIntentPopup />
      <LiveChatWidget />
      <CookieConsent />
      <div id="aria-live" aria-live="polite" role="status" className="sr-only" />
    </>
  );
}
