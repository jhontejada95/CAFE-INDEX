import Web3 from 'web3';
import { AbiItem } from 'web3-utils';

// ABI del contrato CafeIndex (exportado desde Remix o generado al compilar)
const CONTRACT_ABI: AbiItem[] = [
  // Definición de submitPrice
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "id",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      }
    ],
    "name": "submitPrice",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Definición de getPriceCount
  {
    "inputs": [],
    "name": "getPriceCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // Definición de getPriceByIndex
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "getPriceByIndex",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "id",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "price",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "submitter",
            "type": "address"
          }
        ],
        "internalType": "struct CafeIndex.PriceData",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // Evento PriceSubmitted
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "id",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "submitter",
        "type": "address"
      }
    ],
    "name": "PriceSubmitted",
    "type": "event"
  }
];

// Dirección del contrato (deberá ser actualizada después del despliegue en Remix)
let CONTRACT_ADDRESS = '';

// Clase para interactuar con el contrato Ethereum
export class EthereumService {
  private web3: Web3 | null = null;
  private contract: any = null;
  private account: string | null = null;

  /**
   * Inicializa Web3 y se conecta a la red Ethereum
   */
  async initWeb3(): Promise<boolean> {
    if (window.ethereum) {
      // Navegador moderno con extensión como MetaMask
      this.web3 = new Web3(window.ethereum);
      try {
        // Solicitar acceso a la cuenta
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        this.account = accounts[0];
        console.log('Cuenta Ethereum conectada:', this.account);
        
        // Inicializar contrato
        if (CONTRACT_ADDRESS) {
          this.contract = new this.web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
        } else {
          console.error('La dirección del contrato no está configurada');
          return false;
        }
        
        return true;
      } catch (error) {
        console.error('Error al acceder a cuentas Ethereum:', error);
        return false;
      }
    } else {
      console.error('No se encontró proveedor de Web3');
      return false;
    }
  }

  /**
   * Actualiza la dirección del contrato (útil después del despliegue)
   */
  setContractAddress(address: string) {
    CONTRACT_ADDRESS = address;
    if (this.web3) {
      this.contract = new this.web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    }
  }

  /**
   * Verifica si hay una extensión de billetera disponible
   */
  async checkWalletExtension(): Promise<boolean> {
    return !!window.ethereum;
  }

  /**
   * Obtiene las cuentas disponibles
   */
  async getAccounts(): Promise<string[]> {
    if (!this.web3) {
      await this.initWeb3();
    }
    if (!this.web3) return [];

    try {
      return await this.web3.eth.getAccounts();
    } catch (error) {
      console.error('Error al obtener cuentas:', error);
      return [];
    }
  }

  /**
   * Obtiene el saldo de una dirección en ETH
   */
  async getBalance(address: string): Promise<{ formatted: string, raw: string }> {
    if (!this.web3) {
      await this.initWeb3();
    }
    if (!this.web3) {
      throw new Error('Web3 no inicializado');
    }

    try {
      const balanceWei = await this.web3.eth.getBalance(address);
      const balanceEth = this.web3.utils.fromWei(balanceWei, 'ether');
      
      return {
        formatted: parseFloat(balanceEth).toFixed(4),
        raw: balanceWei
      };
    } catch (error) {
      console.error('Error al obtener saldo:', error);
      throw error;
    }
  }

  /**
   * Envía un precio al contrato inteligente
   */
  async submitPrice(
    id: string,
    timestamp: number,
    price: number
  ): Promise<{ success: boolean; hash?: string; error?: string; balance?: string }> {
    if (!this.web3 || !this.contract) {
      const initialized = await this.initWeb3();
      if (!initialized) {
        return { success: false, error: 'No se pudo inicializar Web3' };
      }
    }

    if (!this.account) {
      const accounts = await this.getAccounts();
      if (accounts.length === 0) {
        return { success: false, error: 'No hay cuentas disponibles' };
      }
      this.account = accounts[0];
    }

    try {
      // Convertir el precio a centavos para evitar decimales
      const priceInCents = Math.round(price * 100);
      
      // Llamar al método submitPrice del contrato
      const result = await this.contract.methods.submitPrice(id, timestamp, priceInCents)
        .send({ from: this.account });
      
      // Obtener el saldo actualizado
      const balance = await this.getBalance(this.account);
      
      return {
        success: true,
        hash: result.transactionHash,
        balance: balance.formatted
      };
    } catch (error) {
      console.error('Error al enviar precio:', error);
      
      let errorMessage = '';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = 'Error desconocido';
      }
      
      // Intentar obtener el saldo actual aunque falle la transacción
      let balance = undefined;
      try {
        if (this.account) {
          const balanceData = await this.getBalance(this.account);
          balance = balanceData.formatted;
        }
      } catch {}
      
      return {
        success: false,
        error: errorMessage,
        balance
      };
    }
  }

  /**
   * Obtiene el número total de precios almacenados
   */
  async getPriceCount(): Promise<number> {
    if (!this.web3 || !this.contract) {
      const initialized = await this.initWeb3();
      if (!initialized) throw new Error('No se pudo inicializar Web3');
    }

    try {
      const count = await this.contract.methods.getPriceCount().call();
      return parseInt(count);
    } catch (error) {
      console.error('Error al obtener conteo de precios:', error);
      throw error;
    }
  }
}

// Declaración de tipos global para ventana con ethereum
declare global {
  interface Window {
    ethereum: any;
  }
}

// Crear una instancia por defecto
const ethereumService = new EthereumService();
export default ethereumService;