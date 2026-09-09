"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import { translations } from "../lib/i18n/translations";

type Language = "fr" | "en";

export default function Navbar() {
  const [language, setLanguage] = useState<Language>("fr");

  useEffect(() => {
    const saved = window.localStorage.getItem("eforeigner-language");

    if (saved === "en" || saved === "fr") {
      setLanguage(saved);
    }

    const handleLanguageChange = (event: Event) => {
      const customEvent = event as CustomEvent<Language>;
      setLanguage(customEvent.detail);
    };

    window.addEventListener(
      "eforeigner-language-change",
      handleLanguageChange
    );

    return () => {
      window.removeEventListener(
        "eforeigner-language-change",
        handleLanguageChange
      );
    };
  }, []);

  const t = translations[language];

  return (
    <nav className="bg-blue-900 text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <Link href="/" className="shrink-0 text-2xl font-bold">
          🇨🇩 eForeigner DRC
        </Link>

        <div className="hidden items-center gap-6 lg:flex">
          <Link href="/" className="transition hover:text-yellow-300">
            {t.nav.home}
          </Link>

          <Link
            href="/dashboard"
            className="transition hover:text-yellow-300"
          >
            {t.nav.dashboard}
          </Link>

          <Link href="/visa" className="transition hover:text-yellow-300">
            {t.nav.visa}
          </Link>

          <Link
            href="/track"
            className="transition hover:text-yellow-300"
          >
            {t.nav.track}
          </Link>

          <Link
            href="/profile"
            className="transition hover:text-yellow-300"
          >
            {t.nav.profile}
          </Link>

          <Link
            href="/contact"
            className="transition hover:text-yellow-300"
          >
            {t.nav.contact}
          </Link>

          <LanguageSwitcher />

          <Link
            href="/login"
            className="rounded-lg bg-white px-5 py-2 font-semibold text-blue-900 transition hover:bg-gray-200"
          >
            {t.nav.login}
          </Link>

          <Link
            href="/register"
            className="rounded-lg border border-white px-5 py-2 transition hover:bg-white hover:text-blue-900"
          >
            {t.nav.register}
          </Link>
        </div>

        <div className="lg:hidden">
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
}