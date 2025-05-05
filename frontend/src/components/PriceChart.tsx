// src/components/PriceChart.tsx

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { PriceData } from "../services/api";

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
);

// Opciones mejoradas: cuadrícula suave, ejes claros, tooltips personalizados
const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top" as const,
      labels: {
        // color de las etiquetas de leyenda
        color: "#9CA3AF",
      },
    },
    title: {
      display: false,
    },
    tooltip: {
      // tooltip oscuro con texto rosa Polkadot
      backgroundColor: "rgba(31,41,55,0.9)",
      titleColor: "#E6007A",
      bodyColor: "#F472B6",
      borderColor: "rgba(255,255,255,0.1)",
      borderWidth: 1,
      titleFont: {
        weight: "bold" as const,
      },
      padding: 8,
      cornerRadius: 4,
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: "Fecha",
        color: "#9CA3AF",
      },
      ticks: {
        color: "#9CA3AF",
      },
      grid: {
        // líneas de cuadrícula horizontales suaves
        drawOnChartArea: false,
        drawTicks: false,
        color: "rgba(156,163,175,0.3)",
        borderDash: [3, 3],
      },
    },
    y: {
      title: {
        display: true,
        text: "Precio ($/lb)",
        color: "#9CA3AF",
      },
      ticks: {
        color: "#9CA3AF",
      },
      grid: {
        // líneas de cuadrícula verticales suaves
        color: "rgba(156,163,175,0.3)",
        borderDash: [3, 3],
      },
    },
  },
  animation: {
    tension: {
      // suaviza el “rebote” de la línea al iniciar
      duration: 1000,
      easing: "easeOutQuart",
      from: 0.5,
      to: 0.1,
    },
  },
};

interface PriceChartProps {
  historicalPrices: PriceData[];
  predictions: PriceData[];
}

const PriceChart: React.FC<PriceChartProps> = ({
  historicalPrices,
  predictions,
}) => {
  // Combinar etiquetas y datos
  const labels = [
    ...historicalPrices.map((p) => p.date),
    ...predictions.map((p) => p.date),
  ];

  const data = {
    labels,
    datasets: [
      {
        label: "Histórico",
        data: [
          ...historicalPrices.map((p) => p.price),
          ...Array(predictions.length).fill(null),
        ],
        borderColor: "rgba(124, 58, 237, 1)", // cafe-purple-600
        backgroundColor: "rgba(124, 58, 237, 0.1)",
        pointBackgroundColor: "rgba(124, 58, 237, 1)",
        pointBorderColor: "#fff",
        pointRadius: 4,
        borderWidth: 2,
        tension: 0.4, // curva más suave
      },
      {
        label: "Predicción",
        data: [
          ...Array(historicalPrices.length).fill(null),
          ...predictions.map((p) => p.price),
        ],
        borderColor: "#E6007A", // polkadot-pink
        backgroundColor: "rgba(230, 0, 122, 0.1)",
        pointBackgroundColor: "#E6007A",
        pointBorderColor: "#fff",
        pointRadius: 4,
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="h-64 w-full">
      {labels.length > 0 ? (
        <Line options={options} data={data} />
      ) : (
        <div className="flex items-center justify-center h-full bg-cafe-purple-100 rounded-lg">
          <p className="text-cafe-purple-600 font-medium">
            No hay datos disponibles para mostrar
          </p>
        </div>
      )}
    </div>
  );
};

export default PriceChart;
