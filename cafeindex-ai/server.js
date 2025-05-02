// server.js
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { predictNext } from './predict.js';

// DEBUG: ver que el archivo se carga
console.log('🔧 server.js cargado');

const app = express();
app.use(cors());

const DATA_FILE = 'coffee-data.json';

app.get('/api/prices', (req, res) => {
  console.log('📡 GET /api/prices');
  try {
    const lines = fs.readFileSync(DATA_FILE, 'utf-8')
      .trim().split('\n')
      .map(l => JSON.parse(l));
    const last10 = lines.slice(-10).map(r => ({
      block: r.block,
      price: r.price.toFixed(2)
    }));
    return res.json(last10);
  } catch (e) {
    console.error('Error al leer prices:', e);
    return res.status(500).json({ error: e.message });
  }
});

app.get('/api/predict', (req, res) => {
  console.log('📡 GET /api/predict');
  try {
    const lines = fs.readFileSync(DATA_FILE, 'utf-8')
      .trim().split('\n')
      .map(l => JSON.parse(l));
    const prices = lines.slice(-30).map(r => r.price);
    const preds = predictNext(prices, 3).map(p => p.toFixed(2));
    return res.json(preds);
  } catch (e) {
    console.error('Error al generar predict:', e);
    return res.status(500).json({ error: e.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`✅ API corriendo en http://localhost:${PORT}`);
});
