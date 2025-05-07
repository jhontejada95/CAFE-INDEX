// src/components/AIQuerySection.tsx

import React, { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLanguage } from "../contexts/LanguageContext";
import { T } from "../i18n";
import {
  getPrediction,
  PredictionRequest,
  PredictionResponse,
  PriceData,
} from "../services/api";
import PriceChart from "./PriceChart";
import EthereumConnector from "./EthereumConnector";

const containerFade = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const cardHover =
  "hover:scale-102 active:scale-98 transition-transform duration-300 ease-out";

const AIQuerySection: React.FC = () => {
  const { lang } = useLanguage();

  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [predictionData, setPredictionData] =
    useState<PredictionResponse | null>(null);
  const [connectedEthAccount, setConnectedEthAccount] = useState<string | null>(
    null,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setError(T[lang].errorNoQuery);
      return;
    }
    setIsLoading(true);
    setError(null);
    setPredictionData(null);

    try {
      const request: PredictionRequest = {
        prompt: query,
        days_ahead: 5,
        explanation_required: true,
      };
      const response = await getPrediction(request);
      setPredictionData(response);
    } catch {
      setError(T[lang].errorCommunication);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentPrice = (): string => {
    if (!predictionData?.historical_prices.length) return "N/A";
    return `$${predictionData.historical_prices.slice(-1)[0].price.toFixed(2)}`;
  };

  const getMonthPrediction = (): string => {
    if (!predictionData?.predictions.length) return "N/A";
    return `$${predictionData.predictions.slice(-1)[0].price.toFixed(2)}`;
  };

  return (
    <motion.div
      variants={containerFade}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Sección de consulta IA */}
      <motion.div
        variants={containerFade}
        className={`card p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg ${cardHover}`}
      >
        <h2 className="text-xl font-semibold text-polkadot-pink-500 mb-4">
          {T[lang].aiQueryTitle}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            className="
              w-full h-32 p-4
              placeholder-gray-400 dark:placeholder-gray-600
              text-gray-900 dark:text-gray-100
              bg-gray-50 dark:bg-gray-700
              border border-gray-300 dark:border-gray-600
              rounded-lg focus:outline-none focus:ring-2 focus:ring-polkadot-pink-500
              transition-colors duration-300
            "
            placeholder={T[lang].textareaPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`
              w-full py-3 text-white bg-polkadot-pink-500 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-polkadot-pink-300
              ${isLoading ? "opacity-70 cursor-wait" : cardHover}
            `}
            disabled={isLoading}
          >
            {isLoading ? T[lang].submitting : T[lang].askButton}
          </button>
        </form>

        {error && (
          <motion.div
            variants={containerFade}
            className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg"
          >
            {error}
          </motion.div>
        )}

        {isLoading && (
          <div className="space-y-4 mt-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        )}

        {predictionData && !isLoading && (
          <motion.div
            variants={containerFade}
            className="
              mt-6 p-4 rounded-lg
              bg-polkadot-pink-50 dark:bg-polkadot-pink-800
              border border-polkadot-pink-200 dark:border-polkadot-pink-500
              text-gray-900 dark:text-gray-100
              transition-colors duration-300
            "
          >
            <h3 className="font-semibold mb-4">{T[lang].responseTitle}</h3>
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {predictionData.explanation ||
                  (lang === "en"
                    ? "No explanation available"
                    : "No hay explicación disponible")}
              </ReactMarkdown>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Gráficos y tarjetas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Price History Chart */}
        <motion.div
          variants={containerFade}
          className={`lg:col-span-2 card p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg ${cardHover}`}
        >
          <h2 className="text-xl font-semibold text-polkadot-pink-500 mb-4">
            {T[lang].priceChartTitle}
          </h2>
          {isLoading ? (
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ) : predictionData ? (
            <PriceChart
              historicalPrices={predictionData.historical_prices}
              predictions={predictionData.predictions}
            />
          ) : (
            <div className="h-64 bg-polkadot-pink-100 dark:bg-polkadot-pink-700 flex items-center justify-center rounded-lg">
              <p className="text-polkadot-pink-600">
                {T[lang].chartPlaceholder}
              </p>
            </div>
          )}
        </motion.div>

        {/* Precio Actual / Predicción / Conector */}
        <motion.div variants={containerFade} className="space-y-6">
          {/* Precio Actual */}
          <motion.div
            variants={containerFade}
            className={`card p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg ${cardHover}`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-700">
                {T[lang].currentPriceTitle}
              </h3>
              {isLoading ? (
                <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
              ) : (
                <span className="text-2xl">💵</span>
              )}
            </div>
            <p className="text-3xl font-bold text-polkadot-pink-500 mt-2">
              {getCurrentPrice()} / lb
            </p>
          </motion.div>

          {/* Predicción del Mes */}
          <motion.div
            variants={containerFade}
            className={`card p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg ${cardHover}`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-700">
                {T[lang].monthPredictionTitle}
              </h3>
              {isLoading ? (
                <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
              ) : (
                <span className="text-2xl">📈</span>
              )}
            </div>
            <p className="text-3xl font-bold text-polkadot-pink-500 mt-2">
              {getMonthPrediction()} / lb
            </p>
          </motion.div>

          {/* Conector Ethereum */}
          <motion.div variants={containerFade}>
            <EthereumConnector onAccountChange={setConnectedEthAccount} />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AIQuerySection;
