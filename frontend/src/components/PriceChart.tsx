import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { PriceData } from '../services/api';

// Registrar los componentes necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Opciones para el gru00e1fico
const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: false,
      text: 'Histu00f3rico y Predicciu00f3n de Precios del Cafu00e9',
    },
  },
  scales: {
    y: {
      beginAtZero: false,
      title: {
        display: true,
        text: 'Precio ($/lb)',
      },
    },
    x: {
      title: {
        display: true,
        text: 'Fecha',
      },
    },
  },
};

interface PriceChartProps {
  historicalPrices: PriceData[];
  predictions: PriceData[];
}

const PriceChart: React.FC<PriceChartProps> = ({ historicalPrices, predictions }) => {
  // Preparar datos para el gru00e1fico
  const data = {
    labels: [...historicalPrices.map(p => p.date), ...predictions.map(p => p.date)],
    datasets: [
      {
        label: 'Histu00f3rico',
        data: [...historicalPrices.map(p => p.price), ...new Array(predictions.length).fill(null)],
        borderColor: 'rgba(124, 58, 237, 1)', // cafe-purple-600
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        pointBackgroundColor: 'rgba(124, 58, 237, 1)',
        pointBorderColor: '#fff',
        pointRadius: 4,
        borderWidth: 2,
        tension: 0.1,
      },
      {
        label: 'Predicciu00f3n',
        data: [...new Array(historicalPrices.length).fill(null), ...predictions.map(p => p.price)],
        borderColor: 'rgba(220, 38, 38, 1)', // red-600
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        pointBackgroundColor: 'rgba(220, 38, 38, 1)',
        pointBorderColor: '#fff',
        pointRadius: 4,
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="h-64 w-full">
      {historicalPrices.length > 0 || predictions.length > 0 ? (
        <Line options={options} data={data} />
      ) : (
        <div className="flex items-center justify-center h-full bg-cafe-purple-100 rounded-lg">
          <p className="text-cafe-purple-600 font-medium">No hay datos disponibles para mostrar</p>
        </div>
      )}
    </div>
  );
};

export default PriceChart;