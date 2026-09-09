"use client";

import { useEffect, useState } from "react";

type Language = "fr" | "en";

export default function LanguageSwitcher() {
  const [language, setLanguage] = useState<Language>("fr");

  useEffect(() => {
    const saved = window.localStorage.getItem("eforeigner-language");

    if (saved === "en" || saved === "fr") {
      setLanguage(saved);
    }
  }, []);

  function changeLanguage(value: Language) {
    setLanguage(value);
    window.localStorage.setItem("eforeigner-language", value);

    window.dispatchEvent(
      new CustomEvent("eforeigner-language-change", {
        detail: value,
      })
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 p-1">
      <button
        type="button"
        onClick={() => changeLanguage("fr")}
        className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
          language === "fr"
            ? "bg-white text-blue-900"
            : "text-white hover:bg-white/10"
        }`}
      >
        Français
      </button>

      <button
        type="button"
        onClick={() => changeLanguage("en")}
        className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
          language === "en"
            ? "bg-white text-blue-900"
            : "text-white hover:bg-white/10"
        }`}
      >
        English
      </button>
    </div>
  );
}