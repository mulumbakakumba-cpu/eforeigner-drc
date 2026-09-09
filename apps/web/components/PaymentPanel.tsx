"use client";

import { useState } from "react";

type Payment = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  reference: string | null;
  paidAt: Date | string | null;
};

type PaymentPanelProps = {
  applicationId: string;
  percentage: number;
  payments: Payment[];
};

export default function PaymentPanel({
  applicationId,
  percentage,
  payments,
}: PaymentPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  if (percentage < 60) {
    return null;
  }

  const payment = payments[0];

  if (!payment) {
    return (
      <div className="mt-8 rounded-xl border border-yellow-200 bg-yellow-50 p-6">
        <h3 className="text-xl font-bold text-yellow-800">
          Payment
        </h3>

        <p className="mt-2 text-yellow-700">
          No payment has been created for this application yet.
        </p>
      </div>
    );
  }

  async function handlePayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!cardholderName || !cardNumber || !expiry || !cvv) {
      setError("Please complete all payment fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/applications/${applicationId}/payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Payment could not be completed.");
        return;
      }

      setSuccess(true);
      setShowForm(false);
    } catch {
      setError("Unable to connect to the payment service.");
    } finally {
      setLoading(false);
    }
  }

  if (success || payment.status === "PAID") {
    return (
      <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-6">
        <div className="text-center">
          <div className="text-5xl">✅</div>

          <h3 className="mt-3 text-2xl font-bold text-green-800">
            Payment Successful
          </h3>

          <p className="mt-2 text-green-700">
            Your residence permit payment has been submitted successfully.
          </p>

          <div className="mt-6 rounded-lg bg-white p-5 text-left shadow-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Amount</span>
              <strong>
                {payment.amount} {payment.currency}
              </strong>
            </div>

            <div className="mt-3 flex justify-between">
              <span className="text-gray-600">Status</span>
              <strong className="text-green-600">
                PAID
              </strong>
            </div>

            {payment.reference && (
              <div className="mt-3 flex justify-between">
                <span className="text-gray-600">
                  Reference
                </span>

                <span className="font-mono text-sm">
                  {payment.reference}
                </span>
              </div>
            )}
          </div>

          <p className="mt-5 text-sm text-gray-600">
            Your payment is now waiting for verification by an immigration
            officer.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-6">
        <h3 className="text-2xl font-bold text-blue-900">
          💳 Residence Permit Payment
        </h3>

        <p className="mt-2 text-gray-700">
          Your application has reached the payment stage.
        </p>

        <div className="mt-6 rounded-lg bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-600">
              Residence Permit Fee
            </span>

            <span className="text-2xl font-bold text-blue-900">
              {payment.amount} {payment.currency}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="font-medium text-gray-600">
              Payment Status
            </span>

            <span className="font-bold text-orange-600">
              PENDING
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="mt-6 w-full rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
          >
            Pay {payment.amount} {payment.currency}
          </button>

          <p className="mt-3 text-center text-xs text-gray-500">
            🔒 Secure payment
          </p>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-8 shadow-2xl">

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-blue-900">
                  💳 Secure Payment
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Residence Permit Application
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-2xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="mt-6 rounded-lg bg-blue-50 p-4">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Amount to pay
                </span>

                <strong className="text-xl text-blue-900">
                  {payment.amount} {payment.currency}
                </strong>
              </div>
            </div>

            <form
              onSubmit={handlePayment}
              className="mt-6 space-y-5"
            >

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Cardholder Name
                </label>

                <input
                  type="text"
                  value={cardholderName}
                  onChange={(e) =>
                    setCardholderName(e.target.value)
                  }
                  placeholder="John Doe"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Card Number
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) =>
                    setCardNumber(e.target.value)
                  }
                  placeholder="4242 4242 4242 4242"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 font-mono outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Expiry Date
                  </label>

                  <input
                    type="text"
                    maxLength={5}
                    value={expiry}
                    onChange={(e) =>
                      setExpiry(e.target.value)
                    }
                    placeholder="MM/YY"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    CVV
                  </label>

                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={cvv}
                    onChange={(e) =>
                      setCvv(e.target.value)
                    }
                    placeholder="•••"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

              </div>

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Processing Payment..."
                  : `Confirm Payment — ${payment.amount} ${payment.currency}`}
              </button>

              <p className="text-center text-xs text-gray-500">
                🔒 Demo payment environment. Do not enter real
                card information.
              </p>

            </form>
          </div>
        </div>
      )}
    </>
  );
}