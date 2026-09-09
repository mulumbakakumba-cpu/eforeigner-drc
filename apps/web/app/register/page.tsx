"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Language = "fr" | "en";

function getLanguage(): Language {
  if (typeof window === "undefined") return "fr";

  return window.localStorage.getItem("eforeigner-language") === "en"
    ? "en"
    : "fr";
}

const translations = {
  fr: {
    createAccount: "Créer un compte",
    welcome: "Créez votre compte eForeigner DRC",
    fullName: "Nom complet",
    email: "Adresse e-mail",
    password: "Mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    fullNamePlaceholder: "Votre nom complet",
    emailPlaceholder: "exemple@email.com",
    passwordPlaceholder: "Choisissez un mot de passe",
    confirmPlaceholder: "Confirmez votre mot de passe",
    register: "Créer mon compte",
    registering: "Création du compte...",
    alreadyAccount: "Vous avez déjà un compte ?",
    login: "Se connecter",
    required: "Veuillez remplir tous les champs.",
    passwordMismatch: "Les mots de passe ne correspondent pas.",
    passwordLength:
      "Le mot de passe doit contenir au moins 8 caractères.",
    success:
      "Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.",
    error: "Impossible de créer le compte. Veuillez réessayer.",
    emailExists:
      "Cette adresse e-mail est déjà utilisée.",
  },

  en: {
    createAccount: "Create an Account",
    welcome: "Create your eForeigner DRC account",
    fullName: "Full Name",
    email: "Email Address",
    password: "Password",
    confirmPassword: "Confirm Password",
    fullNamePlaceholder: "Your full name",
    emailPlaceholder: "example@email.com",
    passwordPlaceholder: "Choose a password",
    confirmPlaceholder: "Confirm your password",
    register: "Create My Account",
    registering: "Creating account...",
    alreadyAccount: "Already have an account?",
    login: "Sign In",
    required: "Please fill in all fields.",
    passwordMismatch: "Passwords do not match.",
    passwordLength:
      "Password must contain at least 8 characters.",
    success:
      "Your account has been created successfully. You can now sign in.",
    error: "Unable to create the account. Please try again.",
    emailExists: "This email address is already in use.",
  },
};

export default function RegisterPage() {
  const [language, setLanguage] =
    useState<Language>(getLanguage());

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setForm((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));

    setError("");
    setSuccess("");
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");

    const fullName = form.fullName.trim();
    const email = form.email.trim();

    if (
      !fullName ||
      !email ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError(t.required);
      return;
    }

    if (form.password.length < 8) {
      setError(t.passwordLength);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const message = String(data.message || "");

        if (
          message.toLowerCase().includes("already") ||
          message.toLowerCase().includes("exist") ||
          message.toLowerCase().includes("unique")
        ) {
          setError(t.emailExists);
        } else {
          setError(data.message || t.error);
        }

        return;
      }

      setSuccess(t.success);

      setForm({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }

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

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Language switcher */}
        <div className="flex justify-end mb-4">
          <button
            type="button"
            onClick={toggleLanguage}
            className="bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 text-sm font-semibold text-blue-900 hover:bg-gray-50 transition"
          >
            {language === "fr" ? "🇬🇧 EN" : "🇫🇷 FR"}
          </button>
        </div>

        <div className="bg-white shadow-xl rounded-2xl p-8 md:p-10">

          {/* Header */}
          <div className="text-center">
            <div className="text-4xl">🇨🇩</div>

            <h1 className="text-3xl font-bold text-blue-900 mt-3">
              eForeigner DRC
            </h1>

            <p className="text-gray-500 mt-2">
              {t.welcome}
            </p>
          </div>

          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800">
              {t.createAccount}
            </h2>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5"
          >

            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                {t.fullName}
              </label>

              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder={t.fullNamePlaceholder}
                value={form.fullName}
                onChange={handleChange}
                disabled={loading}
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                {t.email}
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder={t.emailPlaceholder}
                value={form.email}
                onChange={handleChange}
                disabled={loading}
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                {t.password}
              </label>

              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                placeholder={t.passwordPlaceholder}
                value={form.password}
                onChange={handleChange}
                disabled={loading}
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />

              <p className="text-xs text-gray-400 mt-1">
                {language === "fr"
                  ? "Minimum 8 caractères."
                  : "Minimum 8 characters."}
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                {t.confirmPassword}
              </label>

              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder={t.confirmPlaceholder}
                value={form.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-800 disabled:bg-gray-400 transition"
            >
              {loading ? t.registering : t.register}
            </button>
          </form>

          {/* Login */}
          <div className="mt-8 text-center border-t pt-6">
            <p className="text-gray-500 text-sm">
              {t.alreadyAccount}
            </p>

            <Link
              href="/login"
              className="inline-block mt-2 text-blue-900 font-semibold hover:underline"
            >
              {t.login}
            </Link>
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            © 2026 eForeigner DRC
          </p>
        </div>
      </div>
    </main>
  );
}