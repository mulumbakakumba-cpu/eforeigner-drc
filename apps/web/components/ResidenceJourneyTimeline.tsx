"use client";

import { useEffect, useMemo, useState } from "react";

type Language = "fr" | "en";

type JourneyStep = {
  id: string;
  step: string;
  percentage: number;
  status: string;
  startedAt: Date | string | null;
  completedAt: Date | string | null;
  verifiedBy: string | null;
  notes: string | null;
};

type MedicalVerification = {
  status: string;
  hospital: string | null;
  verifiedAt: Date | string | null;
  verifiedBy: string | null;
  notes: string | null;
} | null;

type Payment = {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  reference: string | null;
  paidAt: Date | string | null;
  verifiedAt: Date | string | null;
  verifiedBy: string | null;
};

type ImmigrationReview = {
  status: string;
  reviewedAt: Date | string | null;
  reviewedBy: string | null;
  decision: string | null;
  notes: string | null;
} | null;

type ResidenceJourney = {
  id: string;
  applicationId: string;
  percentage: number;
  currentStep: string;
  status: string;
  startedAt: Date | string;
  completedAt: Date | string | null;
  steps: JourneyStep[];
  medical: MedicalVerification;
  payments: Payment[];
  immigration: ImmigrationReview;
};

type Props = {
  journey: ResidenceJourney | null;
};

const translations = {
  fr: {
    title: "Parcours de résidence",
    description:
      "Suivez les différentes étapes du traitement de votre demande.",
    progress: "Progression",
    completed: "Terminé",
    current: "Étape actuelle",
    pending: "À venir",
    completedOn: "Terminé le",
    startedOn: "Commencé le",
    officer: "Agent",
    note: "Note",
    noJourney: "Aucun parcours de résidence disponible.",
    noJourneyDescription:
      "Votre parcours apparaîtra ici dès que votre demande sera enregistrée.",
    status: {
      completed: "TERMINÉ",
      current: "EN COURS",
      pending: "À VENIR",
    },
    steps: {
      ACCOUNT_CREATED: {
        title: "Compte créé",
        description:
          "Votre compte eForeigner DRC a été créé.",
      },
      PROFILE_COMPLETED: {
        title: "Profil et documents",
        description:
          "Vos informations et documents sont vérifiés.",
      },
      MEDICAL_VERIFIED: {
        title: "Examen médical",
        description:
          "Votre examen médical est vérifié.",
      },
      PAYMENT_VERIFIED: {
        title: "Paiement et taxes",
        description:
          "Votre paiement est vérifié par le service compétent.",
      },
      IMMIGRATION_APPROVED: {
        title: "Décision d'immigration",
        description:
          "Votre demande fait l'objet de la décision finale.",
      },
    },
  },

  en: {
    title: "Residence Journey",
    description:
      "Follow the different stages of your application processing.",
    progress: "Progress",
    completed: "Completed",
    current: "Current step",
    pending: "Upcoming",
    completedOn: "Completed on",
    startedOn: "Started on",
    officer: "Officer",
    note: "Note",
    noJourney: "No residence journey available.",
    noJourneyDescription:
      "Your journey will appear here once your application is registered.",
    status: {
      completed: "COMPLETED",
      current: "IN PROGRESS",
      pending: "UPCOMING",
    },
    steps: {
      ACCOUNT_CREATED: {
        title: "Account Created",
        description:
          "Your eForeigner DRC account has been created.",
      },
      PROFILE_COMPLETED: {
        title: "Profile & Documents",
        description:
          "Your information and documents are being verified.",
      },
      MEDICAL_VERIFIED: {
        title: "Medical Examination",
        description:
          "Your medical examination is being verified.",
      },
      PAYMENT_VERIFIED: {
        title: "Payment & Taxes",
        description:
          "Your payment is being verified by the competent service.",
      },
      IMMIGRATION_APPROVED: {
        title: "Immigration Decision",
        description:
          "Your application is undergoing the final decision.",
      },
    },
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
  value: Date | string | null,
  language: Language
) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(
    language === "fr" ? "fr-FR" : "en-US",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

export default function ResidenceJourneyTimeline({
  journey,
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

  const orderedSteps = useMemo(() => {
    if (!journey) return [];

    const order = [
      "ACCOUNT_CREATED",
      "PROFILE_COMPLETED",
      "MEDICAL_VERIFIED",
      "PAYMENT_VERIFIED",
      "IMMIGRATION_APPROVED",
    ];

    return [...journey.steps].sort(
      (a, b) =>
        order.indexOf(a.step) -
        order.indexOf(b.step)
    );
  }, [journey]);

  if (!journey) {
    return (
      <section className="rounded-xl border border-blue-100 bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="text-4xl">📋</div>

          <h2 className="mt-3 text-xl font-bold text-blue-900">
            {t.noJourney}
          </h2>

          <p className="mt-2 text-gray-500">
            {t.noJourneyDescription}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">

      {/* Header */}
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

        <div>
          <h2 className="text-2xl font-bold text-blue-900">
            {t.title}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {t.description}
          </p>
        </div>

        <div className="rounded-xl bg-blue-50 px-5 py-3 text-center">
          <p className="text-xs font-semibold uppercase text-blue-600">
            {t.progress}
          </p>

          <p className="mt-1 text-3xl font-bold text-blue-900">
            {journey.percentage}%
          </p>
        </div>

      </div>

      {/* Progress bar */}
      <div className="mt-7">
        <div className="h-4 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-blue-700 transition-all duration-700"
            style={{
              width: `${journey.percentage}%`,
            }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="mt-8 space-y-5">

        {orderedSteps.map((step, index) => {
          const stepTranslation =
            t.steps[
              step.step as keyof typeof t.steps
            ];

          const completed =
            step.percentage <= journey.percentage;

          const current =
            step.percentage === journey.percentage &&
            journey.status !== "COMPLETED";

          const statusText = completed
            ? current
              ? t.status.current
              : t.status.completed
            : t.status.pending;

          const statusColor = completed
            ? current
              ? "bg-blue-100 text-blue-700"
              : "bg-green-100 text-green-700"
            : "bg-gray-100 text-gray-500";

          const circleColor = completed
            ? current
              ? "bg-blue-700"
              : "bg-green-600"
            : "bg-gray-300";

          return (
            <div
              key={step.id}
              className={`relative rounded-xl border p-5 transition ${
                current
                  ? "border-blue-300 bg-blue-50"
                  : completed
                    ? "border-green-200 bg-green-50/50"
                    : "border-gray-200 bg-gray-50"
              }`}
            >

              {/* Connector */}
              {index < orderedSteps.length - 1 && (
                <div className="absolute left-[29px] top-[68px] hidden h-8 w-0.5 bg-gray-200 md:block" />
              )}

              <div className="flex items-start gap-4">

                {/* Number / Check */}
                <div
                  className={`relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${circleColor}`}
                >
                  {completed ? "✓" : step.percentage}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">

                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">

                    <div>
                      <h3
                        className={`text-lg font-bold ${
                          completed
                            ? current
                              ? "text-blue-900"
                              : "text-green-900"
                            : "text-gray-600"
                        }`}
                      >
                        {stepTranslation?.title ??
                          step.step}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {stepTranslation?.description}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${statusColor}`}
                    >
                      {statusText}
                    </span>

                  </div>

                  {/* Percentage */}
                  <div className="mt-4 flex items-center gap-3">

                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={`h-full rounded-full ${
                          completed
                            ? current
                              ? "bg-blue-600"
                              : "bg-green-600"
                            : "bg-gray-300"
                        }`}
                        style={{
                          width: `${Math.min(
                            journey.percentage,
                            step.percentage
                          ) /
                            step.percentage *
                            100}%`,
                        }}
                      />
                    </div>

                    <span className="text-sm font-bold text-gray-600">
                      {step.percentage}%
                    </span>

                  </div>

                  {/* Dates */}
                  <div className="mt-4 flex flex-col gap-1 text-xs text-gray-500">

                    {step.startedAt && (
                      <span>
                        {t.startedOn}:{" "}
                        {formatDate(
                          step.startedAt,
                          language
                        )}
                      </span>
                    )}

                    {step.completedAt && (
                      <span>
                        {t.completedOn}:{" "}
                        {formatDate(
                          step.completedAt,
                          language
                        )}
                      </span>
                    )}

                  </div>

                  {/* Officer */}
                  {step.verifiedBy && (
                    <p className="mt-3 text-xs text-gray-500">
                      <span className="font-semibold">
                        {t.officer}:
                      </span>{" "}
                      {step.verifiedBy}
                    </p>
                  )}

                  {/* Note */}
                  {step.notes && (
                    <div className="mt-3 rounded-lg bg-white/80 p-3 text-sm text-gray-600">
                      <span className="font-semibold">
                        {t.note}:
                      </span>{" "}
                      {step.notes}
                    </div>
                  )}

                </div>
              </div>
            </div>
          );
        })}

      </div>

      {/* Journey completion */}
      {journey.status === "COMPLETED" && (
        <div className="mt-7 rounded-xl border border-green-200 bg-green-50 p-5 text-center">

          <div className="text-3xl">
            🎉
          </div>

          <p className="mt-2 font-bold text-green-800">
            {t.completed}
          </p>

          {journey.completedAt && (
            <p className="mt-1 text-sm text-green-700">
              {t.completedOn}:{" "}
              {formatDate(
                journey.completedAt,
                language
              )}
            </p>
          )}

        </div>
      )}

    </section>
  );
}