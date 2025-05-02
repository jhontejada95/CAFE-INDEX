// src/hooks/usePolkadot.ts
import { useEffect, useState } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

export interface UsePolkadot {
  api: ApiPromise | null;
  account: InjectedAccountWithMeta | null;
  error: string | null;
}

export function usePolkadot(): UsePolkadot {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [account, setAccount] = useState<InjectedAccountWithMeta | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      // 1. Detectar la extensión
      if (!(window as any).injectedWeb3) {
        setError('🔌 Polkadot.js Extension no está disponible');
        return;
      }

      // 2. Pedir permisos
      const extensions = await web3Enable('CaféIndex');
      if (extensions.length === 0) {
        setError('❌ Acceso a Polkadot.js Extension denegado');
        return;
      }

      // 3. Obtener cuentas
      const accounts = await web3Accounts();
      if (accounts.length === 0) {
        setError('👤 No hay cuentas en la extensión');
        return;
      }
      setAccount(accounts[0]);

      // 4. Conectar al nodo
      try {
        const provider = new WsProvider('wss://westend-rpc.polkadot.io');
        const _api = await ApiPromise.create({ provider });
        setApi(_api);
      } catch (e: any) {
        setError('⚠️ Error conectando a Westend: ' + e.message);
      }
    }

    init().catch((e) => {
      console.error(e);
      setError('❗ Error inesperado: ' + (e as Error).message);
    });
  }, []);

  return { api, account, error };
}
