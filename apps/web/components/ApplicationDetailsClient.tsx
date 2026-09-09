"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ApplicationTimeline from "./ApplicationTimeline";
import PaymentPanel from "./PaymentPanel";

type Language = "fr" | "en";

type Payment = {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  reference: string | null;
  paidAt: string | null;
  verifiedAt: string | null;
};

type Application = {
  id: string;
  applicationId: string;
  fullName: string;
  email: string;
  nationality: string;
  passportNumber: string;
  purpose: string;
  status: string;
  createdAt: string;
  residenceJourney: {
    percentage: number;
    payments: Payment[];
  } | null;
};

type Props = {
  application: Application;
};

const translations = {
  fr: {
    title: "Ma demande",
    applicationId: "Numéro de demande",
    fullName: "Nom complet",
    email: "Adresse e-mail",
    nationality: "Nationalité",
    passport: "Numéro de passeport",
    purpose: "Motif",
    status: "Statut",
    submitted: "Soumise le",
    progress: "Progression de la demande",
    receipt: "Télécharger le reçu",
    back: "Retour à mes demandes",
    applicationType: "Demande d'immigration",
    currentProgress: "Progression actuelle",
    noJourney: "Aucun parcours de résidence disponible.",
  },

  en: {
    title: "My Application",
    applicationId: "Application Number",
    fullName: "Full Name",
    email: "Email Address",
    nationality: "Nationality",
    passport: "Passport Number",
    purpose: "Purpose",
    status: "Status",
    submitted: "Submitted on",
    progress: "Application Progress",
    receipt: "Download Receipt",
    back: "Back to my applications",
    applicationType: "Immigration Application",
    currentProgress: "Current Progress",
    noJourney: "No residence journey available.",
  },
};

function getLanguage(): Language {
  if (typeof window === "undefined") {
    return "fr";
  }

  return window.localStorage.getItem("eforeigner-language") === "en"
    ? "en"
    : "fr";
}

function formatDate(
  value: string,
  language: Language
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(
    language === "fr" ? "fr-FR" : "en-US",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
}

export default function ApplicationDetailsClient({
  application,
}: Props) {
  const [language, setLanguage] =
    useState<Language>(getLanguage());

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

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 md:p-8">
      <div className="mx-auto max-w-5xl">

        {/* Navigation */}
        <div className="mb-5">
          <Link
            href="/applications"
            className="text-sm font-semibold text-blue-700 hover:underline"
          >
            ← {t.back}
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-xl md:p-8">

          {/* Header */}
          <div className="flex flex-col gap-4 border-b pb-6 md:flex-row md:items-center md:justify-between">

            <div>
              <div className="flex items-center gap-3">
                <span className="text-3xl">🇨🇩</span>

                <div>
                  <p className="text-sm font-semibold text-blue-600">
                    {t.applicationType}
                  </p>

                  <h1 className="text-3xl font-bold text-blue-900">
                    {t.title}
                  </h1>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-blue-50 px-5 py-3 text-center">
              <p className="text-xs font-semibold uppercase text-blue-600">
                {t.currentProgress}
              </p>

              <p className="text-3xl font-bold text-blue-900">
                {application.residenceJourney?.percentage ?? 20}%
              </p>
            </div>

          </div>

          {/* Application information */}
          <section className="mt-8">
            <h2 className="text-xl font-bold text-blue-900">
              {t.title}
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">

              <Info
                label={t.applicationId}
                value={application.applicationId}
                highlight
              />

              <Info
                label={t.status}
                value={application.status}
              />

              <Info
                label={t.fullName}
                value={application.fullName}
              />

              <Info
                label={t.email}
                value={application.email}
              />

              <Info
                label={t.nationality}
                value={application.nationality}
              />

              <Info
                label={t.passport}
                value={application.passportNumber}
              />

              <Info
                label={t.purpose}
                value={application.purpose}
              />

              <Info
                label={t.submitted}
                value={formatDate(
                  application.createdAt,
                  language
                )}
              />

            </div>
          </section>

          {/* Application timeline */}
          <section className="mt-10 border-t pt-8">
            <h2 className="mb-5 text-2xl font-bold text-blue-900">
              {t.progress}
            </h2>

            <ApplicationTimeline
              status={application.status}
            />
          </section>

          {/* Payment */}
          {application.residenceJourney ? (
            <section className="mt-8">
              <PaymentPanel
                applicationId={application.id}
                percentage={
                  application.residenceJourney.percentage
                }
                payments={
                  application.residenceJourney.payments
                }
              />
            </section>
          ) : (
            <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-5 text-gray-600">
              {t.noJourney}
            </div>
          )}

          {/* Receipt */}
          <div className="mt-8 flex flex-col gap-3 border-t pt-8 sm:flex-row">

            <a
              href={`/api/applications/${application.applicationId}/receipt`}
              className="rounded-lg bg-blue-700 px-5 py-3 text-center font-semibold text-white transition hover:bg-blue-800"
            >
              📄 {t.receipt}
            </a>

            <Link
              href="/applications"
              className="rounded-lg border border-gray-200 px-5 py-3 text-center font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              {t.back}
            </Link>

          </div>

        </div>
      </div>
    </main>
  );
}

function Info({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p
        className={`mt-1 break-words font-semibold ${
          highlight
            ? "text-blue-900"
            : "text-gray-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}