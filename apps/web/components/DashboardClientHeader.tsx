"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

type Language = "fr" | "en";

type Props = {
  fullName: string;
};

const translations = {
  fr: {
    welcome: "Bienvenue sur eForeigner DRC",
    subtitle:
      "Services numériques d'immigration — Ministère de l'Intérieur, République démocratique du Congo",
    manage:
      "Gérez vos services d'immigration depuis un seul espace.",
    logout: "Se déconnecter",
    loggingOut: "Déconnexion...",
    home: "Accueil",
  },

  en: {
    welcome: "Welcome to eForeigner DRC",
    subtitle:
      "Digital Immigration Services — Ministry of Interior, Democratic Republic of Congo",
    manage:
      "Manage your immigration services from one place.",
    logout: "Logout",
    loggingOut: "Signing out...",
    home: "Home",
  },
};

function getLanguage(): Language {
  if (typeof window === "undefined") return "fr";

  return window.localStorage.getItem("eforeigner-language") === "en"
    ? "en"
    : "fr";
}

export default function DashboardClientHeader({
  fullName,
}: Props) {
  const [language, setLanguage] =
    useState<Language>(getLanguage());

  const [loading, setLoading] = useState(false);

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

  const t = translations[language];

  function toggleLanguage() {
    const nextLanguage: Language =
      language === "fr" ? "en" : "fr";

    window.localStorage.setItem(
      "eforeigner-language",
      nextLanguage
    );

    window.dispatchEvent(
      new CustomEvent("eforeigner-language-change")
    );

    setLanguage(nextLanguage);
  }

  async function handleLogout() {
    setLoading(true);

    await signOut({
      callbackUrl: "/login",
    });
  }

  return (
    <header className="rounded-2xl bg-white p-6 shadow-sm md:p-8">

      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">

        <div>
          {/* LOGO / HOME */}
          <Link
            href="/"
            title={t.home}
            className="group inline-flex items-center gap-3 rounded-xl transition duration-200 hover:-translate-y-0.5"
          >
            <span className="text-3xl transition duration-200 group-hover:scale-110">
              🇨🇩
            </span>

            <div>
              <h1 className="text-2xl font-bold text-blue-900 transition-colors group-hover:text-blue-700 md:text-4xl">
                {t.welcome}
              </h1>

              <p className="mt-1 text-sm font-medium text-gray-500">
                {fullName}
              </p>
            </div>
          </Link>

          <p className="mt-4 max-w-3xl text-gray-600">
            {t.subtitle}
          </p>

          <p className="mt-1 text-gray-600">
            {t.manage}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">

          {/* LANGUAGE */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-blue-900 shadow-sm transition hover:bg-gray-50"
          >
            {language === "fr" ? "🇬🇧 EN" : "🇫🇷 FR"}
          </button>

          {/* LOGOUT */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loading}
            className="rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:bg-gray-400"
          >
            {loading ? t.loggingOut : t.logout}
          </button>

        </div>

      </div>

    </header>
  );
}