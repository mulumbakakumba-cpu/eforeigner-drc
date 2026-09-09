"use client";

import { useState } from "react";

type Journey = {
  percentage: number;
  currentStep: string;
  status: string;
};

type Props = {
  id: string;
  journey?: Journey | null;
};

export default function ApplicationActions({
  id,
  journey,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function advance(action: string) {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `/api/officer/applications/${id}/journey`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update journey."
        );
      }

      setMessage("Journey updated successfully.");

      window.location.reload();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!journey) {
    return (
      <p className="text-sm text-gray-500">
        No residence journey found.
      </p>
    );
  }

  if (journey.status === "COMPLETED") {
    return (
      <div className="rounded-lg bg-green-100 border border-green-300 p-4">
        <p className="font-semibold text-green-800">
          ✓ Application completed
        </p>

        <p className="text-sm text-green-700 mt-1">
          Immigration journey reached 100%.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {/* Current progress */}

      <div className="bg-slate-100 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          Current progress
        </p>

        <p className="text-3xl font-bold text-blue-900">
          {journey.percentage}%
        </p>

        <p className="text-sm text-gray-600 mt-1">
          {journey.currentStep}
        </p>
      </div>

      {/* 20% → 40% */}

      {journey.percentage === 20 && (
        <button
          disabled={loading}
          onClick={() =>
            advance("VALIDATE_DOCUMENTS")
          }
          className="w-full bg-blue-700 hover:bg-blue-800 disabled:bg-gray-400 text-white font-semibold px-4 py-3 rounded-lg transition"
        >
          {loading
            ? "Processing..."
            : "✓ Validate Documents → 40%"}
        </button>
      )}

      {/* 40% → 60% */}

      {journey.percentage === 40 && (
        <button
          disabled={loading}
          onClick={() =>
            advance("VERIFY_MEDICAL")
          }
          className="w-full bg-purple-700 hover:bg-purple-800 disabled:bg-gray-400 text-white font-semibold px-4 py-3 rounded-lg transition"
        >
          {loading
            ? "Processing..."
            : "✓ Verify Medical → 60%"}
        </button>
      )}

      {/* 60% → 80% */}

      {journey.percentage === 60 && (
        <button
          disabled={loading}
          onClick={() =>
            advance("VERIFY_PAYMENT")
          }
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold px-4 py-3 rounded-lg transition"
        >
          {loading
            ? "Processing..."
            : "✓ Verify Payment → 80%"}
        </button>
      )}

      {/* 80% → 100% */}

      {journey.percentage === 80 && (
        <button
          disabled={loading}
          onClick={() =>
            advance("APPROVE_IMMIGRATION")
          }
          className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white font-semibold px-4 py-3 rounded-lg transition"
        >
          {loading
            ? "Processing..."
            : "✓ Approve Immigration → 100%"}
        </button>
      )}

      {/* Error / feedback */}

      {message && (
        <p className="text-sm text-red-600">
          {message}
        </p>
      )}
    </div>
  );
}