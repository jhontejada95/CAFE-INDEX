import React, { useState, useEffect } from 'react';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import {
  checkExtensionInstalled,
  getAccounts,
  submitPrice,
  initPolkadotApi,
  getAccountBalance
} from '../services/polkadot';

interface PolkadotConnectorProps {
  onAccountChange?: (account: InjectedAccountWithMeta | null) => void;
}

const PolkadotConnector: React.FC<PolkadotConnectorProps> = ({ onAccountChange }) => {
  const [extensionFound, setExtensionFound] = useState<boolean | null>(null);
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<InjectedAccountWithMeta | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{success: boolean; message: string} | null>(null);
  const [accountBalance, setAccountBalance] = useState<string | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Comprobar si la extensiu00f3n estu00e1 instalada cuando se carga el componente
  useEffect(() => {
    const checkExtension = async () => {
      const found = await checkExtensionInstalled();
      setExtensionFound(found);
    };
    
    checkExtension();
  }, []);

  // Cargar el saldo cuando cambia la cuenta seleccionada
  useEffect(() => {
    const loadBalance = async () => {
      if (selectedAccount) {
        setIsLoadingBalance(true);
        try {
          const balance = await getAccountBalance(selectedAccount.address);
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
  }, [selectedAccount]);

  // Conectar a la wallet
  const connectWallet = async () => {
    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      // Inicializar la API de Polkadot
      await initPolkadotApi();
      
      // Obtener cuentas disponibles
      const availableAccounts = await getAccounts();
      
      if (availableAccounts.length === 0) {
        setConnectionError('No se encontraron cuentas en la extensiu00f3n Polkadot.js');
      } else {
        setAccounts(availableAccounts);
        // Seleccionar la primera cuenta por defecto
        setSelectedAccount(availableAccounts[0]);
        if (onAccountChange) {
          onAccountChange(availableAccounts[0]);
        }
      }
    } catch (error) {
      console.error('Error al conectar wallet:', error);
      setConnectionError(error instanceof Error ? error.message : 'Error desconocido al conectar');
    } finally {
      setIsConnecting(false);
    }
  };

  // Cambiar la cuenta seleccionada
  const handleAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const address = e.target.value;
    const account = accounts.find(acc => acc.address === address) || null;
    setSelectedAccount(account);
    if (onAccountChange) {
      onAccountChange(account);
    }
  };

  // Actualizar el saldo de la cuenta
  const refreshBalance = async () => {
    if (!selectedAccount) return;
    
    setIsLoadingBalance(true);
    try {
      const balance = await getAccountBalance(selectedAccount.address);
      setAccountBalance(balance.formatted);
    } catch (error) {
      console.error('Error al actualizar el saldo:', error);
      setAccountBalance('Error');
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Prueba de envu00edo de precio (solo para demostrar la funcionalidad)
  const handleSubmitTestPrice = async () => {
    if (!selectedAccount) return;
    
    setIsSubmitting(true);
    setSubmitResult(null);
    
    try {
      // Valores de prueba para la demostraciu00f3n
      const testId = `CAFE-TEST-${Date.now()}`;
      const testTimestamp = Date.now(); // timestamp actual en milisegundos
      const testPrice = 3.75; // precio de prueba
      
      const result = await submitPrice(
        selectedAccount,
        testId,
        testTimestamp,
        testPrice
      );
      
      // Actualizar el saldo despuu00e9s de enviar la transacciu00f3n
      if (result.balance) {
        setAccountBalance(result.balance);
      }
      
      if (result.success) {
        setSubmitResult({
          success: true,
          message: `Transacciu00f3n enviada correctamente. Hash: ${result.hash}\n\nLa transacciu00f3n se ha registrado en la blockchain de Westend exitosamente.`
        });
      } else {
        // Mensajes de error mu00e1s descriptivos para el usuario
        let errorMessage = result.error || 'Error desconocido';

        // Si tenemos el saldo, mostrarlo en el mensaje de error
        if (result.balance) {
          errorMessage = `${errorMessage}\n\nSaldo actual: ${result.balance} WND`;
          
          if (result.minBalance) {
            errorMessage += `\nSaldo mu00ednimo requerido: ${result.minBalance} WND`;
          }
        }

        // Verificar si se trata de un error de fondos insuficientes
        if (errorMessage.includes('Saldo insuficiente') || errorMessage.toLowerCase().includes('insufficient balance')) {
          errorMessage += `\n\nNecesitas obtener WND para pruebas desde el faucet de Westend: https://faucet.westend.network/`;
        }
        
        setSubmitResult({
          success: false,
          message: errorMessage
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
      // Actualizar el saldo despuu00e9s de completar la operaciu00f3n
      refreshBalance();
    }
  };

  return (
    <div className="card p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-colors duration-300">
      <h3 className="text-xl font-semibold text-polkadot-pink-500 dark:text-polkadot-pink-300 mb-4">🔗 Conectar Wallet Polkadot</h3>
      
      {extensionFound === false && (
        <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-lg transition-colors duration-300">
          <p>No se encontró la extensión Polkadot.js. Por favor instálala desde 
            <a href="https://polkadot.js.org/extension/" 
               target="_blank" 
               rel="noopener noreferrer"
               className="text-polkadot-pink-500 dark:text-polkadot-pink-300 hover:underline">
              {' '}polkadot.js.org/extension
            </a>
          </p>
        </div>
      )}
      
      {connectionError && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg transition-colors duration-300">
          {connectionError}
        </div>
      )}
      
      {selectedAccount ? (
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
                  {accountBalance ? `${accountBalance} WND` : 'Desconocido'}
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
              Cuenta seleccionada
            </label>
            <select 
              className="w-full p-2 border border-gray-300 dark:border-gray-600 
                        bg-gray-50 dark:bg-gray-700 
                        text-gray-900 dark:text-gray-100
                        rounded-lg focus:outline-none focus:ring-2 focus:ring-polkadot-pink-500 
                        transition-colors duration-300"
              value={selectedAccount.address}
              onChange={handleAccountChange}
            >
              {accounts.map(account => (
                <option key={account.address} value={account.address}>
                  {account.meta.name} - {account.address.substring(0, 8)}...{account.address.substring(account.address.length - 6)}
                </option>
              ))}
            </select>
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
              {!submitResult.success && submitResult.message.includes('faucet.westend.network') && (
                <div className="mt-2">
                  <a 
                    href="https://faucet.westend.network/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 mt-2 bg-polkadot-pink-500 hover:bg-polkadot-pink-600 
                              text-white rounded-lg transition-colors duration-300"
                  >
                    Ir al Faucet de Westend
                  </a>
                </div>
              )}
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
          disabled={isConnecting || extensionFound === false}
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

export default PolkadotConnector;