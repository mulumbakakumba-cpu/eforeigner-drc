"use client";

import Link from "next/link";
import {
  ArrowRight,
  FileText,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { translations } from "@/lib/i18n/translations";
import LanguageSwitcher from "./LanguageSwitcher";

type Language = "fr" | "en";

export default function Hero() {
  const [language, setLanguage] = useState<Language>("fr");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem(
      "eforeigner-language"
    ) as Language | null;

    if (savedLanguage === "fr" || savedLanguage === "en") {
      setLanguage(savedLanguage);
    }

    setMounted(true);

    const handleLanguageChange = () => {
      const currentLanguage = localStorage.getItem(
        "eforeigner-language"
      ) as Language | null;

      if (currentLanguage === "fr" || currentLanguage === "en") {
        setLanguage(currentLanguage);
      }
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

  const t = translations[language].home;

  if (!mounted) {
    return null;
  }

  return (
    <section className="relative min-h-[680px] overflow-hidden bg-slate-950 text-white">

      {/* ================= BACKGROUND ================= */}

      <div className="absolute inset-0">

        <div className="absolute -left-32 -top-32 h-96 w-96 animate-pulse rounded-full bg-blue-600/20 blur-3xl" />

        <div className="absolute -bottom-40 -right-32 h-[500px] w-[500px] animate-pulse rounded-full bg-red-600/10 blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(30,64,175,0.22),transparent_55%)]" />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* ================= FLOATING ELEMENTS ================= */}

      <div className="absolute left-[8%] top-[20%] hidden animate-[float_5s_ease-in-out_infinite] rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md lg:block">
        <MapPin
          size={25}
          className="text-blue-400"
        />
      </div>

      <div className="absolute right-[10%] top-[28%] hidden animate-[float_6s_ease-in-out_infinite] rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md lg:block">
        <ShieldCheck
          size={25}
          className="text-green-400"
        />
      </div>

      {/* ================= CONTENT ================= */}

      <div className="relative z-10 mx-auto flex min-h-[680px] max-w-7xl items-center px-6 py-20">

        <div className="w-full">

          {/* Language */}
          <div className="mb-8 flex justify-end animate-[fadeIn_0.6s_ease-out_both]">
            <LanguageSwitcher />
          </div>

          {/* ================= BRAND ================= */}

          <div className="mb-7 flex animate-[fadeInUp_0.8s_ease-out_0.2s_both] items-center gap-3">

            <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-2xl shadow-lg backdrop-blur-md animate-[logoPulse_3s_ease-in-out_infinite]">
              🇨🇩
            </span>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
                eForeigner DRC
              </p>

              <p className="text-sm text-slate-400">
                {language === "fr"
                  ? "Portail numérique de l'immigration"
                  : "Digital Immigration Portal"}
              </p>
            </div>

          </div>

          {/* ================= MAIN TITLE ================= */}

          <div className="max-w-4xl">

            <h1 className="animate-[heroTitle_1.2s_ease-out_0.4s_both] text-5xl font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">

              {language === "fr" ? (
                <>
                  Bienvenue sur le

                  <span className="mt-2 block bg-gradient-to-r from-blue-300 via-white to-red-300 bg-clip-text text-transparent">
                    portail de l'immigration
                  </span>

                  <span className="mt-2 block">
                    en République démocratique du Congo.
                  </span>
                </>
              ) : (
                <>
                  Welcome to the

                  <span className="mt-2 block bg-gradient-to-r from-blue-300 via-white to-red-300 bg-clip-text text-transparent">
                    Immigration Portal
                  </span>

                  <span className="mt-2 block">
                    of the Democratic Republic of Congo.
                  </span>
                </>
              )}

            </h1>

            {/* ================= DESCRIPTION ================= */}

            <p className="mt-8 max-w-2xl animate-[fadeInUp_1s_ease-out_0.9s_both] text-lg leading-8 text-slate-300 sm:text-xl">

              {language === "fr"
                ? "Effectuez vos démarches administratives en ligne, transmettez vos documents et suivez l'évolution de votre dossier depuis un espace sécurisé, simple et moderne."
                : "Complete your immigration procedures online, submit your documents and track your application through a secure, simple and modern digital space."}

            </p>

            {/* ================= BUTTONS ================= */}

            <div className="mt-10 flex animate-[fadeInUp_1s_ease-out_1.2s_both] flex-col gap-4 sm:flex-row">

              <Link
                href="/login"
                className="group inline-flex items-center justify-center gap-3 rounded-xl bg-white px-7 py-4 font-bold text-slate-950 shadow-xl transition duration-300 hover:-translate-y-1 hover:bg-slate-100 hover:shadow-2xl"
              >
                {t.login}

                <ArrowRight
                  size={19}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>

              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-3 rounded-xl border border-white/20 bg-white/10 px-7 py-4 font-bold text-white backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-white/15"
              >
                <FileText size={19} />

                {t.register}
              </Link>

            </div>

            {/* ================= TRUST CARDS ================= */}

            <div className="mt-12 grid max-w-3xl gap-4 animate-[fadeInUp_1s_ease-out_1.5s_both] sm:grid-cols-3">

              <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-white/10">

                <ShieldCheck
                  size={22}
                  className="mb-3 text-green-400"
                />

                <p className="font-semibold">
                  {language === "fr"
                    ? "Espace sécurisé"
                    : "Secure space"}
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  {language === "fr"
                    ? "Vos informations sont protégées."
                    : "Your information is protected."}
                </p>

              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-white/10">

                <FileText
                  size={22}
                  className="mb-3 text-blue-400"
                />

                <p className="font-semibold">
                  {language === "fr"
                    ? "Démarches en ligne"
                    : "Online procedures"}
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  {language === "fr"
                    ? "Déposez vos demandes facilement."
                    : "Submit your applications easily."}
                </p>

              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-white/10">

                <MapPin
                  size={22}
                  className="mb-3 text-red-400"
                />

                <p className="font-semibold">
                  {language === "fr"
                    ? "Suivi en temps réel"
                    : "Real-time tracking"}
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  {language === "fr"
                    ? "Suivez votre dossier à chaque étape."
                    : "Track your application at every step."}
                </p>

              </div>

            </div>

          </div>
        </div>
      </div>

      {/* ================= BOTTOM GLOW ================= */}

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 to-transparent" />

      {/* ================= ANIMATIONS ================= */}

      <style jsx>{`

        @keyframes fadeIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes heroTitle {
          0% {
            opacity: 0;
            transform: translateY(45px) scale(0.97);
            filter: blur(8px);
          }

          60% {
            opacity: 1;
            filter: blur(0);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-15px);
          }
        }

        @keyframes logoPulse {
          0%,
          100% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.06);
          }
        }

      `}</style>

    </section>
  );
}