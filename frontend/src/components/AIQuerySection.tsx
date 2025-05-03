import React, { useState, useEffect } from 'react';
import { getPrediction, PredictionRequest, PredictionResponse, PriceData } from '../services/api';
import PriceChart from './PriceChart';

// Componente para la consulta IA
const AIQuerySection: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [predictionData, setPredictionData] = useState<PredictionResponse | null>(null);

  // Manejar el envu00edo de la consulta
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError('Por favor, escribe una pregunta');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const request: PredictionRequest = {
        prompt: query,
        days_ahead: 30,
        explanation_required: true
      };
      
      console.log('Enviando solicitud:', request);
      const response = await getPrediction(request);
      console.log('Respuesta recibida:', response);
      
      // Verificar que la explicaciu00f3n estu00e1 presente
      if (!response.explanation) {
        console.warn('La respuesta no incluye explicaciu00f3n');
      }
      
      setPredictionData(response);
    } catch (err) {
      console.error('Error al obtener predicciu00f3n:', err);
      setError('Error al comunicarse con el servicio de predicciu00f3n. Por favor, intenta mu00e1s tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizar el u00faltimo precio histu00f3rico y la predicciu00f3n mu00e1s reciente para mostrar en las tarjetas
  const getCurrentPrice = (): string => {
    if (!predictionData || !predictionData.historical_prices.length) return 'N/A';
    const lastPrice = predictionData.historical_prices[predictionData.historical_prices.length - 1];
    return `$${lastPrice.price.toFixed(2)}`;
  };

  const getMonthPrediction = (): string => {
    if (!predictionData || !predictionData.predictions.length) return 'N/A';
    const lastPrediction = predictionData.predictions[predictionData.predictions.length - 1];
    return `$${lastPrediction.price.toFixed(2)}`;
  };

  // Visualizar datos de precios como string para el u00e1rea de respuesta
  const formatPriceData = (prices: PriceData[]): string => {
    return prices.map(price => `${price.date}: $${price.price.toFixed(2)}`).join('\n');
  };

  // Debug: imprimir en consola cuando cambian los datos de predicciu00f3n
  useEffect(() => {
    if (predictionData) {
      console.log('Datos de predicciu00f3n actualizados:', predictionData);
      console.log('Explicaciu00f3n:', predictionData.explanation || 'No disponible');
    }
  }, [predictionData]);

  return (
    <div>
      <div className="card mb-8">
        <h2 className="text-xl font-semibold text-cafe-purple-700 mb-4">ud83eudd16 Consulta al Agente IA</h2>
        <form onSubmit={handleSubmit}>
          <textarea 
            className="input-field h-32 mb-4" 
            placeholder="Escribe tu pregunta sobre precios del cafu00e9..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className={`btn-primary ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Consultando...' : 'Preguntar'}
          </button>
        </form>
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        {predictionData && (
          <div className="mt-6 p-4 border border-cafe-purple-200 rounded-lg bg-cafe-purple-50">
            <h3 className="font-semibold mb-2">Respuesta:</h3>
            {predictionData.explanation ? (
              <p className="text-gray-700 whitespace-pre-line">{predictionData.explanation}</p>
            ) : (
              <p className="text-gray-500 italic">No hay explicaciu00f3n disponible</p>
            )}
            
            {predictionData.historical_prices.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-sm text-gray-600">Precios Histu00f3ricos:</h4>
                <pre className="text-xs bg-white p-2 rounded mt-1 overflow-x-auto">
                  {formatPriceData(predictionData.historical_prices)}
                </pre>
              </div>
            )}
            
            {predictionData.predictions.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-sm text-gray-600">Predicciones:</h4>
                <pre className="text-xs bg-white p-2 rounded mt-1 overflow-x-auto">
                  {formatPriceData(predictionData.predictions)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Actualizar los componentes de tarjetas con datos reales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          {/* Ahora usamos el componente PriceChart para mostrar el gru00e1fico */}
          <div className="card h-full">
            <h2 className="text-xl font-semibold text-cafe-purple-700 mb-4">Histu00f3rico de Precios</h2>
            {predictionData ? (
              <PriceChart 
                historicalPrices={predictionData.historical_prices} 
                predictions={predictionData.predictions} 
              />
            ) : (
              <div className="bg-cafe-purple-100 h-64 flex items-center justify-center rounded-lg">
                <p className="text-cafe-purple-600 font-medium">Consulta al agente para ver el gru00e1fico de precios</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Current Price Card */}
          <div className="card">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-700">Precio Actual</h2>
              <span className="text-2xl">ud83dudcb5</span>
            </div>
            <p className="text-3xl font-bold text-cafe-purple-600 mt-2">{getCurrentPrice()} / lb</p>
          </div>

          {/* Monthly Prediction Card */}
          <div className="card">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-700">Predicciu00f3n Mes</h2>
              <span className="text-2xl">ud83dudcc8</span>
            </div>
            <p className="text-3xl font-bold text-cafe-purple-600 mt-2">{getMonthPrediction()} / lb</p>
          </div>

          {/* Active Validators Card */}
          <div className="card">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-700">Validadores Activos</h2>
              <span className="text-2xl">ud83dudd27</span>
            </div>
            <p className="text-3xl font-bold text-cafe-purple-600 mt-2">
              {predictionData ? '297' : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIQuerySection;