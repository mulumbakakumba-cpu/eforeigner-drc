"use client";

import { useEffect, useState } from "react";

type Language = "fr" | "en";

type Application = {
  applicationId: string;
  fullName: string;
  email: string;
  nationality: string;
  status: string;
  purpose: string;
};

function getLanguage(): Language {
  if (typeof window === "undefined") return "fr";

  return window.localStorage.getItem("eforeigner-language") === "en"
    ? "en"
    : "fr";
}

const translations = {
  fr: {
    title: "Suivre ma demande",
    description:
      "Entrez votre numéro de demande pour consulter son statut.",
    applicationId: "Numéro de demande",
    placeholder: "DRC-2026-123456",
    search: "Rechercher",
    searching: "Recherche...",
    details: "Détails de la demande",
    id: "Numéro",
    name: "Nom complet",
    email: "E-mail",
    nationality: "Nationalité",
    status: "Statut",
    purpose: "Motif",
    progress: "Progression de la demande",
    submitted: "Demande soumise",
    notFound: "Demande introuvable.",
    error: "Une erreur est survenue. Veuillez réessayer.",
    required: "Veuillez saisir un numéro de demande.",
    steps: {
      submitted: "Demande soumise",
      documents: "Documents validés",
      medical: "Examen médical",
      payment: "Paiement vérifié",
      immigration: "Décision d'immigration",
    },
  },

  en: {
    title: "Track My Application",
    description:
      "Enter your application number to check its current status.",
    applicationId: "Application Number",
    placeholder: "DRC-2026-123456",
    search: "Search",
    searching: "Searching...",
    details: "Application Details",
    id: "Number",
    name: "Full Name",
    email: "Email",
    nationality: "Nationality",
    status: "Status",
    purpose: "Purpose",
    progress: "Application Progress",
    submitted: "Application submitted",
    notFound: "Application not found.",
    error: "Something went wrong. Please try again.",
    required: "Please enter an application number.",
    steps: {
      submitted: "Application submitted",
      documents: "Documents validated",
      medical: "Medical examination",
      payment: "Payment verified",
      immigration: "Immigration decision",
    },
  },
};

export default function TrackPage() {
  const [language, setLanguage] =
    useState<Language>(getLanguage());

  const [applicationId, setApplicationId] = useState("");
  const [application, setApplication] =
    useState<Application | null>(null);

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

  async function handleSearch(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const trimmedId = applicationId.trim();

    setError("");
    setApplication(null);

    if (!trimmedId) {
      setError(t.required);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationId: trimmedId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || t.notFound);
        return;
      }

      setApplication(data.application);
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }

  function getProgress(status: string) {
    switch (status) {
      case "Approved":
        return 100;

      case "Rejected":
        return 100;

      case "Submitted":
      default:
        return 20;
    }
  }

  const progress = application
    ? getProgress(application.status)
    : 0;

  const progressSteps = [
    {
      percentage: 20,
      label: t.steps.submitted,
    },
    {
      percentage: 40,
      label: t.steps.documents,
    },
    {
      percentage: 60,
      label: t.steps.medical,
    },
    {
      percentage: 80,
      label: t.steps.payment,
    },
    {
      percentage: 100,
      label: t.steps.immigration,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
          <div className="text-center">
            <div className="text-4xl">🇨🇩</div>

            <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mt-3">
              {t.title}
            </h1>

            <p className="text-gray-600 mt-3">
              {t.description}
            </p>
          </div>

          <form
            onSubmit={handleSearch}
            className="mt-8"
          >
            <label className="block font-semibold text-gray-700 mb-2">
              {t.applicationId}
            </label>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={applicationId}
                onChange={(e) =>
                  setApplicationId(e.target.value)
                }
                placeholder={t.placeholder}
                className="border border-gray-300 rounded-lg p-3 flex-1 focus:ring-2 focus:ring-blue-500 outline-none"
              />

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 disabled:bg-gray-400 transition"
              >
                {loading ? t.searching : t.search}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {application && (
            <div className="mt-10 space-y-8">
              <div className="border rounded-xl p-6">
                <h2 className="text-2xl font-bold text-blue-900">
                  {t.details}
                </h2>

                <div className="grid md:grid-cols-2 gap-4 mt-6">
                  <div>
                    <p className="text-sm text-gray-500">
                      {t.id}
                    </p>
                    <p className="font-bold text-blue-900 mt-1">
                      {application.applicationId}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      {t.name}
                    </p>
                    <p className="font-semibold mt-1">
                      {application.fullName}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      {t.email}
                    </p>
                    <p className="font-semibold mt-1 break-all">
                      {application.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      {t.nationality}
                    </p>
                    <p className="font-semibold mt-1">
                      {application.nationality}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      {t.status}
                    </p>
                    <span className="inline-flex mt-1 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-bold">
                      {application.status}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      {t.purpose}
                    </p>
                    <p className="font-semibold mt-1">
                      {application.purpose}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border rounded-xl p-6">
                <h2 className="text-2xl font-bold text-blue-900">
                  {t.progress}
                </h2>

                <div className="mt-6">
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span>{t.submitted}</span>
                    <span>{progress}%</span>
                  </div>

                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-700 rounded-full transition-all duration-500"
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  {progressSteps.map((step) => {
                    const completed =
                      progress >= step.percentage;

                    const current =
                      progress === step.percentage;

                    return (
                      <div
                        key={step.percentage}
                        className={`flex items-center gap-4 rounded-lg p-4 border ${
                          completed
                            ? "bg-green-50 border-green-200"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            completed
                              ? "bg-green-600 text-white"
                              : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          {completed
                            ? "✓"
                            : step.percentage}
                        </div>

                        <div className="flex-1">
                          <p
                            className={`font-semibold ${
                              completed
                                ? "text-green-800"
                                : "text-gray-600"
                            }`}
                          >
                            {step.label}
                          </p>

                          <p className="text-sm text-gray-500">
                            {step.percentage}%
                          </p>
                        </div>

                        {current && (
                          <span className="text-xs font-bold text-blue-700">
                            {language === "fr"
                              ? "ÉTAPE ACTUELLE"
                              : "CURRENT STEP"}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}