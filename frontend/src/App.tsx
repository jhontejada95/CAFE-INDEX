import React, { useState } from 'react';
import AIQuerySection from './components/AIQuerySection';

// Importamos el logo de Polkadot
import polkadotLogo from '/images/polkadot-logo.svg';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-cafe-purple-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold">☕ CaféIndex AI</h1>
          <img src={polkadotLogo} alt="Polkadot Logo" className="h-8 md:h-10" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto p-4">
        {/* AIQuerySection maneja toda la interfaz de consulta y visualización */}
        <AIQuerySection />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm mb-4 md:mb-0 text-center md:text-left">
            Tecnologías usadas: React, Vite, TypeScript, Tailwind CSS, @polkadot/api, SubQuery SDK, FastAPI, Python, DeepSeek
          </p>
          <div className="flex space-x-4 items-center">
            {/* Logos de tecnologías */}
            <div className="h-6 w-6 bg-blue-500 rounded-full" title="React"></div>
            <div className="h-6 w-6 bg-cyan-500 rounded-full" title="Tailwind CSS"></div>
            <div className="h-6 w-6 bg-purple-500 rounded-full" title="SubQuery"></div>
            <div className="h-6 w-6 bg-yellow-500 rounded-full" title="Python"></div>
            <div className="h-6 w-6 bg-green-500 rounded-full" title="DeepSeek"></div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;