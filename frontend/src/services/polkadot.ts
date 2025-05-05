import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { stringToHex } from '@polkadot/util';

// URL del nodo Westend
const WESTEND_WS_URL = 'wss://westend-rpc.polkadot.io';

// Nombre de nuestra aplicaciu00f3n a mostrar en la extensiu00f3n
const APP_NAME = 'CafeIndex AI';

let api: ApiPromise | null = null;

/**
 * Inicializa la conexiu00f3n con la API de Polkadot
 */
export const initPolkadotApi = async (): Promise<ApiPromise> => {
  if (api) return api;
  
  try {
    console.log(`Conectando a Westend en ${WESTEND_WS_URL}...`);
    const provider = new WsProvider(WESTEND_WS_URL);
    api = await ApiPromise.create({ provider });
    
    // Esperar a que la API estu00e9 lista
    await api.isReady;
    console.log('Conexiu00f3n a Westend establecida correctamente');
    
    // Imprimir informaciu00f3n sobre los mu00e9todos disponibles
    console.log('Mu00e9todos disponibles en balances:', Object.keys(api.tx.balances));
    
    return api;
  } catch (error) {
    console.error('Error al conectar con Westend:', error);
    throw error;
  }
};

/**
 * Cierra la conexiu00f3n con la API de Polkadot
 */
export const disconnectPolkadotApi = async (): Promise<void> => {
  if (api) {
    await api.disconnect();
    api = null;
    console.log('Desconectado de Westend');
  }
};

/**
 * Verifica si la extensiu00f3n Polkadot.js estu00e1 instalada
 */
export const checkExtensionInstalled = async (): Promise<boolean> => {
  try {
    const extensions = await web3Enable(APP_NAME);
    return extensions.length > 0;
  } catch (error) {
    console.error('Error al verificar la extensiu00f3n Polkadot.js:', error);
    return false;
  }
};

/**
 * Obtiene las cuentas disponibles en la extensiu00f3n Polkadot.js
 */
export const getAccounts = async (): Promise<InjectedAccountWithMeta[]> => {
  try {
    // Habilitar la extensiu00f3n primero
    const extensions = await web3Enable(APP_NAME);
    if (extensions.length === 0) {
      throw new Error('No se encontru00f3 la extensiu00f3n Polkadot.js');
    }
    
    // Obtener todas las cuentas
    const allAccounts = await web3Accounts();
    return allAccounts;
  } catch (error) {
    console.error('Error al obtener cuentas:', error);
    return [];
  }
};

/**
 * Obtiene el saldo de una cuenta
 */
export const getAccountBalance = async (address: string): Promise<{ formatted: string, raw: bigint }> => {
  if (!api) {
    await initPolkadotApi();
  }
  
  if (!api) {
    throw new Error('No se pudo inicializar la API');
  }
  
  const { data: balanceData } = await api.query.system.account(address);
  const balanceFree = balanceData.free.toBigInt();
  const balanceFormatted = (Number(balanceFree) / 10**10).toFixed(4); // Convertir a WND con 4 decimales
  
  return {
    formatted: balanceFormatted,
    raw: balanceFree
  };
};

/**
 * Envu00eda una transferencia simple a otra cuenta en la blockchain
 */
export const submitPrice = async (
  account: InjectedAccountWithMeta,
  id: string,
  timestamp: number,
  price: number
): Promise<{ success: boolean; hash?: string; error?: string; balance?: string; minBalance?: string }> => {
  try {
    if (!api) {
      await initPolkadotApi();
    }
    
    if (!api) {
      throw new Error('No se pudo inicializar la API');
    }
    
    // Verificar saldo disponible
    const { data: balanceData } = await api.query.system.account(account.address);
    const balanceFree = balanceData.free.toBigInt();
    const balanceFormatted = (Number(balanceFree) / 10**10).toFixed(4); // Convertir a WND con 4 decimales
    
    // Obtener una estimaciu00f3n de las tarifas
    const MIN_BALANCE = BigInt(10000000000); // 0.01 WND
    const minBalanceFormatted = '0.0100'; // Valor fijo formateado
    
    if (balanceFree < MIN_BALANCE) {
      return { 
        success: false, 
        error: `Saldo insuficiente. Se necesita al menos 0.01 WND para transacciones.`,
        balance: balanceFormatted,
        minBalance: minBalanceFormatted
      };
    }
    
    // Direcciu00f3n de la cuenta de destino - usamos la misma cuenta para enviar a su00ed misma
    const targetAddress = account.address;
    
    // Valor mu00ednimo a transferir
    const transferAmount = 10000000; // 0.001 WND
    
    console.log(`Intentando enviar ${transferAmount / 10**10} WND a ${targetAddress}`);
    
    // Obtener el inyector para la cuenta seleccionada
    const injector = await web3FromSource(account.meta.source);
    
    // Usamos directamente transferKeepAlive que sabemos que existe en Westend
    return new Promise((resolve) => {
      api.tx.balances
        .transferKeepAlive(targetAddress, transferAmount)
        .signAndSend(
          account.address,
          { signer: injector.signer },
          (result) => {
            const { status, dispatchError } = result;
            
            if (dispatchError) {
              let errorMessage = '';
              if (dispatchError.isModule) {
                // Para errores de mu00f3dulo, podemos extraer informaciu00f3n
                try {
                  const decoded = api?.registry.findMetaError(dispatchError.asModule);
                  errorMessage = decoded ? `${decoded.section}.${decoded.method}: ${decoded.docs}` : dispatchError.toString();
                } catch (err) {
                  errorMessage = `Error de mu00f3dulo: ${dispatchError.toString()}`;
                }
              } else {
                // Otros errores
                errorMessage = dispatchError.toString();
              }
              
              console.error('Error en transacciu00f3n:', errorMessage);
              resolve({
                success: false,
                error: errorMessage,
                balance: balanceFormatted,
                minBalance: minBalanceFormatted
              });
            } else if (status.isInBlock || status.isFinalized) {
              // La transacciu00f3n se ha incluido en un bloque
              const blockHash = status.isInBlock ? status.asInBlock.toString() : status.asFinalized.toString();
              console.log(`Transacciu00f3n incluida en bloque: ${blockHash}`);
              resolve({
                success: true,
                hash: blockHash,
                balance: balanceFormatted,
                minBalance: minBalanceFormatted
              });
            }
          }
        )
        .catch((error) => {
          console.error('Error al enviar transacciu00f3n:', error);
          resolve({
            success: false,
            error: error.message,
            balance: balanceFormatted,
            minBalance: minBalanceFormatted
          });
        });
    });

  } catch (error) {
    console.error('Error general:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

export default {
  initPolkadotApi,
  disconnectPolkadotApi,
  checkExtensionInstalled,
  getAccounts,
  getAccountBalance,
  submitPrice
};