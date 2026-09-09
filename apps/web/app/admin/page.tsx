import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { redirect } from "next/navigation";
import UserRoleActions from "../../components/UserRoleActions";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: session.user.email,
    },
  });

  if (!user || user.role !== "admin") {
    redirect("/dashboard");
  }

  const totalUsers = await prisma.user.count();

  const totalApplications = await prisma.application.count();

  const approved = await prisma.application.count({
    where: {
      status: "Approved",
    },
  });

  const pending = await prisma.application.count({
    where: {
      status: "Submitted",
    },
  });

  const rejected = await prisma.application.count({
    where: {
      status: "Rejected",
    },
  });

  const users = await prisma.user.findMany({
    orderBy: {
      fullName: "asc",
    },
  });

  type UserRecord = (typeof users)[number];

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl rounded-xl bg-white p-8 shadow-xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">

          <div>
            <Link
              href="/"
              title="Accueil"
              className="group inline-flex items-center gap-3 rounded-xl transition duration-200 hover:-translate-y-0.5"
            >
              <span className="text-3xl transition duration-200 group-hover:scale-110">
                🇨🇩
              </span>

              <div>
                <h1 className="text-3xl font-bold text-blue-900 transition-colors group-hover:text-blue-700">
                  eForeigner DRC
                </h1>

                <p className="mt-1 text-sm font-medium text-slate-500">
                  👑 Administrator Dashboard
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

        <p className="text-gray-600">
          Manage the entire eForeigner DRC platform.
        </p>

        {/* Statistics */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">

          <div className="rounded-xl bg-blue-900 p-6 text-white">
            <h2 className="text-lg">
              Users
            </h2>

            <p className="mt-2 text-4xl font-bold">
              {totalUsers}
            </p>
          </div>

          <div className="rounded-xl bg-indigo-700 p-6 text-white">
            <h2 className="text-lg">
              Applications
            </h2>

            <p className="mt-2 text-4xl font-bold">
              {totalApplications}
            </p>
          </div>

          <div className="rounded-xl bg-green-700 p-6 text-white">
            <h2 className="text-lg">
              Approved
            </h2>

            <p className="mt-2 text-4xl font-bold">
              {approved}
            </p>
          </div>

          <div className="rounded-xl bg-yellow-500 p-6 text-white">
            <h2 className="text-lg">
              Pending
            </h2>

            <p className="mt-2 text-4xl font-bold">
              {pending}
            </p>
          </div>

          <div className="rounded-xl bg-red-600 p-6 text-white">
            <h2 className="text-lg">
              Rejected
            </h2>

            <p className="mt-2 text-4xl font-bold">
              {rejected}
            </p>
          </div>

        </div>

        {/* User Management */}
        <div className="mt-12">

          <h2 className="mb-6 text-2xl font-bold text-blue-900">
            User Management
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">

              <thead>
                <tr className="bg-blue-900 text-white">
                  <th className="p-3 text-left">
                    Name
                  </th>

                  <th className="p-3 text-left">
                    Email
                  </th>

                  <th className="p-3 text-left">
                    Role
                  </th>

                  <th className="p-3 text-left">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {users.map((user: UserRecord) => (
                  <tr
                    key={user.id}
                    className="border-b hover:bg-slate-50"
                  >
                    <td className="p-3">
                      {user.fullName}
                    </td>

                    <td className="p-3">
                      {user.email}
                    </td>

                    <td className="p-3 capitalize">
                      {user.role}
                    </td>

                    <td className="p-3">
                      <UserRoleActions id={user.id} />
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>

        </div>

      </div>
    </main>
  );
}