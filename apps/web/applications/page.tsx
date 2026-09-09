import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ApplicationsPage() {
  const session = await auth();

  if (!session?.user?.email) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-slate-900 mb-3">
            Accès requis
          </h1>

          <p className="text-slate-600 mb-6">
            Vous devez être connecté pour consulter vos demandes.
          </p>

          <Link
            href="/login"
            className="inline-block rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
          >
            Se connecter
          </Link>
        </div>
      </main>
    );
  }

  const applications = await prisma.application.findMany({
    where: {
      email: session.user.email,
    },
    include: {
      residenceJourney: {
        include: {
          steps: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const getProgress = (application: (typeof applications)[number]) => {
    if (application.residenceJourney) {
      return application.residenceJourney.percentage;
    }

    switch (application.status) {
      case "Approved":
        return 100;
      case "Rejected":
        return 100;
      default:
        return 20;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Approved":
        return "Approuvée";
      case "Rejected":
        return "Rejetée";
      case "Submitted":
        return "Soumise";
      default:
        return status;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-blue-700 hover:underline"
            >
              ← Retour au tableau de bord
            </Link>

            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Mes demandes
            </h1>

            <p className="mt-1 text-slate-600">
              Consultez et suivez l’évolution de vos demandes
              d’immigration.
            </p>
          </div>

          <Link
            href="/visa"
            className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white shadow-sm hover:bg-blue-800"
          >
            + Nouvelle demande
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        {applications.length === 0 ? (
          <div className="rounded-2xl border bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">
              📄
            </div>

            <h2 className="text-2xl font-bold text-slate-900">
              Aucune demande
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-slate-600">
              Vous n’avez encore soumis aucune demande. Commencez votre
              démarche dès maintenant.
            </p>

            <Link
              href="/visa"
              className="mt-6 inline-block rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
            >
              Faire une demande
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((application) => {
              const progress = getProgress(application);

              return (
                <article
                  key={application.id}
                  className="overflow-hidden rounded-2xl border bg-white shadow-sm"
                >
                  <div className="p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-xl font-bold text-slate-900">
                            {application.applicationId}
                          </h2>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                              application.status
                            )}`}
                          >
                            {getStatusLabel(application.status)}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-500">
                          Type de demande :{" "}
                          <span className="font-medium text-slate-700">
                            {application.applicationType}
                          </span>
                        </p>
                      </div>

                      <Link
                        href={`/applications/${application.id}`}
                        className="rounded-xl border border-blue-700 px-5 py-2.5 text-center font-semibold text-blue-700 hover:bg-blue-50"
                      >
                        Voir la demande
                      </Link>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Nom complet
                        </p>
                        <p className="mt-1 font-semibold text-slate-900">
                          {application.fullName}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Nationalité
                        </p>
                        <p className="mt-1 font-semibold text-slate-900">
                          {application.nationality}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Passeport
                        </p>
                        <p className="mt-1 font-semibold text-slate-900">
                          {application.passportNumber}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Date de demande
                        </p>
                        <p className="mt-1 font-semibold text-slate-900">
                          {new Intl.DateTimeFormat("fr-FR", {
                            dateStyle: "medium",
                          }).format(new Date(application.createdAt))}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="mb-2 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900">
                            Progression de la procédure
                          </p>

                          {application.residenceJourney && (
                            <p className="text-sm text-slate-500">
                              Étape actuelle :{" "}
                              {application.residenceJourney.currentStep}
                            </p>
                          )}
                        </div>

                        <span className="text-lg font-bold text-blue-700">
                          {progress}%
                        </span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-blue-700 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="mt-3 flex justify-between text-xs text-slate-500">
                        <span>20%</span>
                        <span>40%</span>
                        <span>60%</span>
                        <span>80%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t bg-slate-50 px-6 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                      <div className="text-slate-600">
                        Motif :{" "}
                        <span className="font-medium text-slate-800">
                          {application.purpose}
                        </span>
                      </div>

                      <Link
                        href={`/applications/${application.id}`}
                        className="font-semibold text-blue-700 hover:underline"
                      >
                        Consulter le suivi →
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}