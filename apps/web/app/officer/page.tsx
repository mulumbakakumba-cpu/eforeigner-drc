import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { auth } from "../../lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import OfficerApplicationsTable from "../../components/OfficerApplicationsTable";

export default async function OfficerPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  if (!user || user.role !== "officer") {
    redirect("/dashboard");
  }

  const applications = await prisma.application.findMany({
  orderBy: { createdAt: "desc" },
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
});
  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl rounded-xl bg-white p-8 shadow-xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">

          <div>
            <Link
              href="/"
              className="group inline-flex items-center gap-3 rounded-xl transition duration-200 hover:-translate-y-0.5"
              title="Accueil"
            >
              <span className="text-3xl transition duration-200 group-hover:scale-110">
                🇨🇩
              </span>

              <div>
                <h1 className="text-3xl font-bold text-blue-900 transition-colors group-hover:text-blue-700">
                  eForeigner DRC
                </h1>

                <p className="mt-1 text-sm font-medium text-slate-500">
                  Immigration Officer Dashboard
                </p>
              </div>
            </Link>
          </div>

          <Link
            href="/"
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Accueil
          </Link>

        </div>

        {/* Applications */}
        <div className="mt-8">
          <OfficerApplicationsTable
            applications={applications}
          />
        </div>

      </div>
    </main>
  );
}