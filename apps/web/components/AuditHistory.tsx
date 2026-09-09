"use client";

import { useEffect, useState } from "react";

type AuditLog = {
  id: string;
  action: string;
  fromStep: string | null;
  toStep: string | null;
  fromPercentage: number | null;
  toPercentage: number | null;
  notes: string | null;
  createdAt: Date | string;
  officer?: {
    fullName: string;
    email: string;
  } | null;
};

type Props = {
  logs: AuditLog[];
};

const labels = {
  fr: {
    title: "Historique des opérations",
    subtitle: "Traçabilité complète du traitement de la demande",
    noHistory: "Aucune opération enregistrée.",
    officer: "Agent",
    action: "Action",
    transition: "Progression",
    notes: "Notes",
    documents: "Documents validés",
    medical: "Examen médical vérifié",
    payment: "Paiement vérifié",
    immigration: "Décision d'immigration approuvée",
    unknown: "Opération",
  },
  en: {
    title: "Audit History",
    subtitle: "Complete traceability of application processing",
    noHistory: "No operation has been recorded.",
    officer: "Officer",
    action: "Action",
    transition: "Progress",
    notes: "Notes",
    documents: "Documents validated",
    medical: "Medical examination verified",
    payment: "Payment verified",
    immigration: "Immigration decision approved",
    unknown: "Operation",
  },
};

function getLanguage(): "fr" | "en" {
  if (typeof window === "undefined") return "fr";

  const value = window.localStorage.getItem("eforeigner-language");

  return value === "en" ? "en" : "fr";
}

function getActionLabel(action: string, language: "fr" | "en") {
  const t = labels[language];

  switch (action) {
    case "VALIDATE_DOCUMENTS":
      return t.documents;
    case "VERIFY_MEDICAL":
      return t.medical;
    case "VERIFY_PAYMENT":
      return t.payment;
    case "APPROVE_IMMIGRATION":
      return t.immigration;
    default:
      return action.replaceAll("_", " ") || t.unknown;
  }
}

export default function AuditHistory({ logs }: Props) {
  const [language, setLanguage] = useState<"fr" | "en">(getLanguage());

  useEffect(() => {
    const updateLanguage = () => {
      setLanguage(getLanguage());
    };

    window.addEventListener(
      "eforeigner-language-change",
      updateLanguage
    );

    window.addEventListener("storage", updateLanguage);

    return () => {
      window.removeEventListener(
        "eforeigner-language-change",
        updateLanguage
      );
      window.removeEventListener("storage", updateLanguage);
    };
  }, []);

  const t = labels[language];

  return (
    <section className="bg-white rounded-xl shadow-xl p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-blue-900">
            {t.title}
          </h2>

          <p className="text-gray-500 mt-1">
            {t.subtitle}
          </p>
        </div>

        <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">
          {logs.length}
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
          {t.noHistory}
        </div>
      ) : (
        <div className="mt-8 relative">
          <div className="absolute left-3 top-2 bottom-2 w-px bg-gray-200" />

          <div className="space-y-8">
            {logs.map((log) => (
              <div key={log.id} className="relative pl-10">
                <div className="absolute left-0 top-1 w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center text-xs font-bold ring-4 ring-white">
                  ✓
                </div>

                <div className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {getActionLabel(log.action, language)}
                      </h3>

                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(log.createdAt).toLocaleString(
                          language === "fr" ? "fr-FR" : "en-US"
                        )}
                      </p>
                    </div>

                    {log.toPercentage !== null && (
                      <span className="inline-flex w-fit px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-bold">
                        {log.toPercentage}%
                      </span>
                    )}
                  </div>

                  {log.fromPercentage !== null &&
                    log.toPercentage !== null && (
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase">
                          {t.transition}
                        </p>

                        <div className="mt-2 flex items-center gap-3">
                          <span className="font-bold text-gray-700">
                            {log.fromPercentage}%
                          </span>

                          <div className="h-1 flex-1 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-700 rounded-full"
                              style={{
                                width: `${Math.max(
                                  0,
                                  Math.min(100, log.toPercentage)
                                )}%`,
                              }}
                            />
                          </div>

                          <span className="font-bold text-blue-800">
                            {log.toPercentage}%
                          </span>
                        </div>
                      </div>
                    )}

                  <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
                    {log.officer && (
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="font-semibold text-gray-700">
                          {t.officer}
                        </p>
                        <p className="mt-1">
                          {log.officer.fullName}
                        </p>
                        <p className="text-gray-500">
                          {log.officer.email}
                        </p>
                      </div>
                    )}

                    {log.notes && (
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="font-semibold text-gray-700">
                          {t.notes}
                        </p>
                        <p className="mt-1 text-gray-600">
                          {log.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {(log.fromStep || log.toStep) && (
                    <div className="mt-4 text-xs text-gray-500">
                      {log.fromStep
                        ?.replaceAll("_", " ")
                        .concat(" → ")}
                      {log.toStep?.replaceAll("_", " ")}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}