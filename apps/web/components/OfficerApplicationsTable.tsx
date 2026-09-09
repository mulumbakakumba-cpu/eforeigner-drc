"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ApplicationActions from "./ApplicationActions";

type JourneyStep = {
  id: string;
  step: string;
  percentage: number;
  status: string;
  startedAt: Date | null;
  completedAt: Date | null;
  verifiedBy: string | null;
  notes: string | null;
};

type Payment = {
  id: string;
  journeyId: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  reference: string | null;
  paidAt: Date | null;
  verifiedAt: Date | null;
  verifiedBy: string | null;
  createdAt: Date;
};

type Journey = {
  id: string;
  applicationId: string;
  percentage: number;
  currentStep: string;
  status: string;
  startedAt: Date;
  completedAt: Date | null;
  steps: JourneyStep[];
  medical: unknown;
  payments: Payment[];
  immigration: unknown;
} | null;

type Application = {
  id: string;
  applicationId: string;
  fullName: string;
  nationality: string;
  purpose: string;
  status: string;
  residenceJourney: Journey;
};

type Props = {
  applications: Application[];
};

type Language = "fr" | "en";

const text = {
  fr: {
    title: "Demandes d'immigration",
    subtitle: "Gérez et suivez les demandes des étrangers",
    total: "Total",
    inProgress: "En cours",
    completed: "Terminées",
    paid: "Paiements reçus",
    search: "Rechercher par numéro de demande, nom ou nationalité...",
    all: "Toutes",
    pending: "En attente",
    completedFilter: "Terminées",
    applicationId: "Numéro",
    name: "Nom complet",
    nationality: "Nationalité",
    purpose: "Motif",
    status: "Statut",
    journey: "Parcours",
    payment: "Paiement",
    actions: "Actions",
    noJourney: "Aucun parcours",
    noApplications: "Aucune demande trouvée.",
    paidStatus: "PAYÉ",
    verified: "VÉRIFIÉ",
    pendingStatus: "EN ATTENTE",
  },
  en: {
    title: "Immigration Applications",
    subtitle: "Manage and track foreign nationals' applications",
    total: "Total",
    inProgress: "In progress",
    completed: "Completed",
    paid: "Payments received",
    search: "Search by application number, name or nationality...",
    all: "All",
    pending: "Pending",
    completedFilter: "Completed",
    applicationId: "Number",
    name: "Full name",
    nationality: "Nationality",
    purpose: "Purpose",
    status: "Status",
    journey: "Journey",
    payment: "Payment",
    actions: "Actions",
    noJourney: "No journey",
    noApplications: "No applications found.",
    paidStatus: "PAID",
    verified: "VERIFIED",
    pendingStatus: "PENDING",
  },
};

function getLanguage(): Language {
  if (typeof window === "undefined") return "fr";

  return window.localStorage.getItem("eforeigner-language") === "en"
    ? "en"
    : "fr";
}

function statusLabel(status: string, language: Language) {
  if (language === "fr") {
    if (status === "Submitted") return "Soumise";
    if (status === "Approved") return "Approuvée";
    if (status === "Rejected") return "Rejetée";
  }

  return status;
}

export default function OfficerApplicationsTable({
  applications,
}: Props) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
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

  const t = text[language];

  const statistics = useMemo(() => {
    const total = applications.length;

    const completed = applications.filter(
      (application) =>
        application.residenceJourney?.percentage === 100
    ).length;

    const inProgress = applications.filter(
      (application) =>
        application.residenceJourney &&
        application.residenceJourney.percentage < 100
    ).length;

    const paid = applications.filter((application) =>
      application.residenceJourney?.payments.some(
        (payment) =>
          payment.status === "PAID" ||
          payment.status === "VERIFIED"
      )
    ).length;

    return {
      total,
      completed,
      inProgress,
      paid,
    };
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const value = search.trim().toLowerCase();

    return applications.filter((application) => {
      const matchesSearch =
        !value ||
        application.applicationId.toLowerCase().includes(value) ||
        application.fullName.toLowerCase().includes(value) ||
        application.nationality.toLowerCase().includes(value);

      const percentage =
        application.residenceJourney?.percentage ?? 0;

      const matchesFilter =
        filter === "ALL" ||
        (filter === "PENDING" && percentage < 100) ||
        (filter === "COMPLETED" && percentage === 100);

      return matchesSearch && matchesFilter;
    });
  }, [applications, search, filter]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-blue-900">
          {t.title}
        </h2>

        <p className="text-gray-500 mt-1">
          {t.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="bg-blue-900 text-white rounded-xl p-6 shadow">
          <p className="text-blue-100 text-sm">{t.total}</p>
          <p className="text-4xl font-bold mt-2">
            {statistics.total}
          </p>
        </div>

        <div className="bg-amber-500 text-white rounded-xl p-6 shadow">
          <p className="text-amber-100 text-sm">
            {t.inProgress}
          </p>
          <p className="text-4xl font-bold mt-2">
            {statistics.inProgress}
          </p>
        </div>

        <div className="bg-green-600 text-white rounded-xl p-6 shadow">
          <p className="text-green-100 text-sm">
            {t.completed}
          </p>
          <p className="text-4xl font-bold mt-2">
            {statistics.completed}
          </p>
        </div>

        <div className="bg-purple-700 text-white rounded-xl p-6 shadow">
          <p className="text-purple-100 text-sm">
            {t.paid}
          </p>
          <p className="text-4xl font-bold mt-2">
            {statistics.paid}
          </p>
        </div>
      </div>

      <div className="bg-slate-50 border rounded-xl p-5">
        <div className="flex flex-col lg:flex-row gap-4">
          <input
            type="text"
            placeholder={t.search}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
          >
            <option value="ALL">{t.all}</option>
            <option value="PENDING">{t.pending}</option>
            <option value="COMPLETED">
              {t.completedFilter}
            </option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-xl">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="bg-blue-900 text-white text-left">
              <th className="p-4">{t.applicationId}</th>
              <th className="p-4">{t.name}</th>
              <th className="p-4">{t.nationality}</th>
              <th className="p-4">{t.purpose}</th>
              <th className="p-4">{t.status}</th>
              <th className="p-4">{t.journey}</th>
              <th className="p-4">{t.payment}</th>
              <th className="p-4">{t.actions}</th>
            </tr>
          </thead>

          <tbody>
            {filteredApplications.map((application) => {
              const journey = application.residenceJourney;

              const payment = journey?.payments?.[0];

              return (
                <tr
                  key={application.id}
                  className="border-b hover:bg-slate-50"
                >
                  <td className="p-4">
                    <Link
                      href={`/officer/${application.id}`}
                      className="text-blue-700 font-bold hover:underline"
                    >
                      {application.applicationId}
                    </Link>
                  </td>

                  <td className="p-4 font-medium">
                    {application.fullName}
                  </td>

                  <td className="p-4">
                    {application.nationality}
                  </td>

                  <td className="p-4">
                    {application.purpose}
                  </td>

                  <td className="p-4">
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                      {statusLabel(
                        application.status,
                        language
                      )}
                    </span>
                  </td>

                  <td className="p-4">
                    {journey ? (
                      <div className="min-w-[170px]">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium">
                            {journey.currentStep.replaceAll(
                              "_",
                              " "
                            )}
                          </span>

                          <span className="font-bold">
                            {journey.percentage}%
                          </span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-blue-700 h-2.5 rounded-full transition-all"
                            style={{
                              width: `${journey.percentage}%`,
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500">
                        {t.noJourney}
                      </span>
                    )}
                  </td>

                  <td className="p-4">
                    {payment ? (
                      <div className="space-y-1">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                            payment.status === "VERIFIED"
                              ? "bg-green-100 text-green-800"
                              : payment.status === "PAID"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {payment.status === "VERIFIED"
                            ? t.verified
                            : payment.status === "PAID"
                            ? t.paidStatus
                            : t.pendingStatus}
                        </span>

                        {payment.reference && (
                          <p className="text-xs text-gray-500">
                            {payment.reference}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>

                  <td className="p-4 min-w-[220px]">
                    <ApplicationActions
                      id={application.id}
                      journey={journey}
                    />
                  </td>
                </tr>
              );
            })}

            {filteredApplications.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="p-12 text-center text-gray-500"
                >
                  {t.noApplications}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}