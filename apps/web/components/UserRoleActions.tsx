"use client";

import { useRouter } from "next/navigation";

export default function UserRoleActions({
  id,
}: {
  id: string;
}) {
  const router = useRouter();

  async function updateRole(role: string) {
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role,
      }),
    });

    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => updateRole("citizen")}
        className="bg-blue-600 text-white px-3 py-1 rounded"
      >
        Citizen
      </button>

      <button
        onClick={() => updateRole("officer")}
        className="bg-green-700 text-white px-3 py-1 rounded"
      >
        Officer
      </button>

      <button
        onClick={() => updateRole("admin")}
        className="bg-purple-700 text-white px-3 py-1 rounded"
      >
        Admin
      </button>
    </div>
  );
}