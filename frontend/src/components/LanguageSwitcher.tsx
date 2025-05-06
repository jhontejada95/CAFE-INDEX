// src/components/LanguageSwitcher.tsx

import React from "react";
import { useLanguage } from "../contexts/LanguageContext";

export const LanguageSwitcher: React.FC = () => {
  const { lang, setLang } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Select Language"
      className="relative inline-flex overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
    >
      {/* Slider animado, ocupa la mitad del contenedor */}
      <div
        className={`
          absolute inset-y-0 left-0 w-1/2
          bg-polkadot-pink-500 rounded-full
          transform transition-transform duration-300 ease-out
          ${lang === "es" ? "translate-x-full" : "translate-x-0"}
        `}
      />

      {/* EN */}
      <button
        onClick={() => setLang("en")}
        className={`
          relative z-10 flex-1 px-4 py-1 text-sm text-center
          transition-colors duration-200
          ${
            lang === "en"
              ? "text-white"
              : "text-gray-700 dark:text-gray-300 hover:text-white"
          }
        `}
      >
        EN
      </button>

      {/* ES */}
      <button
        onClick={() => setLang("es")}
        className={`
          relative z-10 flex-1 px-4 py-1 text-sm text-center
          transition-colors duration-200
          ${
            lang === "es"
              ? "text-white"
              : "text-gray-700 dark:text-gray-300 hover:text-white"
          }
        `}
      >
        ES
      </button>
    </div>
  );
};
