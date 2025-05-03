"""Data preprocessing module for Cafu00e9Index AI.

This module handles cleaning, preprocessing, and feature engineering
for coffee price data to prepare it for model training.
"""

import logging
import os
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from typing import Tuple, Optional

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import config

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def load_data(file_path: str = config.RAW_DATA_PATH) -> Optional[pd.DataFrame]:
    """Load coffee price data from CSV file.
    
    Args:
        file_path: Path to the CSV file containing coffee price data.
        
    Returns:
        Optional[pd.DataFrame]: DataFrame with the coffee price data, or None if an error occurs.
    """
    try:
        if not os.path.exists(file_path):
            logger.error(f"Data file not found: {file_path}")
            return None
        
        df = pd.read_csv(file_path)
        
        # Convert timestamp to datetime if it's not already
        if df['timestamp'].dtype != 'datetime64[ns]':
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            
        logger.info(f"Loaded data with {len(df)} records from {file_path}")
        return df
    
    except Exception as e:
        logger.error(f"Error loading data from {file_path}: {e}")
        return None


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """Clean and preprocess the coffee price data.
    
    Args:
        df: DataFrame with raw coffee price data.
        
    Returns:
        pd.DataFrame: Cleaned and preprocessed DataFrame.
    """
    logger.info("Cleaning and preprocessing data")
    
    # Make a copy to avoid modifying the original
    cleaned_df = df.copy()
    
    # Sort by timestamp
    cleaned_df = cleaned_df.sort_values('timestamp')
    
    # Remove duplicates
    cleaned_df = cleaned_df.drop_duplicates(subset=['timestamp'])
    
    # Handle missing values
    if cleaned_df['price'].isna().any():
        logger.warning(f"Found {cleaned_df['price'].isna().sum()} missing price values")
        # Forward fill missing prices (use previous day's price)
        cleaned_df['price'] = cleaned_df['price'].fillna(method='ffill')
        # If there are still missing values (e.g., at the start), backward fill
        cleaned_df['price'] = cleaned_df['price'].fillna(method='bfill')
    
    # Reset index
    cleaned_df = cleaned_df.reset_index(drop=True)
    
    logger.info(f"Data cleaned, resulting in {len(cleaned_df)} records")
    return cleaned_df


def create_features(df: pd.DataFrame, window_size: int = config.FEATURE_WINDOW_SIZE) -> pd.DataFrame:
    """Create features for model training using time series data.
    
    Args:
        df: Cleaned DataFrame with coffee price data.
        window_size: Number of previous days to use for features.
        
    Returns:
        pd.DataFrame: DataFrame with engineered features.
    """
    logger.info(f"Creating features with window size {window_size}")
    
    # Make a copy
    feature_df = df.copy()
    
    # Extract date components
    feature_df['date'] = feature_df['timestamp'].dt.date
    feature_df['day_of_week'] = feature_df['timestamp'].dt.dayofweek
    feature_df['month'] = feature_df['timestamp'].dt.month
    feature_df['year'] = feature_df['timestamp'].dt.year
    
    # Create rolling features
    feature_df['price_rolling_mean_7d'] = feature_df['price'].rolling(window=7, min_periods=1).mean()
    feature_df['price_rolling_std_7d'] = feature_df['price'].rolling(window=7, min_periods=1).std()
    
    # Create lag features
    for lag in range(1, window_size + 1):
        feature_df[f'price_lag_{lag}'] = feature_df['price'].shift(lag)
    
    # Drop rows with NaN values created by lag features
    feature_df = feature_df.dropna()
    
    # Create target variable (next day's price)
    feature_df['target_price'] = feature_df['price'].shift(-1)
    
    # Drop the last row which will have NaN target
    feature_df = feature_df.dropna()
    
    logger.info(f"Created features, resulting in {len(feature_df)} records with {feature_df.shape[1]} columns")
    return feature_df


def normalize_data(df: pd.DataFrame) -> Tuple[pd.DataFrame, StandardScaler]:
    """Normalize numerical features in the DataFrame.
    
    Args:
        df: DataFrame with features to normalize.
        
    Returns:
        Tuple[pd.DataFrame, StandardScaler]: Normalized DataFrame and the fitted scaler.
    """
    logger.info("Normalizing data")
    
    # Make a copy
    normalized_df = df.copy()
    
    # Select numerical columns to normalize (exclude timestamp, date, and target)
    num_cols = normalized_df.select_dtypes(include=['float64', 'int64']).columns
    num_cols = [col for col in num_cols if col not in ['target_price']]
    
    # Initialize scaler
    scaler = StandardScaler()
    
    # Fit and transform
    normalized_df[num_cols] = scaler.fit_transform(normalized_df[num_cols])
    
    logger.info(f"Normalized {len(num_cols)} numerical features")
    return normalized_df, scaler


def preprocess_data() -> Optional[pd.DataFrame]:
    """Complete preprocessing pipeline for coffee price data.
    
    Returns:
        Optional[pd.DataFrame]: Preprocessed DataFrame ready for model training, or None if an error occurs.
    """
    try:
        # Load data
        df = load_data()
        if df is None:
            return None
        
        # Clean data
        cleaned_df = clean_data(df)
        
        # Create features
        feature_df = create_features(cleaned_df)
        
        # Normalize data
        normalized_df, scaler = normalize_data(feature_df)
        
        # Save preprocessed data
        os.makedirs(config.DATA_DIR, exist_ok=True)
        normalized_df.to_csv(config.PROCESSED_DATA_PATH, index=False)
        logger.info(f"Preprocessed data saved to {config.PROCESSED_DATA_PATH}")
        
        return normalized_df
    
    except Exception as e:
        logger.error(f"Error in preprocessing pipeline: {e}")
        return None


if __name__ == "__main__":
    preprocess_data()