// src/components/CoffeeDashboard.tsx
import React, { useEffect, useState } from 'react';
import {
  LineChart, Line,
  XAxis, YAxis, Tooltip,
  CartesianGrid
} from 'recharts';
import { usePolkadot } from '../hooks/usePolkadot';
import { web3FromAddress } from '@polkadot/extension-dapp';
import { stringToHex } from '@polkadot/util';
import type { SubmittableResult } from '@polkadot/api';

interface PriceRecord { block: string; price: string; }

export function CoffeeDashboard() {
  const { api, account, error } = usePolkadot();

  const [prices, setPrices] = useState<PriceRecord[]>([]);
  const [predictions, setPredictions] = useState<string[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(true);
  const [loadingPredictions, setLoadingPredictions] = useState(true);

  useEffect(() => {
    setLoadingPrices(true);
    fetch('http://localhost:4000/api/prices')
      .then(r => r.json())
      .then((data: PriceRecord[]) => setPrices(data))
      .catch(console.error)
      .finally(() => setLoadingPrices(false));

    setLoadingPredictions(true);
    fetch('http://localhost:4000/api/predict')
      .then(r => r.json())
      .then((data: string[]) => setPredictions(data))
      .catch(console.error)
      .finally(() => setLoadingPredictions(false));
  }, []);

  const registerPrice = async () => {
    if (!api || !account) return;
    const latest = prices[prices.length - 1]?.price;
    if (!latest) return;

    const injector = await web3FromAddress(account.address);
    const remark = stringToHex(`Price:${latest}`);
    const tx = api.tx.system.remark(remark);

    await tx.signAndSend(
      account.address,
      { signer: injector.signer },
      (result: SubmittableResult) => {
        if (result.dispatchError) {
          alert('Error: ' + result.dispatchError.toString());
        } else if (result.status.isInBlock) {
          alert(`✅ Registrado en bloque ${result.status.asInBlock}`);
        }
      }
    );
  };

  const chartData = [
    ...prices.map(p => ({ block: p.block, price: parseFloat(p.price) })),
    ...predictions.map((p, i) => ({ block: `+${i+1}`, price: parseFloat(p) }))
  ];

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>Dashboard de Precios de Café</h1>

      {error && (
        <div style={{ color: 'red', marginBottom: 12 }}>
          {error}
        </div>
      )}

      {loadingPrices ? (
        <p>Cargando precios… ☕</p>
      ) : (
        <>
          <h2>Últimos {prices.length} precios</h2>
          <ul>
            {prices.map(p => (
              <li key={p.block}>Bloque #{p.block}: ${p.price}</li>
            ))}
          </ul>
        </>
      )}

      {loadingPredictions ? (
        <p>Cargando gráfica… 📈</p>
      ) : (
        <LineChart width={700} height={300} data={chartData}>
          <CartesianGrid stroke="#eee" />
          <XAxis dataKey="block" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="price" dot />
        </LineChart>
      )}

      {/* Solo mostrar el botón si no hay error y la API está lista */}
      {!error && api && account && (
        <button
          onClick={registerPrice}
          style={{
            marginTop: 20,
            padding: '0.5rem 1rem',
            background: '#32499D',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer'
          }}
        >
          Register Price On-Chain
        </button>
      )}

      <footer style={{ textAlign: 'center', marginTop: 40, color: '#666' }}>
        <small>
          MVP: CaféIndex • Polkadot • React • Recharts • Node.js
        </small>
      </footer>
    </div>
  );
}
