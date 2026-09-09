"use client";

import { useEffect, useState } from "react";
import { translations } from "../lib/i18n/translations";

type Language = "fr" | "en";

function getLanguage(): Language {
  if (typeof window === "undefined") return "fr";

  return window.localStorage.getItem("eforeigner-language") === "en"
    ? "en"
    : "fr";
}

export default function Footer() {
  const [language, setLanguage] = useState<Language>(getLanguage());

  useEffect(() => {
    const updateLanguage = () => {
      setLanguage(getLanguage());
    };

    window.addEventListener(
      "eforeigner-language-change",
      updateLanguage
    );

    return () => {
      window.removeEventListener(
        "eforeigner-language-change",
        updateLanguage
      );
    };
  }, []);

  const t = translations[language].home;

  return (
    <footer className="bg-blue-950 text-white py-10 mt-12">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="text-xl font-bold">
          🇨🇩 eForeigner DRC
        </div>

        <p className="text-blue-200 mt-3">
          {t.ministry}
        </p>

        <div className="border-t border-white/10 mt-8 pt-5">
          <p className="text-sm text-gray-300">
            © 2026 eForeigner DRC. {t.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}