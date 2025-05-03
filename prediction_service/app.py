"""FastAPI service for coffee price predictions.

This module provides a REST API endpoint for price predictions using trained models,
optionally enhanced with explanations from DeepSeek AI models.
"""

import os
import logging
import joblib
import pandas as pd
import numpy as np
import requests
import json
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import config
from data_indexing.indexer import fetch_coffee_prices

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Cafu00e9Index AI",
    description="Coffee price prediction API using historical on-chain data",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DeepSeek API
deepseek_api_key = os.environ.get("DEEPSEEK_API_KEY", config.DEEPSEEK_API_KEY)


# Pydantic models for request and response
class PredictionRequest(BaseModel):
    prompt: str
    days_ahead: int = 7
    explanation_required: bool = True


class PredictionResponse(BaseModel):
    historical_prices: List[Dict[str, Any]]
    predictions: List[Dict[str, Any]]
    explanation: Optional[str] = None


def load_model(model_path: str = config.MODEL_PATH) -> Dict[str, Any]:
    """Load the trained model from disk.
    
    Args:
        model_path: Path to the saved model file.
        
    Returns:
        Dict[str, Any]: Dictionary with model and metadata.
    """
    try:
        if not os.path.exists(model_path):
            logger.error(f"Model file not found: {model_path}")
            raise FileNotFoundError(f"Model file not found: {model_path}")
        
        model_data = joblib.load(model_path)
        logger.info(f"Loaded model: {model_data['model_name']}")
        return model_data
    
    except Exception as e:
        logger.error(f"Error loading model: {e}")
        raise e


def get_latest_prices(num_days: int = 30) -> List[Dict[str, Any]]:
    """Get the latest coffee prices from the SubQuery GraphQL endpoint.
    
    Args:
        num_days: Number of days of historical data to retrieve.
        
    Returns:
        List[Dict[str, Any]]: List of recent coffee price records.
    """
    try:
        # Try to fetch prices from GraphQL endpoint
        coffee_prices = fetch_coffee_prices()
        
        if not coffee_prices:
            logger.warning("No coffee prices found from GraphQL, trying local CSV file")
            # Try to load from the local CSV file instead
            csv_path = config.RAW_DATA_PATH
            if os.path.exists(csv_path):
                logger.info(f"Loading coffee prices from local file: {csv_path}")
                df = pd.read_csv(csv_path)
                # Sort by timestamp
                df['timestamp'] = pd.to_datetime(df['timestamp'])
                df = df.sort_values('timestamp', ascending=False).head(num_days)
                df = df.sort_values('timestamp')
                # Convert blockHeight to block if needed
                if 'blockHeight' in df.columns and 'block' not in df.columns:
                    df['block'] = df['blockHeight']
                return df.to_dict('records')
            else:
                # Generate dummy data for demonstration purposes
                logger.warning("Local CSV file not found, using dummy data for demonstration")
                base_price = 3.5
                today = datetime.now()
                dummy_prices = []
                for i in range(num_days, 0, -1):
                    date = today - timedelta(days=i)
                    # Add some random variation to the price
                    price = base_price + (np.random.random() - 0.5) * 0.2
                    base_price = price  # Update for next iteration
                    dummy_prices.append({
                        'timestamp': date.isoformat(),
                        'price': round(price, 2),
                        'block': 10000 + i
                    })
                return dummy_prices
        
        # Process and return only the most recent prices
        prices_df = pd.DataFrame(coffee_prices)
        prices_df['timestamp'] = pd.to_datetime(prices_df['timestamp'])
        prices_df = prices_df.sort_values('timestamp', ascending=False).head(num_days)
        prices_df = prices_df.sort_values('timestamp')
        
        # Convert to list of dictionaries
        latest_prices = prices_df.to_dict('records')
        return latest_prices
    
    except Exception as e:
        logger.error(f"Error getting latest prices: {e}")
        return []


def prepare_prediction_features(historical_prices: List[Dict[str, Any]], feature_window_size: int = config.FEATURE_WINDOW_SIZE) -> Optional[np.ndarray]:
    """Prepare features for prediction using historical price data.
    
    Args:
        historical_prices: List of historical price records.
        feature_window_size: Number of previous days to use for features.
        
    Returns:
        Optional[np.ndarray]: Feature array for prediction, or None if an error occurs.
    """
    try:
        if len(historical_prices) < feature_window_size:
            logger.warning(f"Not enough historical data for prediction. Need at least {feature_window_size} days.")
            return None
        
        # Convert to DataFrame
        df = pd.DataFrame(historical_prices)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        # Make sure we have a block column
        if 'blockHeight' in df.columns and 'block' not in df.columns:
            df['block'] = df['blockHeight']
        
        # Sort by timestamp
        df = df.sort_values('timestamp')
        
        # Extract features (similar to what we did in preprocessing)
        df['day_of_week'] = df['timestamp'].dt.dayofweek
        df['month'] = df['timestamp'].dt.month
        df['year'] = df['timestamp'].dt.year
        
        # Create rolling features
        df['price_rolling_mean_7d'] = df['price'].rolling(window=7, min_periods=1).mean()
        df['price_rolling_std_7d'] = df['price'].rolling(window=7, min_periods=1).std()
        
        # Create lag features
        for lag in range(1, feature_window_size + 1):
            df[f'price_lag_{lag}'] = df['price'].shift(lag)
        
        # Drop rows with NaN values created by lag features
        df = df.dropna()
        
        if len(df) == 0:
            logger.warning("No data left after feature creation and NaN removal")
            return None
            
        # Select the most recent row for prediction
        latest_row = df.iloc[-1:]
        
        # Select only the feature columns
        # Ensure we have the right columns that match the trained model
        expected_features = [
            'blockHeight', 'price', 'day_of_week', 'month', 'year', 
            'price_rolling_mean_7d', 'price_rolling_std_7d', 
            'price_lag_1', 'price_lag_2', 'price_lag_3', 'price_lag_4', 'price_lag_5', 
            'price_lag_6', 'price_lag_7', 'price_lag_8', 'price_lag_9', 'price_lag_10'
        ]
        
        # Use block if blockHeight is missing
        if 'blockHeight' not in latest_row.columns and 'block' in latest_row.columns:
            latest_row['blockHeight'] = latest_row['block']
        
        # Check if all expected features are available
        missing_features = [f for f in expected_features if f not in latest_row.columns]
        if missing_features:
            logger.warning(f"Missing expected features: {missing_features}")
            return None
            
        # Convert to numpy array using only the expected features
        X = latest_row[expected_features].values
        
        logger.info(f"Prepared prediction features with shape {X.shape}")
        return X
    
    except Exception as e:
        logger.error(f"Error preparing prediction features: {e}")
        return None


def predict_prices(model_data: Dict[str, Any], X: np.ndarray, days_ahead: int = 7) -> List[Dict[str, Any]]:
    """Generate price predictions for future days.
    
    Args:
        model_data: Dictionary with model and metadata.
        X: Feature array for the initial prediction.
        days_ahead: Number of days to predict ahead.
        
    Returns:
        List[Dict[str, Any]]: List of price predictions with dates.
    """
    try:
        model = model_data['model']
        predictions = []
        current_features = X.copy()
        
        # Get the latest date from the features
        today = datetime.now().date()
        
        for day in range(1, days_ahead + 1):
            # Make prediction for the next day
            price_pred = model.predict(current_features)[0]
            
            # Calculate the date for this prediction
            pred_date = today + timedelta(days=day)
            
            # Store prediction
            predictions.append({
                'date': pred_date.isoformat(),
                'price': round(float(price_pred), 2)
            })
            
            # Update features for the next prediction (simple approach)
            # In a real implementation, you would update all the features properly
            # Here we're just updating the first feature which we assume is the price
            current_features[0, 0] = price_pred
        
        return predictions
    
    except Exception as e:
        logger.error(f"Error making predictions: {e}")
        return []


def get_explanation_from_deepseek(historical_prices: List[Dict[str, Any]], predictions: List[Dict[str, Any]], prompt: str) -> Optional[str]:
    """Get an explanation for the price prediction from DeepSeek AI.
    
    Args:
        historical_prices: List of historical price records.
        predictions: List of predicted price records.
        prompt: User prompt or question about the predictions.
        
    Returns:
        Optional[str]: Explanation text, or None if an error occurs.
    """
    if not deepseek_api_key:
        logger.warning("DeepSeek API key not set, skipping explanation generation")
        return None
    
    try:
        # Format historical prices
        historical_text = "\nHistorical prices:\n"
        for price in historical_prices[-5:]:  # Last 5 days
            date = pd.to_datetime(price['timestamp']).date().isoformat()
            historical_text += f"{date}: ${price['price']:.2f}\n"
        
        # Format predictions
        prediction_text = "\nPredicted prices:\n"
        for price in predictions:
            prediction_text += f"{price['date']}: ${price['price']:.2f}\n"
        
        # Build the prompt for DeepSeek
        deepseek_prompt = f"""
        Based on the following coffee price data from Cafu00e9Index AI:
        
        {historical_text}
        {prediction_text}
        
        User query: {prompt}
        
        Please provide a brief, insightful explanation about the predicted price trends, 
        possible market factors, and what this might mean for coffee traders and buyers.
        Focus on the key insights rather than just describing the data.
        """
        
        # Call DeepSeek API
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {deepseek_api_key}"
        }
        
        payload = {
            "model": config.DEEPSEEK_MODEL,
            "messages": [
                {"role": "system", "content": "You are a helpful assistant specializing in coffee market analysis."},
                {"role": "user", "content": deepseek_prompt}
            ],
            "max_tokens": 300,
            "temperature": 0.7
        }
        
        response = requests.post(
            config.DEEPSEEK_API_URL,
            headers=headers,
            json=payload
        )
        
        response.raise_for_status()  # Raise an error for bad responses
        response_data = response.json()
        
        # Extract the explanation from the response
        explanation = response_data.get("choices", [])[0].get("message", {}).get("content", "").strip()
        if not explanation:
            logger.warning("Empty response from DeepSeek API")
            return "No explanation available at this time."
            
        return explanation
    
    except requests.RequestException as e:
        logger.error(f"Request error from DeepSeek API: {e}")
        return None
    except Exception as e:
        logger.error(f"Error getting explanation from DeepSeek: {e}")
        return None


# Dependency to get model
def get_prediction_model() -> Dict[str, Any]:
    try:
        return load_model()
    except Exception as e:
        logger.error(f"Could not load model: {e}")
        raise HTTPException(status_code=500, detail="Model not available")


@app.get("/", tags=["Health"])
def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "Cafu00e9Index AI Prediction Service"}


@app.post("/predict", response_model=PredictionResponse, tags=["Prediction"])
def predict(request: PredictionRequest, model_data: Dict[str, Any] = Depends(get_prediction_model)):
    """Generate coffee price predictions and explanations."""
    try:
        # Get historical prices
        historical_prices = get_latest_prices()
        if not historical_prices:
            raise HTTPException(status_code=500, detail="Could not fetch historical price data")
        
        # Prepare features for prediction
        X = prepare_prediction_features(historical_prices)
        if X is None:
            raise HTTPException(status_code=500, detail="Could not prepare prediction features")
        
        # Generate predictions
        predictions = predict_prices(model_data, X, days_ahead=request.days_ahead)
        if not predictions:
            raise HTTPException(status_code=500, detail="Could not generate predictions")
        
        # Get explanation if required
        explanation = None
        if request.explanation_required:
            explanation = get_explanation_from_deepseek(
                historical_prices, predictions, request.prompt
            )
        
        # Format historical prices for response
        formatted_historical = [
            {"date": pd.to_datetime(p["timestamp"]).date().isoformat(), "price": p["price"]}
            for p in historical_prices
        ]
        
        return PredictionResponse(
            historical_prices=formatted_historical,
            predictions=predictions,
            explanation=explanation
        )
    
    except Exception as e:
        logger.error(f"Error in predict endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))