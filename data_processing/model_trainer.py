"""Model training module for Cafu00e9Index AI.

This module handles training and evaluation of machine learning models
for coffee price prediction using historical data.
"""

import logging
import os
import pandas as pd
import numpy as np
import joblib
from typing import Dict, Any, Tuple, List, Optional

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import config
from data_processing.preprocessor import preprocess_data

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def load_processed_data(file_path: str = config.PROCESSED_DATA_PATH) -> Optional[pd.DataFrame]:
    """Load preprocessed coffee price data.
    
    Args:
        file_path: Path to the CSV file with preprocessed data.
        
    Returns:
        Optional[pd.DataFrame]: Preprocessed DataFrame, or None if an error occurs.
    """
    try:
        if not os.path.exists(file_path):
            logger.warning(f"Processed data file not found: {file_path}")
            logger.info("Running preprocessing pipeline to create the data")
            return preprocess_data()
        
        df = pd.read_csv(file_path)
        logger.info(f"Loaded preprocessed data with {len(df)} records")
        return df
    
    except Exception as e:
        logger.error(f"Error loading processed data: {e}")
        return None


def prepare_train_test_data(df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """Prepare training and testing datasets.
    
    Args:
        df: Preprocessed DataFrame with features and target.
        
    Returns:
        Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]: X_train, X_test, y_train, y_test arrays.
    """
    logger.info("Preparing training and testing datasets")
    
    # Define feature columns (exclude non-feature columns)
    non_feature_cols = ['timestamp', 'id', 'date', 'target_price']
    feature_cols = [col for col in df.columns if col not in non_feature_cols]
    
    # Define X (features) and y (target)
    X = df[feature_cols].values
    y = df['target_price'].values
    
    # Split data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=config.TEST_SIZE, random_state=config.RANDOM_STATE
    )
    
    logger.info(f"Data split: {X_train.shape[0]} training samples, {X_test.shape[0]} testing samples")
    logger.info(f"Features: {feature_cols}")
    
    return X_train, X_test, y_train, y_test


def train_models(X_train: np.ndarray, y_train: np.ndarray) -> Dict[str, Any]:
    """Train multiple regression models on the training data.
    
    Args:
        X_train: Training features.
        y_train: Training targets.
        
    Returns:
        Dict[str, Any]: Dictionary of trained models.
    """
    logger.info("Training models")
    
    models = {}
    
    # Train RandomForestRegressor
    logger.info("Training RandomForestRegressor")
    rf_model = RandomForestRegressor(
        n_estimators=100,
        random_state=config.RANDOM_STATE
    )
    rf_model.fit(X_train, y_train)
    models['random_forest'] = rf_model
    
    # Train LinearRegression
    logger.info("Training LinearRegression")
    lr_model = LinearRegression()
    lr_model.fit(X_train, y_train)
    models['linear_regression'] = lr_model
    
    logger.info(f"Trained {len(models)} models")
    return models


def evaluate_models(models: Dict[str, Any], X_test: np.ndarray, y_test: np.ndarray) -> Dict[str, Dict[str, float]]:
    """Evaluate models on the test data.
    
    Args:
        models: Dictionary of trained models.
        X_test: Test features.
        y_test: Test targets.
        
    Returns:
        Dict[str, Dict[str, float]]: Dictionary of model evaluation metrics.
    """
    logger.info("Evaluating models")
    
    evaluation = {}
    
    for name, model in models.items():
        # Make predictions
        y_pred = model.predict(X_test)
        
        # Calculate metrics
        mse = mean_squared_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        evaluation[name] = {
            'mse': mse,
            'r2': r2
        }
        
        logger.info(f"Model {name}: MSE = {mse:.4f}, R² = {r2:.4f}")
    
    return evaluation


def select_best_model(models: Dict[str, Any], evaluations: Dict[str, Dict[str, float]]) -> Tuple[str, Any]:
    """Select the best performing model based on evaluation metrics.
    
    Args:
        models: Dictionary of trained models.
        evaluations: Dictionary of model evaluation metrics.
        
    Returns:
        Tuple[str, Any]: Name and instance of the best model.
    """
    logger.info("Selecting best model")
    
    # Find the model with the highest R² score
    best_model_name = max(evaluations, key=lambda x: evaluations[x]['r2'])
    best_model = models[best_model_name]
    
    logger.info(f"Best model: {best_model_name} with R² = {evaluations[best_model_name]['r2']:.4f}")
    return best_model_name, best_model


def save_model(model: Any, model_name: str, model_path: str = config.MODEL_PATH) -> bool:
    """Save the trained model to disk using joblib.
    
    Args:
        model: Trained model instance.
        model_name: Name of the model.
        model_path: Path to save the model file.
        
    Returns:
        bool: True if the model was saved successfully, False otherwise.
    """
    try:
        # Make sure the directory exists
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        
        # Create a dictionary with model and metadata
        model_data = {
            'model': model,
            'model_name': model_name,
            'timestamp': pd.Timestamp.now().isoformat()
        }
        
        # Save the model
        joblib.dump(model_data, model_path)
        logger.info(f"Model saved to {model_path}")
        return True
    
    except Exception as e:
        logger.error(f"Error saving model: {e}")
        return False


def train_and_save_model() -> Optional[Dict[str, Any]]:
    """Complete model training pipeline.
    
    Returns:
        Optional[Dict[str, Any]]: Dictionary with model information, or None if an error occurs.
    """
    try:
        # Load preprocessed data
        df = load_processed_data()
        if df is None:
            return None
        
        # Prepare training and testing data
        X_train, X_test, y_train, y_test = prepare_train_test_data(df)
        
        # Train models
        models = train_models(X_train, y_train)
        
        # Evaluate models
        evaluations = evaluate_models(models, X_test, y_test)
        
        # Select best model
        best_model_name, best_model = select_best_model(models, evaluations)
        
        # Save the best model
        save_model(best_model, best_model_name)
        
        # Return model information
        return {
            'model_name': best_model_name,
            'model': best_model,
            'evaluation': evaluations[best_model_name],
            'feature_columns': [col for col in df.columns if col not in ['timestamp', 'id', 'date', 'target_price']]
        }
    
    except Exception as e:
        logger.error(f"Error in model training pipeline: {e}")
        return None


if __name__ == "__main__":
    train_and_save_model()