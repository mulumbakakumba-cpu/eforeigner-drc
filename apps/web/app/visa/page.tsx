"use client";

import { useEffect, useState } from "react";
import { translations } from "../../lib/i18n/translations";

type Language = "fr" | "en";

function getLanguage(): Language {
  if (typeof window === "undefined") return "fr";

  return window.localStorage.getItem("eforeigner-language") === "en"
    ? "en"
    : "fr";
}

export default function VisaPage() {
  const [language, setLanguage] = useState<Language>(getLanguage());

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    nationality: "",
    passportNumber: "",
    birthDate: "",
    arrivalDate: "",
    purpose: "",
  });

  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [supportFile, setSupportFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const updateLanguage = () => {
      setLanguage(getLanguage());
    };

    window.addEventListener(
      "eforeigner-language-change",
      updateLanguage
    );

    return () => {
      window.removeEventListener(
        "eforeigner-language-change",
        updateLanguage
      );
    };
  }, []);

  const t = translations[language];

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (submitting) return;

    setSubmitting(true);

    try {
      const idempotencyKey = crypto.randomUUID();
      const formData = new FormData();

      formData.append("fullName", form.fullName);
      formData.append("email", form.email);
      formData.append("nationality", form.nationality);
      formData.append("passportNumber", form.passportNumber);
      formData.append("birthDate", form.birthDate);
      formData.append("arrivalDate", form.arrivalDate);
      formData.append("purpose", form.purpose);

      if (passportFile) {
        formData.append("passportFile", passportFile);
      }

      if (photoFile) {
        formData.append("photoFile", photoFile);
      }

      if (supportFile) {
        formData.append("supportFile", supportFile);
      }

      const response = await fetch("/api/visa", {
        method: "POST",
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            (language === "fr"
              ? "Échec de l'envoi de la demande."
              : "Failed to submit application.")
        );
      }

      alert(
        `✅ ${data.message}\n\n${
          language === "fr"
            ? "Numéro de demande"
            : "Application ID"
        }:\n${data.application.applicationId}`
      );
    } catch (error) {
      alert(
        `❌ ${
          error instanceof Error
            ? error.message
            : language === "fr"
            ? "Échec de l'envoi de la demande."
            : "Failed to submit application."
        }`
      );
    } finally {
      setSubmitting(false);
    }
  }

  const purposeOptions =
    language === "fr"
      ? [
          ["Tourism", "Tourisme"],
          ["Business", "Affaires"],
          ["Employment", "Emploi"],
          ["Study", "Études"],
          ["Diplomatic", "Diplomatique"],
        ]
      : [
          ["Tourism", "Tourism"],
          ["Business", "Business"],
          ["Employment", "Employment"],
          ["Study", "Study"],
          ["Diplomatic", "Diplomatic"],
        ];

  return (
    <main className="min-h-screen bg-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl p-6 md:p-8">
        <div className="border-b pb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🇨🇩</span>

            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-blue-900">
                {language === "fr"
                  ? "Demande de visa"
                  : "Visa Application"}
              </h1>

              <p className="text-gray-600 mt-2">
                {language === "fr"
                  ? "Remplissez le formulaire ci-dessous pour introduire votre demande de visa."
                  : "Complete the form below to apply for a visa."}
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8"
        >
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              {language === "fr"
                ? "Nom complet"
                : "Full Name"}
            </label>

            <input
              name="fullName"
              value={form.fullName}
              placeholder={
                language === "fr"
                  ? "Votre nom complet"
                  : "Your full name"
              }
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-2">
              {language === "fr"
                ? "Adresse e-mail"
                : "Email Address"}
            </label>

            <input
              name="email"
              type="email"
              value={form.email}
              placeholder={
                language === "fr"
                  ? "Votre adresse e-mail"
                  : "Your email address"
              }
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-2">
              {language === "fr"
                ? "Nationalité"
                : "Nationality"}
            </label>

            <input
              name="nationality"
              value={form.nationality}
              placeholder={
                language === "fr"
                  ? "Votre nationalité"
                  : "Your nationality"
              }
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-2">
              {language === "fr"
                ? "Numéro de passeport"
                : "Passport Number"}
            </label>

            <input
              name="passportNumber"
              value={form.passportNumber}
              placeholder={
                language === "fr"
                  ? "Numéro de votre passeport"
                  : "Your passport number"
              }
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-2">
              {language === "fr"
                ? "Date de naissance"
                : "Date of Birth"}
            </label>

            <input
              name="birthDate"
              type="date"
              value={form.birthDate}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-2">
              {language === "fr"
                ? "Date d'arrivée"
                : "Arrival Date"}
            </label>

            <input
              name="arrivalDate"
              type="date"
              value={form.arrivalDate}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-medium text-gray-700 mb-2">
              {language === "fr"
                ? "Motif de la visite"
                : "Purpose of Visit"}
            </label>

            <select
              name="purpose"
              value={form.purpose}
              onChange={handleChange}
              required
              className="w-full border rounded-lg p-3 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">
                {language === "fr"
                  ? "Sélectionnez le motif"
                  : "Select purpose"}
              </option>

              {purposeOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 border-t pt-6">
            <label className="block font-medium text-gray-700 mb-2">
              📄{" "}
              {language === "fr"
                ? "Scan du passeport"
                : "Passport Scan"}
            </label>

            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              required
              className="w-full border rounded-lg p-3 bg-white"
              onChange={(e) =>
                setPassportFile(
                  e.target.files?.[0] ?? null
                )
              }
            />

            <p className="text-xs text-gray-500 mt-1">
              PDF, JPG, JPEG, PNG
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="block font-medium text-gray-700 mb-2">
              📷{" "}
              {language === "fr"
                ? "Photo d'identité"
                : "Passport Photo"}
            </label>

            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              required
              className="w-full border rounded-lg p-3 bg-white"
              onChange={(e) =>
                setPhotoFile(
                  e.target.files?.[0] ?? null
                )
              }
            />

            <p className="text-xs text-gray-500 mt-1">
              JPG, JPEG, PNG
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="block font-medium text-gray-700 mb-2">
              📎{" "}
              {language === "fr"
                ? "Document justificatif (facultatif)"
                : "Supporting Document (Optional)"}
            </label>

            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="w-full border rounded-lg p-3 bg-white"
              onChange={(e) =>
                setSupportFile(
                  e.target.files?.[0] ?? null
                )
              }
            />

            <p className="text-xs text-gray-500 mt-1">
              PDF, JPG, JPEG, PNG
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="md:col-span-2 bg-green-700 text-white rounded-lg p-4 font-bold hover:bg-green-800 disabled:bg-gray-400 transition"
          >
            {submitting
              ? language === "fr"
                ? "Envoi en cours..."
                : "Submitting..."
              : language === "fr"
              ? "Soumettre la demande"
              : "Submit Application"}
          </button>
        </form>
      </div>
    </main>
  );
}