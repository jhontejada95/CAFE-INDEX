import React, { useState, useEffect } from 'react';
import * as ethers from 'ethers';
import { 
  initEthereumContract,
  initEthereumProvider,
  submitPrice as submitPriceToContract,
  getAccountBalance
} from '../services/ethereum';

interface EthereumConnectorProps {
  onAccountChange?: (account: string | null) => void;
}

// URL RPC y dirección del contrato desde las variables de entorno
const DEFAULT_RPC_URL = import.meta.env.VITE_EVM_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com'; // Sepolia testnet por defecto
const DEFAULT_CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'; // Dirección por defecto

const EthereumConnector: React.FC<EthereumConnectorProps> = ({ onAccountChange }) => {
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
  const [submitResult, setSubmitResult] = useState<{success: boolean; message: string} | null>(null);

  // Comprobar si tenemos acceso a la API de Ethereum
  useEffect(() => {
    const checkProvider = async () => {
      const provider = window.ethereum;
      setHasProvider(!!provider);
    };
    
    checkProvider();
  }, []);

  // Efecto para cargar el saldo cuando cambia la cuenta
  useEffect(() => {
    const loadBalance = async () => {
      if (account) {
        setIsLoadingBalance(true);
        try {
          const balance = await getAccountBalance(account, DEFAULT_RPC_URL);
          setAccountBalance(balance.formatted);
        } catch (error) {
          console.error('Error al cargar el saldo:', error);
          setAccountBalance('Error');
        } finally {
          setIsLoadingBalance(false);
        }
      } else {
        setAccountBalance(null);
      }
    };
    
    loadBalance();
  }, [account]);

  // Manejar cambios de cuenta
  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      // El usuario se desconectó
      setAccount(null);
      setIsConnected(false);
      if (onAccountChange) onAccountChange(null);
    } else {
      // Establecer la nueva cuenta activa
      setAccount(accounts[0]);
      setIsConnected(true);
      if (onAccountChange) onAccountChange(accounts[0]);
    }
  };

  // Manejar cambios de red
  const handleChainChanged = (chainIdHex: string) => {
    setChainId(parseInt(chainIdHex, 16));
  };

  // Añadir event listeners para MetaMask
  useEffect(() => {
    if (window.ethereum) {
      // Listeners para eventos de MetaMask
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  // Conectar a MetaMask
  const connectWallet = async () => {
    if (!window.ethereum) {
      setConnectionError('MetaMask no está instalado. Por favor instala la extensión.');
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      // Solicitar conexión de cuentas
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Obtener chainId actual
      const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
      const currentChainId = parseInt(chainIdHex, 16);
      setChainId(currentChainId);
      
      // Inicializar el proveedor primero con la URL RPC 
      await initEthereumProvider(DEFAULT_RPC_URL);
      
      // Crear provider y signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const newSigner = await provider.getSigner();
      setSigner(newSigner);
      
      // Inicializar contrato
      await initEthereumContract(DEFAULT_CONTRACT_ADDRESS, DEFAULT_RPC_URL);
      
      // Actualizar estado con la cuenta conectada
      handleAccountsChanged(accounts);
    } catch (error) {
      console.error('Error al conectar con MetaMask:', error);
      setConnectionError(error instanceof Error ? error.message : 'Error desconocido al conectar');
    } finally {
      setIsConnecting(false);
    }
  };

  // Actualizar el saldo
  const refreshBalance = async () => {
    if (!account) return;
    
    setIsLoadingBalance(true);
    try {
      const balance = await getAccountBalance(account, DEFAULT_RPC_URL);
      setAccountBalance(balance.formatted);
    } catch (error) {
      console.error('Error al actualizar el saldo:', error);
      setAccountBalance('Error');
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Enviar un precio de prueba al contrato
  const handleSubmitTestPrice = async () => {
    if (!account || !signer) return;
    
    setIsSubmitting(true);
    setSubmitResult(null);
    
    try {
      // Valores de prueba para la demostración
      const testId = `CAFE-TEST-${Date.now()}`;
      const testTimestamp = Math.floor(Date.now() / 1000); // timestamp en segundos
      const testPrice = 375; // 3.75 USD en centavos
      
      const result = await submitPriceToContract(
        account,
        signer,
        testId,
        testTimestamp,
        testPrice
      );
      
      if (result.success) {
        setSubmitResult({
          success: true,
          message: `Transacción enviada correctamente. Hash: ${result.hash}\n\nLa transacción se ha registrado en la blockchain exitosamente.`
        });
      } else {
        setSubmitResult({
          success: false,
          message: result.error || 'Error desconocido'
        });
      }
    } catch (error) {
      console.error('Error al enviar precio de prueba:', error);
      setSubmitResult({
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setIsSubmitting(false);
      // Actualizar el saldo después de completar la operación
      refreshBalance();
    }
  };

  // Obtener el nombre de la red según el chainId
  const getNetworkName = (id: number | null): string => {
    if (id === null) return 'Desconocida';
    
    const networks: {[key: number]: string} = {
      1: 'Ethereum Mainnet',
      5: 'Goerli Testnet',
      11155111: 'Sepolia Testnet',
      137: 'Polygon Mainnet',
      80001: 'Mumbai Testnet',
      56: 'BSC Mainnet',
      97: 'BSC Testnet'
    };
    
    return networks[id] || `Cadena ${id}`;
  };

  return (
    <div className="card p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-colors duration-300">
      <h3 className="text-xl font-semibold text-polkadot-pink-500 dark:text-polkadot-pink-300 mb-4">🔗 Conectar Wallet Ethereum</h3>
      
      {hasProvider === false && (
        <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-lg transition-colors duration-300">
          <p>No se encontró MetaMask. Por favor instala la extensión desde
            <a href="https://metamask.io/download/" 
               target="_blank" 
               rel="noopener noreferrer"
               className="text-polkadot-pink-500 dark:text-polkadot-pink-300 hover:underline">
              {' '}metamask.io
            </a>
          </p>
        </div>
      )}
      
      {connectionError && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg transition-colors duration-300">
          {connectionError}
        </div>
      )}
      
      {isConnected && account ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-polkadot-pink-500 rounded-full mr-2"></div>
              <span className="font-medium text-gray-900 dark:text-gray-100">Conectado</span>
            </div>
            
            {/* Sección de saldo */}
            <div className="flex items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Saldo:</span>
              {isLoadingBalance ? (
                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              ) : (
                <span className="text-sm font-medium text-polkadot-pink-500 dark:text-polkadot-pink-300">
                  {accountBalance ? `${accountBalance} ETH` : 'Desconocido'}
                </span>
              )}
              <button 
                className="ml-2 text-xs p-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={refreshBalance}
                title="Actualizar saldo"
              >
                🔄
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cuenta conectada
            </label>
            <div className="p-2 border border-gray-300 dark:border-gray-600 
                          bg-gray-50 dark:bg-gray-700 
                          text-gray-900 dark:text-gray-100
                          rounded-lg transition-colors duration-300">
              {account.substring(0, 10)}...{account.substring(account.length - 8)}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Red actual
            </label>
            <div className="p-2 border border-gray-300 dark:border-gray-600 
                          bg-gray-50 dark:bg-gray-700 
                          text-gray-900 dark:text-gray-100
                          rounded-lg transition-colors duration-300">
              {getNetworkName(chainId)}
            </div>
          </div>
          
          <div className="pt-2">
            <button
              className="w-full py-3 text-white 
                        bg-polkadot-pink-500 hover:bg-polkadot-pink-600 
                        dark:bg-polkadot-pink-600 dark:hover:bg-polkadot-pink-700
                        rounded-lg focus:outline-none focus:ring-2 focus:ring-polkadot-pink-300
                        transition-colors duration-300"
              onClick={handleSubmitTestPrice}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="mx-auto animate-spin h-5 w-5 border-2 border-t-2 border-white rounded-full" />
              ) : (
                'Enviar Precio de Prueba'
              )}
            </button>
          </div>
          
          {submitResult && (
            <div className={`mt-3 p-3 rounded-lg transition-colors duration-300 ${
              submitResult.success 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            }`}>
              {submitResult.message.split('\n').map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  {index < submitResult.message.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      ) : (
        <button
          className="w-full py-3 text-white 
                    bg-polkadot-pink-500 hover:bg-polkadot-pink-600 
                    dark:bg-polkadot-pink-600 dark:hover:bg-polkadot-pink-700
                    rounded-lg focus:outline-none focus:ring-2 focus:ring-polkadot-pink-300
                    transition-colors duration-300"
          onClick={connectWallet}
          disabled={isConnecting || hasProvider === false}
        >
          {isConnecting ? (
            <div className="mx-auto animate-spin h-5 w-5 border-2 border-t-2 border-white rounded-full" />
          ) : (
            'Conectar Wallet'
          )}
        </button>
      )}
    </div>
  );
};

export default EthereumConnector;