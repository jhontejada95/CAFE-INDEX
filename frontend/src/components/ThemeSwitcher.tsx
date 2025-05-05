// src/components/ThemeSwitcher.tsx

import React from "react";
import { useDarkMode } from "../hooks/useDarkMode";
import { Sun, Moon } from "lucide-react";

export const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useDarkMode();
  const isDark = theme === "dark";

  const toggle = () => setTheme(isDark ? "light" : "dark");

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className={
        `p-2 rounded-full focus:outline-none
         focus:ring-2 focus:ring-offset-2
         focus:ring-polkadot-pink transition
         duration-200
         ` +
        // fondo para aislar mejor el icono
        (isDark
          ? " bg-gray-700 hover:bg-gray-600"
          : " bg-gray-200 hover:bg-gray-300")
      }
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-yellow-400" />
      ) : (
        <Moon className="h-5 w-5 text-gray-900" />
      )}
    </button>
  );
};
