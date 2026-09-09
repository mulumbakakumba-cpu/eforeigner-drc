"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

type Application = {
  id: string;
  applicationId: string;
  fullName: string;
  nationality: string;
  purpose: string;
  status: string;
  createdAt: string;
};

function getStatusBadge(status: string) {
  switch (status) {
    case "Approved":
      return (
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
          🟢 Approved
        </span>
      );

    case "Rejected":
      return (
        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
          🔴 Rejected
        </span>
      );

    case "Submitted":
      return (
        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
          🟡 Submitted
        </span>
      );

    default:
      return (
        <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-semibold">
          {status}
        </span>
      );
  }
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    fetch("/api/applications")
      .then((res) => res.json())
      .then((data) => setApplications(data));
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-xl p-8">

        <h1 className="text-4xl font-bold text-blue-900">
          My Applications
        </h1>

        <p className="text-gray-500 mt-2">
          View and manage visa applications.
        </p>

        <table className="w-full mt-10 border-collapse">
          <thead>
            <tr className="bg-blue-900 text-white">
              <th className="p-3 text-left">Application ID</th>
              <th className="p-3 text-left">Applicant</th>
              <th className="p-3 text-left">Nationality</th>
              <th className="p-3 text-left">Purpose</th>
              <th className="p-3 text-left">Submitted</th>
              <th className="p-3 text-left">Status</th>
              
            </tr>
          </thead>

          <tbody>
            {applications.map((application) => (
              <tr
                key={application.id}
                className="border-b hover:bg-slate-50"
              >
                <td className="p-3">
  <Link
    href={`/applications/${application.id}`}
    className="text-blue-700 hover:underline font-semibold"
  >
    {application.applicationId}
  </Link>
</td>
                <td className="p-3">{application.fullName}</td>

                <td className="p-3">{application.nationality}</td>

                <td className="p-3">{application.purpose}</td>

                <td className="p-3">
                  {new Date(application.createdAt).toLocaleDateString()}
                </td>

                <td className="p-3">
                  {getStatusBadge(application.status)}
                </td>

                
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </main>
  );
}