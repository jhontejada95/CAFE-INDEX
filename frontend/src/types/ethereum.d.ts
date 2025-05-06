// src/types/ethereum.d.ts

interface RequestArguments {
  method: string;
  params?: unknown[] | object;
}

interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: RequestArguments) => Promise<any>;
  on: (eventName: string, handler: (...args: any[]) => void) => void;
  removeListener: (eventName: string, handler: (...args: any[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export {};