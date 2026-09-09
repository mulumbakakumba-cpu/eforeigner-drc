import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  ClipboardList,
  FileSearch,
  UserCircle,
} from "lucide-react";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardClientHeader from "@/components/DashboardClientHeader";
import ResidenceJourneyTimeline from "@/components/ResidenceJourneyTimeline";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const applications = await prisma.application.findMany({
    where: {
      email: user.email,
    },
    include: {
      residenceJourney: {
        include: {
          steps: true,
          medical: true,
          payments: true,
          immigration: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalApplications = applications.length;

  const approvedApplications = applications.filter(
    (application) => application.status === "Approved"
  ).length;

  const rejectedApplications = applications.filter(
    (application) => application.status === "Rejected"
  ).length;

  const pendingApplications = applications.filter(
    (application) =>
      application.status !== "Approved" &&
      application.status !== "Rejected"
  ).length;

  const latestApplication = applications[0];

  const serializedJourney = latestApplication?.residenceJourney
    ? {
        ...latestApplication.residenceJourney,
        startedAt:
          latestApplication.residenceJourney.startedAt.toISOString(),
        completedAt:
          latestApplication.residenceJourney.completedAt?.toISOString() ??
          null,
        steps: latestApplication.residenceJourney.steps.map((step) => ({
          ...step,
          startedAt: step.startedAt?.toISOString() ?? null,
          completedAt: step.completedAt?.toISOString() ?? null,
        })),
        medical: latestApplication.residenceJourney.medical
          ? {
              ...latestApplication.residenceJourney.medical,
              verifiedAt:
                latestApplication.residenceJourney.medical.verifiedAt?.toISOString() ??
                null,
            }
          : null,
        payments:
          latestApplication.residenceJourney.payments.map((payment) => ({
            ...payment,
            createdAt: payment.createdAt.toISOString(),
            paidAt: payment.paidAt?.toISOString() ?? null,
            verifiedAt: payment.verifiedAt?.toISOString() ?? null,
          })),
        immigration:
          latestApplication.residenceJourney.immigration
            ? {
                ...latestApplication.residenceJourney.immigration,
                reviewedAt:
                  latestApplication.residenceJourney.immigration.reviewedAt?.toISOString() ??
                  null,
              }
            : null,
      }
    : null;

  return (
    <main className="min-h-screen bg-slate-50">
      <DashboardClientHeader
        fullName={user.fullName}
      />

      <section className="mx-auto max-w-7xl px-6 py-10">
        {/* Welcome */}
        <div className="mb-8">
          <p className="text-sm font-medium text-blue-700">
            🇨🇩 eForeigner DRC
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Tableau de bord
          </h1>

          <p className="mt-2 text-slate-600">
            Bienvenue, {user.fullName}. Consultez vos demandes et
            suivez leur progression.
          </p>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total des demandes
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {totalApplications}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              En cours
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-700">
              {pendingApplications}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Approuvées
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {approvedApplications}
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Rejetées
            </p>

            <p className="mt-2 text-3xl font-bold text-red-600">
              {rejectedApplications}
            </p>
          </div>
        </div>

        {/* Latest application */}
        {latestApplication ? (
          <section className="mb-10">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Ma demande récente
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Dossier n° {latestApplication.applicationId}
                </p>
              </div>

              <Link
                href="/applications"
                className="hidden items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800 sm:flex"
              >
                Voir mes demandes
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="mb-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-sm text-slate-500">
                    Type de demande
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {latestApplication.applicationType}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Nationalité
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {latestApplication.nationality}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Passeport
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {latestApplication.passportNumber}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Statut
                  </p>

                  <span
                    className={`mt-1 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                      latestApplication.status === "Approved"
                        ? "bg-green-100 text-green-700"
                        : latestApplication.status === "Rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {latestApplication.status === "Approved"
                      ? "Approuvée"
                      : latestApplication.status === "Rejected"
                        ? "Rejetée"
                        : "En cours"}
                  </span>
                </div>
              </div>

              {serializedJourney ? (
                <ResidenceJourneyTimeline
                  journey={serializedJourney}
                />
              ) : (
                <div className="rounded-xl bg-slate-50 p-5">
                  <p className="font-semibold text-slate-900">
                    Votre demande a bien été enregistrée.
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    Le suivi détaillé de votre procédure sera
                    disponible prochainement.
                  </p>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={`/applications/${latestApplication.id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
                >
                  Voir ma demande
                  <ArrowRight size={17} />
                </Link>

                <Link
                  href={`/track?applicationId=${encodeURIComponent(
                    latestApplication.applicationId
                  )}`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <FileSearch size={17} />
                  Suivre ma demande
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <section className="mb-10 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
              <ClipboardList
                size={30}
                className="text-blue-700"
              />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Aucune demande
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-slate-600">
              Vous n’avez pas encore soumis de demande.
            </p>

            <Link
              href="/visa"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
            >
              Faire une demande
              <ArrowRight size={17} />
            </Link>
          </section>
        )}

        {/* QUICK OPTIONS ONLY */}
        <section>
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-slate-900">
              Options rapides
            </h2>

            <p className="mt-1 text-slate-600">
              Accédez rapidement aux principales fonctionnalités de votre espace.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/visa"
              className="group rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                📄
              </div>

              <h3 className="font-bold text-slate-900">
                Faire une demande
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                Commencez une nouvelle procédure administrative.
              </p>

              <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-blue-700">
                Commencer
                <ArrowRight
                  size={16}
                  className="transition group-hover:translate-x-1"
                />
              </div>
            </Link>

            <Link
              href="/applications"
              className="group rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                📋
              </div>

              <h3 className="font-bold text-slate-900">
                Mes demandes
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                Consultez toutes vos demandes et leur progression.
              </p>

              <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-blue-700">
                Voir mes demandes
                <ArrowRight
                  size={16}
                  className="transition group-hover:translate-x-1"
                />
              </div>
            </Link>

            <Link
              href="/profile"
              className="group rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-2xl">
                <UserCircle size={28} />
              </div>

              <h3 className="font-bold text-slate-900">
                Mon profil
              </h3>

              <p className="mt-2 text-sm text-slate-600">
                Consultez et gérez vos informations personnelles.
              </p>

              <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-blue-700">
                Voir mon profil
                <ArrowRight
                  size={16}
                  className="transition group-hover:translate-x-1"
                />
              </div>
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}