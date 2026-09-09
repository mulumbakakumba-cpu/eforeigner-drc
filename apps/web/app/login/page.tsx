"use client";

import Link from "next/link";
import { getSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { translations } from "../../lib/i18n/translations";

type Language = "fr" | "en";

function getLanguage(): Language {
  if (typeof window === "undefined") return "fr";

  return window.localStorage.getItem("eforeigner-language") === "en"
    ? "en"
    : "fr";
}

export default function LoginPage() {
  const [language, setLanguage] = useState<Language>(getLanguage());
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError(
        language === "fr"
          ? "Veuillez remplir tous les champs."
          : "Please fill in all fields."
      );
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(
          language === "fr"
            ? "Adresse e-mail ou mot de passe incorrect."
            : "Invalid email or password."
        );
        return;
      }

      const session = await getSession();
      const role = (session?.user as { role?: string })?.role;

      if (role === "officer") {
        window.location.href = "/officer";
      } else if (role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }
    } catch {
      setError(
        language === "fr"
          ? "Une erreur est survenue. Veuillez réessayer."
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Language selector */}
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={() => {
              const nextLanguage =
                language === "fr" ? "en" : "fr";

              window.localStorage.setItem(
                "eforeigner-language",
                nextLanguage
              );

              window.dispatchEvent(
                new CustomEvent("eforeigner-language-change")
              );

              setLanguage(nextLanguage);
            }}
            className="bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 text-sm font-semibold text-blue-900 hover:bg-gray-50 transition"
          >
            {language === "fr" ? "🇬🇧 EN" : "🇫🇷 FR"}
          </button>
        </div>

        <div className="bg-white shadow-xl rounded-2xl p-8 md:p-10">
          {/* Logo */}
          <div className="text-center">
            <div className="text-4xl">🇨🇩</div>

            <h1 className="text-3xl font-bold text-blue-900 mt-3">
              eForeigner DRC
            </h1>

            <p className="text-gray-500 text-center mt-2">
              {language === "fr"
                ? "Bienvenue sur le portail officiel"
                : "Welcome to the official portal"}
            </p>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800">
              {language === "fr" ? "Connexion" : "Sign In"}
            </h2>

            <p className="text-gray-500 mt-1">
              {language === "fr"
                ? "Connectez-vous à votre compte"
                : "Sign in to your account"}
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5"
          >
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                {language === "fr"
                  ? "Adresse e-mail"
                  : "Email Address"}
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder={
                  language === "fr"
                    ? "exemple@email.com"
                    : "example@email.com"
                }
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                {language === "fr"
                  ? "Mot de passe"
                  : "Password"}
              </label>

              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder={
                  language === "fr"
                    ? "Entrez votre mot de passe"
                    : "Enter your password"
                }
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-900 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 disabled:bg-gray-400 transition"
            >
              {loading
                ? language === "fr"
                  ? "Connexion..."
                  : "Signing in..."
                : language === "fr"
                  ? "Se connecter"
                  : "Sign In"}
            </button>
          </form>

          {/* Register */}
          <div className="mt-8 text-center border-t pt-6">
            <p className="text-gray-500 text-sm">
              {language === "fr"
                ? "Vous n'avez pas encore de compte ?"
                : "Don't have an account yet?"}
            </p>

            <Link
              href="/register"
              className="inline-block mt-2 text-blue-900 font-semibold hover:underline"
            >
              {language === "fr"
                ? "Créer un compte"
                : "Create an account"}
            </Link>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 mt-8">
            © 2026 eForeigner DRC
          </p>
        </div>
      </div>
    </main>
  );
}