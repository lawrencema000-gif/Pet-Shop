"use client";

import { useEffect, useState, type ReactNode } from "react";
import "@/i18n";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Set the HTML lang attribute on mount and language change
    document.documentElement.lang = i18n.language;
    const handleLangChange = (lng: string) => {
      document.documentElement.lang = lng;
    };
    i18n.on("languageChanged", handleLangChange);
    setMounted(true);
    return () => {
      i18n.off("languageChanged", handleLangChange);
    };
  }, []);

  if (!mounted) return null;

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
