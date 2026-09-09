"use client";

import { useState } from "react";

type Props = {
  applications: any[];
};

export default function ApplicationSearch({ applications }: Props) {
  const [search, setSearch] = useState("");

  const filtered = applications.filter((application) =>
    application.applicationId
      .toLowerCase()
      .includes(search.toLowerCase()) ||
    application.fullName
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <>
      <input
        type="text"
        placeholder="Search by ID or applicant name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border rounded-lg p-3 mb-6"
      />

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-blue-900 text-white">
            <th className="p-3">Application ID</th>
            <th className="p-3">Name</th>
            <th className="p-3">Nationality</th>
            <th className="p-3">Purpose</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((application) => (
            <tr key={application.id} className="border-b">
              <td className="p-3">{application.applicationId}</td>
              <td className="p-3">{application.fullName}</td>
              <td className="p-3">{application.nationality}</td>
              <td className="p-3">{application.purpose}</td>
              <td className="p-3">{application.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}