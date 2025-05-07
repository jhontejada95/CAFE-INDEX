// src/components/LastPriceInfo.tsx

import React, { useState, useEffect } from "react";
import * as ethers from "ethers";
import {
  initEthereumContract,
  getPriceByIndex,
  getPriceCount,
} from "../services/ethereum";
import { useLanguage } from "../contexts/LanguageContext";
import { T } from "../i18n";

interface LastPriceInfoProps {}

interface PriceInfo {
  id: string;
  timestamp: bigint;
  price: bigint;
  submitter: string;
}

const DEFAULT_RPC_URL =
  import.meta.env.VITE_EVM_RPC_URL ||
  "https://ethereum-sepolia-rpc.publicnode.com";
const DEFAULT_CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS ||
  "0x0000000000000000000000000000000000000000";

const LastPriceInfo: React.FC<LastPriceInfoProps> = () => {
  const { lang } = useLanguage();
  const [lastPriceInfo, setLastPriceInfo] = useState<PriceInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchLastPriceInfo = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await initEthereumContract(DEFAULT_CONTRACT_ADDRESS, DEFAULT_RPC_URL);
      const priceCount = await getPriceCount();
      if (priceCount > 0) {
        const lastIndex = priceCount - 1;
        const priceData = await getPriceByIndex(lastIndex);
        setLastPriceInfo({
          id: priceData.id,
          timestamp: priceData.timestamp,
          price: priceData.price,
          submitter: priceData.submitter,
        });
      } else {
        setError(T[lang].errorNoQuery);
      }
    } catch (err: any) {
      setError(err.message || T[lang].errorCommunication);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleModal = () => {
    if (!showModal) {
      fetchLastPriceInfo();
    }
    setShowModal(!showModal);
  };

  return (
    <div>
      <button
        onClick={toggleModal}
        disabled={isLoading}
        className={`w-full py-3 text-white bg-polkadot-pink-500 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-polkadot-pink-300
              hover:scale-102 active:scale-98 transition-transform duration-300 ease-out
              ${isLoading ? "opacity-70 cursor-wait" : ""}`}
      >
        {isLoading
          ? T[lang].submitting
          : "Obtener Información del Último Precio"}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Último Precio Enviado
              </h3>
              <div className="px-7 py-3">
                {error && (
                  <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
                    {error}
                  </div>
                )}
                {isLoading ? (
                  <div className="space-y-4 mt-6">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                ) : lastPriceInfo ? (
                  <div className="space-y-2">
                    <p>
                      <strong>ID:</strong> {lastPriceInfo.id}
                    </p>
                    <p>
                      <strong>Timestamp:</strong>{" "}
                      {new Date(
                        Number(lastPriceInfo.timestamp) * 1000,
                      ).toLocaleString()}
                    </p>
                    <p>
                      <strong>Precio:</strong>{" "}
                      {Number(lastPriceInfo.price) / 100}
                    </p>
                    <p>
                      <strong>Submitter:</strong>{" "}
                      {lastPriceInfo.submitter.slice(0, 6)}...
                      {lastPriceInfo.submitter.slice(-4)}
                    </p>
                  </div>
                ) : (
                  <p>No hay información disponible.</p>
                )}
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={toggleModal}
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LastPriceInfo;
