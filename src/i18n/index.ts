import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import ja from "./locales/ja.json";
import zh from "./locales/zh.json";
import ko from "./locales/ko.json";

// One-time migration: set Japanese as default on first visit
if (typeof window !== "undefined" && !localStorage.getItem("i18nextLng")) {
  localStorage.setItem("i18nextLng", "ja");
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ja: { translation: ja },
      zh: { translation: zh },
      ko: { translation: ko },
    },
    fallbackLng: "ja",
    supportedLngs: ["ja", "en", "zh", "ko"],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ["localStorage"],
      lookupLocalStorage: "i18nextLng",
      caches: ["localStorage"],
    },
  });

export default i18n;
