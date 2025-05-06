// src/components/EthereumConnector.tsx

import React, { useState, useEffect } from "react";
import * as ethers from "ethers";
import {
  initEthereumContract,
  initEthereumProvider,
  submitPrice as submitPriceToContract,
  getAccountBalance,
} from "../services/ethereum";
import { useLanguage } from "../contexts/LanguageContext";
import { T } from "../i18n";

interface EthereumConnectorProps {
  onAccountChange?: (account: string | null) => void;
}

const DEFAULT_RPC_URL =
  import.meta.env.VITE_EVM_RPC_URL ||
  "https://ethereum-sepolia-rpc.publicnode.com";
const DEFAULT_CONTRACT_ADDRESS =
  import.meta.env.VITE_CONTRACT_ADDRESS ||
  "0x0000000000000000000000000000000000000000";

const EthereumConnector: React.FC<EthereumConnectorProps> = ({
  onAccountChange,
}) => {
  const { lang } = useLanguage();
  const [hasProvider, setHasProvider] = useState<boolean | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [accountBalance, setAccountBalance] = useState<string | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Comprueba si MetaMask está disponible
  useEffect(() => {
    setHasProvider(!!(window as any).ethereum);
  }, []);

  // Carga el saldo cuando cambia la cuenta
  useEffect(() => {
    const load = async () => {
      if (!account) {
        setAccountBalance(null);
        return;
      }
      setIsLoadingBalance(true);
      try {
        const bal = await getAccountBalance(account, DEFAULT_RPC_URL);
        setAccountBalance(bal.formatted);
      } catch {
        setAccountBalance("Error");
      } finally {
        setIsLoadingBalance(false);
      }
    };
    load();
  }, [account]);

  // Manejo de cuentas y red
  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setAccount(null);
      setIsConnected(false);
      onAccountChange?.(null);
    } else {
      setAccount(accounts[0]);
      setIsConnected(true);
      onAccountChange?.(accounts[0]);
    }
  };
  const handleChainChanged = (hex: string) => setChainId(parseInt(hex, 16));

  useEffect(() => {
    const eth = (window as any).ethereum;
    if (eth) {
      eth.on("accountsChanged", handleAccountsChanged);
      eth.on("chainChanged", handleChainChanged);
      return () => {
        eth.removeListener("accountsChanged", handleAccountsChanged);
        eth.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, []);

  // Conecta MetaMask
  const connectWallet = async () => {
    const eth = (window as any).ethereum;
    if (!eth) {
      setConnectionError(
        lang === "en"
          ? "MetaMask not found. Please install it."
          : "MetaMask no está instalado. Por favor instala la extensión.",
      );
      return;
    }
    setIsConnecting(true);
    setConnectionError(null);
    try {
      const accounts = await eth.request({ method: "eth_requestAccounts" });
      const chainHex = await eth.request({ method: "eth_chainId" });
      setChainId(parseInt(chainHex, 16));

      await initEthereumProvider(DEFAULT_RPC_URL);
      const provider = new ethers.BrowserProvider(eth);
      const newSigner = await provider.getSigner();
      setSigner(newSigner);

      await initEthereumContract(DEFAULT_CONTRACT_ADDRESS, DEFAULT_RPC_URL);
      handleAccountsChanged(accounts);
    } catch (err: any) {
      setConnectionError(err.message || "Unknown error");
    } finally {
      setIsConnecting(false);
    }
  };

  // Refresca saldo
  const refreshBalance = async () => {
    if (!account) return;
    setIsLoadingBalance(true);
    try {
      const bal = await getAccountBalance(account, DEFAULT_RPC_URL);
      setAccountBalance(bal.formatted);
    } catch {
      setAccountBalance("Error");
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Envía precio de prueba
  const handleSubmitTestPrice = async () => {
    if (!account || !signer) return;
    setIsSubmitting(true);
    setSubmitResult(null);
    try {
      const testId = `CAFE-TEST-${Date.now()}`;
      const timestamp = Math.floor(Date.now() / 1000);
      const price = 375;
      const result = await submitPriceToContract(
        account,
        signer,
        testId,
        timestamp,
        price,
      );
      setSubmitResult({
        success: result.success,
        message: result.success
          ? `Transaction hash: ${result.hash}`
          : result.error || "Unknown error",
      });
    } catch (err: any) {
      setSubmitResult({
        success: false,
        message: err.message || "Unknown error",
      });
    } finally {
      setIsSubmitting(false);
      refreshBalance();
    }
  };

  const getNetworkName = (id: number | null) => {
    if (id === null) return lang === "en" ? "Unknown" : "Desconocida";
    const map: Record<number, string> = {
      1: "Ethereum Mainnet",
      5: "Goerli Testnet",
      11155111: "Sepolia Testnet",
    };
    return map[id] || `Chain ${id}`;
  };

  return (
    <div className="card p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-colors duration-300">
      <h3 className="text-xl font-semibold text-polkadot-pink-500 mb-4">
        🔗 {T[lang].connect}
      </h3>

      {hasProvider === false && (
        <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 rounded-lg">
          {lang === "en"
            ? "MetaMask not found. Please install it."
            : "No se encontró MetaMask. Por favor instala la extensión."}
        </div>
      )}

      {connectionError && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 rounded-lg">
          {connectionError}
        </div>
      )}

      {isConnected && account ? (
        <div className="space-y-4">
          {/* Estado & Saldo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-polkadot-pink-500 rounded-full" />
              <span>{T[lang].connectedLabel}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>{T[lang].balanceLabel}</span>
              {isLoadingBalance ? (
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
              ) : (
                <span className="font-medium">
                  {accountBalance ? `${accountBalance} WND` : "—"}
                </span>
              )}
              <button
                onClick={refreshBalance}
                title={lang === "en" ? "Refresh balance" : "Actualizar saldo"}
              >
                🔄
              </button>
            </div>
          </div>

          {/* Cuenta */}
          <div>
            <label className="block text-sm mb-1">{T[lang].accountLabel}</label>
            <div className="p-2 border rounded">
              {account.slice(0, 6)}…{account.slice(-4)}
            </div>
          </div>

          {/* Red */}
          <div>
            <label className="block text-sm mb-1">{T[lang].networkLabel}</label>
            <div className="p-2 border rounded">{getNetworkName(chainId)}</div>
          </div>

          {/* Botón Enviar Prueba */}
          <button
            onClick={handleSubmitTestPrice}
            disabled={isSubmitting}
            className="w-full py-3 text-white bg-polkadot-pink-500 rounded-lg focus:ring-2 focus:ring-polkadot-pink-300 transition-colors"
          >
            {isSubmitting ? T[lang].submitting : T[lang].submitTest}
          </button>

          {/* Resultado con collapse y scroll */}
          {submitResult && (
            <details
              className={`mt-3 p-3 rounded-lg transition-colors duration-300 max-h-64 overflow-y-auto ${
                submitResult.success
                  ? "bg-green-100 dark:bg-green-900/30 text-green-800"
                  : "bg-red-100 dark:bg-red-900/30 text-red-700"
              }`}
            >
              <summary className="cursor-pointer font-semibold">
                {submitResult.success
                  ? lang === "en"
                    ? "Details"
                    : "Detalles"
                  : lang === "en"
                    ? "Error Details"
                    : "Detalles del error"}
              </summary>
              <pre className="mt-2 whitespace-pre-wrap text-sm font-mono overflow-x-auto">
                {submitResult.message}
              </pre>
            </details>
          )}
        </div>
      ) : (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="w-full py-3 text-white bg-polkadot-pink-500 rounded-lg focus:ring-2 focus:ring-polkadot-pink-300 transition-colors"
        >
          {isConnecting ? T[lang].submitting : T[lang].connect}
        </button>
      )}
    </div>
  );
};

export default EthereumConnector;
