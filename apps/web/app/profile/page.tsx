import { redirect } from "next/navigation";
import { UserCircle, ShieldCheck, Mail } from "lucide-react";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
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

  const initials = user.fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((name) => name.charAt(0).toUpperCase())
    .join("");

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-4xl px-6">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
            🇨🇩 eForeigner DRC
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Mon profil
          </h1>

          <p className="mt-2 text-slate-600">
            Consultez les informations de votre compte.
          </p>
        </div>

        {/* Profile card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-blue-900 via-blue-700 to-red-700" />

          {/* User identity */}
          <div className="px-6 pb-8 sm:px-8">
            <div className="-mt-14 flex flex-col gap-5 sm:flex-row sm:items-end">
              {/* Avatar */}
              <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-4 border-white bg-blue-100 text-3xl font-bold text-blue-800 shadow-lg">
                {initials || <UserCircle size={52} />}
              </div>

              <div className="pb-1">
                <h2 className="text-2xl font-bold text-slate-900">
                  {user.fullName}
                </h2>

                <p className="mt-1 flex items-center gap-2 text-slate-500">
                  <Mail size={16} />
                  {user.email}
                </p>
              </div>
            </div>

            {/* Account information */}
            <div className="mt-10">
              <h3 className="text-xl font-bold text-slate-900">
                Informations du compte
              </h3>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">
                    Nom complet
                  </p>

                  <p className="mt-2 font-semibold text-slate-900">
                    {user.fullName}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">
                    Adresse e-mail
                  </p>

                  <p className="mt-2 font-semibold text-slate-900">
                    {user.email}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">
                    Type de compte
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <ShieldCheck
                      size={18}
                      className="text-blue-700"
                    />

                    <p className="font-semibold capitalize text-slate-900">
                      {user.role}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">
                    Identifiant du compte
                  </p>

                  <p className="mt-2 break-all font-mono text-sm text-slate-900">
                    {user.id}
                  </p>
                </div>
              </div>
            </div>

            {/* Notice */}
            <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50 p-5">
              <p className="font-semibold text-blue-900">
                Votre espace personnel
              </p>

              <p className="mt-1 text-sm leading-6 text-blue-800">
                Les informations affichées ici correspondent au compte
                actuellement connecté. Chaque utilisateur voit uniquement
                ses propres informations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}