import axios from 'axios';

// Obtener la URL de la API desde las variables de entorno, con valor por defecto
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Crear una instancia de axios con la configuración base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interface para la petición de predicción
export interface PredictionRequest {
  prompt: string;
  days_ahead?: number;
  explanation_required?: boolean;
}

// Interface para los datos históricos y predicciones
export interface PriceData {
  date: string;
  price: number;
}

// Interface para la respuesta de predicción
export interface PredictionResponse {
  historical_prices: PriceData[];
  predictions: PriceData[];
  explanation: string | null;
}

// Servicio para obtener las predicciones
export const getPrediction = async (request: PredictionRequest): Promise<PredictionResponse> => {
  try {
    const response = await api.post<PredictionResponse>('/predict', request);
    return response.data;
  } catch (error) {
    console.error('Error al obtener predicción:', error);
    throw error;
  }
};

// Servicio para verificar el estado del backend
export const checkHealth = async (): Promise<{ status: string }> => {
  try {
    const response = await api.get('/');
    return response.data;
  } catch (error) {
    console.error('Error al verificar estado del backend:', error);
    throw error;
  }
};

// Exportamos el cliente API por defecto
export default api;