// Importar ethers de manera más compatible con diferentes entornos
import * as ethers from 'ethers';

// ABI del contrato CafeIndex
const CAFEINDEX_ABI = [
  // Constructor y eventos
  "event PriceSubmitted(string id, uint256 timestamp, uint256 price, address indexed submitter)",
  
  // Funciones
  "function submitPrice(string memory id, uint256 timestamp, uint256 price) public",
  "function getPriceByIndex(uint256 index) public view returns (string memory id, uint256 timestamp, uint256 price, address submitter)",
  "function prices(uint256) public view returns (string memory id, uint256 timestamp, uint256 price, address submitter)",
  "function priceCount() public view returns (uint256)"
];

// La dirección del contrato necesita ser configurada
let CONTRACT_ADDRESS = '';

// Instancia del proveedor y contrato
let provider: ethers.JsonRpcProvider | null = null;
let contract: ethers.Contract | null = null;

/**
 * Inicializa solo el proveedor sin el contrato
 */
export const initEthereumProvider = async (rpcUrl: string): Promise<ethers.JsonRpcProvider> => {
  try {
    console.log(`Inicializando proveedor con ${rpcUrl}...`);
    
    // Crear proveedor
    provider = new ethers.JsonRpcProvider(rpcUrl);
    
    console.log('Proveedor inicializado correctamente');
    return provider;
  } catch (error) {
    console.error('Error al inicializar el proveedor:', error);
    throw error;
  }
};

/**
 * Obtiene el proveedor actual o lo crea si no existe
 */
export const getProvider = async (rpcUrl?: string): Promise<ethers.JsonRpcProvider> => {
  if (provider) return provider;
  if (!rpcUrl) {
    throw new Error('Se requiere URL RPC para inicializar el proveedor');
  }
  return initEthereumProvider(rpcUrl);
};

/**
 * Inicializa la conexión con el contrato EVM
 */
export const initEthereumContract = async (contractAddress: string, rpcUrl: string): Promise<ethers.Contract> => {
  if (contract && CONTRACT_ADDRESS === contractAddress) return contract;
  
  try {
    console.log(`Conectando al contrato ${contractAddress} en ${rpcUrl}...`);
    
    // Obtener o inicializar el proveedor
    const ethProvider = await getProvider(rpcUrl);
    
    // Crear instancia del contrato
    contract = new ethers.Contract(contractAddress, CAFEINDEX_ABI, ethProvider);
    CONTRACT_ADDRESS = contractAddress;
    
    console.log('Conexión al contrato establecida correctamente');
    return contract;
  } catch (error) {
    console.error('Error al conectar con el contrato:', error);
    throw error;
  }
};

/**
 * Envía un precio al contrato
 */
export const submitPrice = async (
  account: string,
  signer: ethers.Signer,
  id: string,
  timestamp: number,
  price: number // precio en centavos
): Promise<{ success: boolean; hash?: string; error?: string; }> => {
  try {
    if (!contract) {
      throw new Error('Contrato no inicializado');
    }
    
    console.log(`Enviando precio: id=${id}, timestamp=${timestamp}, price=${price}`);
    
    // Conectar el contrato con el firmante
    const contractWithSigner = contract.connect(signer);
    
    // Enviar la transacción
    const tx = await contractWithSigner.submitPrice(id, timestamp, price);
    console.log('Transacción enviada:', tx.hash);
    
    // Esperar a que la transacción se confirme
    const receipt = await tx.wait();
    console.log('Transacción confirmada:', receipt);
    
    return {
      success: true,
      hash: tx.hash
    };
  } catch (error) {
    console.error('Error al enviar precio:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
};

/**
 * Obtiene el saldo de una cuenta en ETH
 */
export const getAccountBalance = async (address: string, rpcUrl?: string): Promise<{ formatted: string, raw: bigint }> => {
  try {
    // Si no hay proveedor, intentamos inicializarlo (si se proporciona rpcUrl)
    if (!provider) {
      if (!rpcUrl) {
        console.warn('Proveedor no inicializado y no se proporcionó URL RPC');
        return {
          formatted: '0.0000',
          raw: BigInt(0)
        };
      }
      try {
        await initEthereumProvider(rpcUrl);
      } catch (initError) {
        console.error('Error al inicializar el proveedor:', initError);
        return {
          formatted: '0.0000',
          raw: BigInt(0)
        };
      }
    }
    
    // Verificar nuevamente si tenemos proveedor
    if (!provider) {
      console.warn('No se pudo inicializar el proveedor');
      return {
        formatted: '0.0000',
        raw: BigInt(0)
      };
    }
    
    const balance = await provider.getBalance(address);
    const balanceFormatted = ethers.formatEther(balance);
    
    return {
      formatted: parseFloat(balanceFormatted).toFixed(4),
      raw: balance
    };
  } catch (error) {
    console.error('Error al obtener el saldo:', error);
    return {
      formatted: '0.0000',
      raw: BigInt(0)
    };
  }
};

/**
 * Obtiene un precio específico del contrato por índice
 */
export const getPriceByIndex = async (index: number): Promise<{ id: string, timestamp: bigint, price: bigint, submitter: string }> => {
  if (!contract) {
    throw new Error('Contrato no inicializado');
  }
  
  const result = await contract.getPriceByIndex(index);
  return {
    id: result[0],
    timestamp: result[1],
    price: result[2],
    submitter: result[3]
  };
};

/**
 * Obtiene el número total de precios en el contrato
 */
export const getPriceCount = async (): Promise<number> => {
  if (!contract) {
    throw new Error('Contrato no inicializado');
  }
  
  const count = await contract.priceCount();
  return Number(count);
};

export default {
  initEthereumProvider,
  getProvider,
  initEthereumContract,
  submitPrice,
  getAccountBalance,
  getPriceByIndex,
  getPriceCount
};