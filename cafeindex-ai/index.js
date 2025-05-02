import { ApiPromise, WsProvider } from '@polkadot/api';
import fs from 'fs';

async function main() {
  // 1. Conectar a Westend
  const provider = new WsProvider('wss://westend-rpc.polkadot.io');
  const api = await ApiPromise.create({ provider });
  console.log('✅ Conectado a Westend');

  // 2. Suscribirnos a nuevos bloques
  api.rpc.chain.subscribeNewHeads(async (header) => {
    const blockNumber = header.number.toString();
    console.log(`🔖 Nuevo bloque #${blockNumber}`);

    // 3. Simular precio de café entre $3 y $5
    const price = (Math.random() * (5 - 3) + 3).toFixed(2);
    console.log(`☕ Precio simulado del café: $${price}`);

    // 4. Guardar registro en coffee-data.json
    const record = {
      timestamp: new Date().toISOString(),
      block: blockNumber,
      price: Number(price)
    };
    fs.appendFileSync('coffee-data.json', JSON.stringify(record) + '\n');
  });
}

main().catch(console.error);
