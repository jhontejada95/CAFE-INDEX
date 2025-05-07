// src/App.tsx

import React from "react";
import AIQuerySection from "./components/AIQuerySection";
import { ThemeSwitcher } from "./components/ThemeSwitcher";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import LastPriceInfo from "./components/LastPriceInfo";

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-polkadot-pink-500 dark:bg-polkadot-pink-700 text-white p-4 shadow-md transition-colors duration-300">
        <div className="container mx-auto flex justify-between items-center">
          {/* Título */}
          <h1 className="text-2xl md:text-3xl font-bold">☕ CaféIndex AI</h1>

          {/* Selector de idioma, switch de tema y logo */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <ThemeSwitcher />
            <img
              src="/images/polkadot-logo.svg"
              alt="Polkadot Logo"
              className="h-8 md:h-10 filter brightness-0 invert"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-4 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <AIQuerySection />
        <div className="mt-4">
          <LastPriceInfo />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 transition-colors duration-300">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 md:mb-0 text-center md:text-left">
            Tecnologías usadas: React, Vite, TypeScript, Tailwind CSS,
            @polkadot/api, SubQuery SDK, FastAPI, Python, DeepSeek
          </p>
          <div className="flex space-x-4 items-center">
            <div
              className="h-6 w-6 bg-polkadot-pink-500 rounded-full"
              title="React"
            />
            <div
              className="h-6 w-6 bg-polkadot-pink-300 rounded-full"
              title="Tailwind CSS"
            />
            <div
              className="h-6 w-6 bg-polkadot-pink-700 rounded-full"
              title="SubQuery"
            />
            <div
              className="h-6 w-6 bg-polkadot-pink-400 rounded-full"
              title="Python"
            />
            <div
              className="h-6 w-6 bg-polkadot-pink-200 rounded-full"
              title="DeepSeek"
            />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
