// predict.js
import fs from 'fs';

function linearRegression(xs, ys) {
  const n = xs.length;
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((a, b, i) => a + b * ys[i], 0);
  const sumX2 = xs.reduce((a, b) => a + b * b, 0);

  const a = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const b = (sumY - a * sumX) / n;
  return { a, b };
}

export function predictNext(prices, count = 3) {
  const n = prices.length;
  const xs = Array.from({ length: n }, (_, i) => i);
  const ys = prices;
  const { a, b } = linearRegression(xs, ys);

  const preds = [];
  for (let i = 1; i <= count; i++) {
    const x = n - 1 + i;
    preds.push(a * x + b);
  }
  return preds;
}
