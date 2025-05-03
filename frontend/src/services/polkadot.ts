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
 * Envu00eda una transacciu00f3n para registrar un precio en la blockchain como un log
 * 
 * Esta funciou00f3n utiliza una aproximaciu00f3n minimalista con system.remark
 * para garantizar compatibilidad con cualquier cadena Substrate/Polkadot.
 */
export const submitPrice = async (
  account: InjectedAccountWithMeta,
  id: string,
  timestamp: number,
  price: number
): Promise<{ success: boolean; hash?: string; error?: string }> => {
  try {
    if (!api) {
      await initPolkadotApi();
    }
    
    if (!api) {
      throw new Error('No se pudo inicializar la API');
    }
    
    // Obtener el inyector para la cuenta seleccionada
    const injector = await web3FromSource(account.meta.source);
    
    // Convertir precio a un entero (multiplicando por 100 y redondeando)
    const priceUint = Math.round(price * 100);
    
    // Crear un texto simple para el registro (muy corto para evitar problemas)
    const remarkText = `CAFE:${id}:${priceUint}`;
    
    // Convertir a hexadecimal para evitar problemas de codificaciu00f3n
    const remarkHex = stringToHex(remarkText);
    
    console.log(`Registrando precio en Westend: ${remarkText}`);

    // Crear la transacciu00f3n utilizando system.remark con el dato hexadecimal
    const txHash = await api.tx.system
      .remark(remarkHex)
      .signAndSend(
        account.address,
        { signer: injector.signer },
        ({ status }) => {
          if (status.isInBlock) {
            console.log(`Transacciu00f3n incluida en el bloque: ${status.asInBlock.toHex()}`);
          } else if (status.isFinalized) {
            console.log(`Transacciu00f3n finalizada en el bloque: ${status.asFinalized.toHex()}`);
          }
        }
      );
    
    return { success: true, hash: txHash.toHex() };
  } catch (error) {
    console.error('Error al enviar precio:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
};

export default {
  initPolkadotApi,
  disconnectPolkadotApi,
  checkExtensionInstalled,
  getAccounts,
  submitPrice
};