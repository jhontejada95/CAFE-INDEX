// src/api/predict.ts
export async function fetchPrediction(lastPrices: number[]): Promise<number> {
    const res = await fetch('http://127.0.0.1:5000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lastPrices, timestamp: new Date().toISOString() })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || res.statusText);
    }
    const { prediction } = await res.json();
    return prediction;
  }
  