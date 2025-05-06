import React, { useState, useEffect } from 'react';
import ethereumService from '../services/ethereum';

interface EthereumConnectorProps {
  onAccountChange?: (account: string | null) => void;
}

const EthereumConnector: React.FC<EthereumConnectorProps> = ({ onAccountChange }) => {
  const [extensionFound, setExtensionFound] = useState<boolean | null>(null);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{success: boolean; message: string} | null>(null);
  const [accountBalance, setAccountBalance] = useState<string | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [contractAddress, setContractAddress] = useState<string>('');
  const [isDeployed, setIsDeployed] = useState(false);

  // Comprobar si la extensiu00f3n estu00e1 instalada cuando se carga el componente
  useEffect(() => {
    const checkExtension = async () => {
      const found = await ethereumService.checkWalletExtension();
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
          const balance = await ethereumService.getBalance(selectedAccount);
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
      // Inicializar la conexiu00f3n Web3
      const initialized = await ethereumService.initWeb3();
      
      if (!initialized) {
        setConnectionError('No se pudo inicializar la conexiu00f3n Web3');
        return;
      }
      
      // Obtener cuentas disponibles
      const availableAccounts = await ethereumService.getAccounts();
      
      if (availableAccounts.length === 0) {
        setConnectionError('No se encontraron cuentas en la wallet');
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
    setSelectedAccount(address);
    if (onAccountChange) {
      onAccountChange(address);
    }
  };

  // Actualizar el saldo de la cuenta
  const refreshBalance = async () => {
    if (!selectedAccount) return;
    
    setIsLoadingBalance(true);
    try {
      const balance = await ethereumService.getBalance(selectedAccount);
      setAccountBalance(balance.formatted);
    } catch (error) {
      console.error('Error al actualizar el saldo:', error);
      setAccountBalance('Error');
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Actualizar la direcciu00f3n del contrato
  const handleContractAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContractAddress(e.target.value);
  };

  // Guardar la direcciu00f3n del contrato
  const saveContractAddress = () => {
    if (contractAddress) {
      ethereumService.setContractAddress(contractAddress);
      setIsDeployed(true);
      setSubmitResult({
        success: true,
        message: `Direcciu00f3n del contrato guardada: ${contractAddress}`
      });
    } else {
      setSubmitResult({
        success: false,
        message: 'Introduce una direcciu00f3n de contrato vu00e1lida'
      });
    }
  };

  // Prueba de envu00edo de precio
  const handleSubmitTestPrice = async () => {
    if (!selectedAccount || !isDeployed) return;
    
    setIsSubmitting(true);
    setSubmitResult(null);
    
    try {
      // Valores de prueba para la demostraciu00f3n
      const testId = `CAFE-ETH-${Date.now()}`;
      const testTimestamp = Math.floor(Date.now() / 1000); // timestamp actual en segundos
      const testPrice = 3.75; // precio de prueba
      
      const result = await ethereumService.submitPrice(
        testId,
        testTimestamp,
        testPrice
      );
      
      if (result.success) {
        setSubmitResult({
          success: true,
          message: `Transacciu00f3n enviada correctamente. Hash: ${result.hash}\n\nLa transacciu00f3n se ha registrado en la blockchain exitosamente.`
        });
        
        // Actualizar el saldo si estu00e1 disponible
        if (result.balance) {
          setAccountBalance(result.balance);
        }
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
      // Actualizar el saldo despuu00e9s de completar la operaciu00f3n
      refreshBalance();
    }
  };

  return (
    <div className="card p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-colors duration-300">
      <h3 className="text-xl font-semibold text-polkadot-pink-500 dark:text-polkadot-pink-300 mb-4">🦊 Conectar Wallet Ethereum</h3>
      
      {extensionFound === false && (
        <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-lg transition-colors duration-300">
          <p>No se encontru00f3 MetaMask. Por favor instu00e1lala desde 
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
      
      {selectedAccount ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-polkadot-pink-500 rounded-full mr-2"></div>
              <span className="font-medium text-gray-900 dark:text-gray-100">Conectado</span>
            </div>
            
            {/* Secciu00f3n de saldo */}
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
                ud83dudd04
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
              value={selectedAccount}
              onChange={handleAccountChange}
            >
              {accounts.map(account => (
                <option key={account} value={account}>
                  {account.substring(0, 8)}...{account.substring(account.length - 6)}
                </option>
              ))}
            </select>
          </div>
          
          {/* Secciu00f3n de configuraciu00f3n del contrato */}
          {!isDeployed ? (
            <div className="pt-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Direcciu00f3n del contrato desplegado
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  className="flex-grow p-2 border border-gray-300 dark:border-gray-600 
                            bg-gray-50 dark:bg-gray-700 
                            text-gray-900 dark:text-gray-100
                            rounded-lg focus:outline-none focus:ring-2 focus:ring-polkadot-pink-500 
                            transition-colors duration-300"
                  placeholder="0x..."
                  value={contractAddress}
                  onChange={handleContractAddressChange}
                />
                <button
                  className="px-4 py-2 text-white 
                            bg-polkadot-pink-500 hover:bg-polkadot-pink-600 
                            dark:bg-polkadot-pink-600 dark:hover:bg-polkadot-pink-700
                            rounded-lg focus:outline-none focus:ring-2 focus:ring-polkadot-pink-300
                            transition-colors duration-300"
                  onClick={saveContractAddress}
                >
                  Guardar
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Despliegue el contrato en Remix y pegue la direcciu00f3n aquu00ed
              </div>
            </div>
          ) : (
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
                  'Enviar Precio a Ethereum'
                )}
              </button>
            </div>
          )}
          
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
          disabled={isConnecting || extensionFound === false}
        >
          {isConnecting ? (
            <div className="mx-auto animate-spin h-5 w-5 border-2 border-t-2 border-white rounded-full" />
          ) : (
            'Conectar MetaMask'
          )}
        </button>
      )}
    </div>
  );
};

export default EthereumConnector;