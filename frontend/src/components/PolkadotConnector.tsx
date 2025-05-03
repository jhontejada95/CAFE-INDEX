import React, { useState, useEffect } from 'react';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import {
  checkExtensionInstalled,
  getAccounts,
  submitPrice,
  initPolkadotApi
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

  // Comprobar si la extensiu00f3n estu00e1 instalada cuando se carga el componente
  useEffect(() => {
    const checkExtension = async () => {
      const found = await checkExtensionInstalled();
      setExtensionFound(found);
    };
    
    checkExtension();
  }, []);

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

  // Prueba de enviu00f3 de precio (solo para demostrar la funcionalidad)
  const handleSubmitTestPrice = async () => {
    if (!selectedAccount) return;
    
    setIsSubmitting(true);
    setSubmitResult(null);
    
    try {
      // Valores de prueba para la demostración
      const testId = `CAFE-TEST-${Date.now()}`;
      const testTimestamp = Date.now(); // timestamp actual en milisegundos
      const testPrice = 3.75; // precio de prueba
      
      const result = await submitPrice(
        selectedAccount,
        testId,
        testTimestamp,
        testPrice
      );
      
      if (result.success) {
        setSubmitResult({
          success: true,
          message: `Precio enviado correctamente. Hash: ${result.hash}`
        });
      } else {
        setSubmitResult({
          success: false,
          message: `Error al enviar precio: ${result.error}`
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
    }
  };

  return (
    <div className="card p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-xl font-semibold text-cafe-purple-700 mb-4">Conectar Wallet Polkadot</h3>
      
      {extensionFound === false && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg">
          <p>No se encontru00f3 la extensiu00f3n Polkadot.js. Por favor instu00e1lala desde 
            <a href="https://polkadot.js.org/extension/" 
               target="_blank" 
               rel="noopener noreferrer"
               className="text-cafe-purple-600 hover:underline">
              {' '}polkadot.js.org/extension
            </a>
          </p>
        </div>
      )}
      
      {connectionError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {connectionError}
        </div>
      )}
      
      {selectedAccount ? (
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="font-medium">Conectado</span>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cuenta seleccionada
            </label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md"
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
              className="btn-primary w-full"
              onClick={handleSubmitTestPrice}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Precio de Prueba'}
            </button>
          </div>
          
          {submitResult && (
            <div className={`mt-3 p-3 rounded-lg ${submitResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
              {submitResult.message}
            </div>
          )}
          
        </div>
      ) : (
        <button
          className="btn-primary w-full"
          onClick={connectWallet}
          disabled={isConnecting || extensionFound === false}
        >
          {isConnecting ? 'Conectando...' : 'Conectar Wallet'}
        </button>
      )}
    </div>
  );
};

export default PolkadotConnector;