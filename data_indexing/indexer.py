"""Data indexing module for Cafu00e9Index AI.

This module handles the interaction with SubQuery's GraphQL API,
fetching coffee price data and storing it in structured formats.
"""

import subprocess
import logging
import os
import pandas as pd
import requests
import sqlite3
from datetime import datetime
from typing import List, Dict, Any, Optional

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import config

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def start_subquery_node() -> bool:
    """Start the SubQuery node using the CLI.
    
    Returns:
        bool: True if the process started successfully, False otherwise.
    """
    try:
        logger.info("Starting SubQuery node...")
        # Execute SubQuery commands
        subprocess.run(["subql", "codegen"], check=True)
        subprocess.run(["subql", "build"], check=True)
        
        # Start in the background
        process = subprocess.Popen(["subql", "start"])
        
        logger.info("SubQuery node started successfully.")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to start SubQuery node: {e}")
        return False
    except Exception as e:
        logger.error(f"Error starting SubQuery node: {e}")
        return False


def fetch_coffee_prices() -> List[Dict[str, Any]]:
    """Fetch coffee price data from the SubQuery GraphQL endpoint.
    
    Returns:
        List[Dict[str, Any]]: List of coffee price records with timestamp, block, and price fields.
    """
    logger.info(f"Fetching coffee prices from {config.SUBQL_GRAPHQL_ENDPOINT}")
    
    # GraphQL query to fetch coffee prices
    query = """
    query {
        coffeePrices(first: 1000, orderBy: TIMESTAMP_ASC) {
            nodes {
                id
                timestamp
                blockHeight
                price
            }
        }
    }
    """
    
    try:
        response = requests.post(
            config.SUBQL_GRAPHQL_ENDPOINT,
            json={'query': query}
        )
        
        response.raise_for_status()
        data = response.json()
        
        if 'errors' in data:
            logger.error(f"GraphQL errors: {data['errors']}")
            return []
        
        coffee_prices = data.get('data', {}).get('coffeePrices', {}).get('nodes', [])
        logger.info(f"Successfully fetched {len(coffee_prices)} coffee price records")
        return coffee_prices
    
    except requests.RequestException as e:
        logger.error(f"Request error when fetching coffee prices: {e}")
        return []
    except Exception as e:
        logger.error(f"Unexpected error when fetching coffee prices: {e}")
        return []


def save_to_dataframe(coffee_prices: List[Dict[str, Any]]) -> Optional[pd.DataFrame]:
    """Convert coffee price data to a pandas DataFrame and save to CSV.
    
    Args:
        coffee_prices: List of coffee price records with timestamp, block, and price fields.
        
    Returns:
        Optional[pd.DataFrame]: DataFrame with the coffee price data, or None if an error occurs.
    """
    try:
        if not coffee_prices:
            logger.warning("No coffee price data to save")
            return None
        
        # Create DataFrame
        df = pd.DataFrame(coffee_prices)
        
        # Convert timestamp to datetime
        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
        
        # Rename columns to more readable names
        df = df.rename(columns={
            'blockHeight': 'block',
            'price': 'price'
        })
        
        # Make sure the data directory exists
        os.makedirs(config.DATA_DIR, exist_ok=True)
        
        # Save to CSV
        df.to_csv(config.RAW_DATA_PATH, index=False)
        logger.info(f"Coffee price data saved to {config.RAW_DATA_PATH}")
        
        return df
    
    except Exception as e:
        logger.error(f"Error saving coffee price data to DataFrame: {e}")
        return None


def save_to_sqlite(df: pd.DataFrame, db_path: str = f"{config.DATA_DIR}/cafe_index.db") -> bool:
    """Save the coffee price DataFrame to an SQLite database.
    
    Args:
        df: DataFrame with coffee price data.
        db_path: Path to the SQLite database file.
        
    Returns:
        bool: True if the data was saved successfully, False otherwise.
    """
    try:
        # Make sure the data directory exists
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        
        # Connect to SQLite database
        conn = sqlite3.connect(db_path)
        
        # Save DataFrame to database
        df.to_sql('coffee_prices', conn, if_exists='replace', index=False)
        
        conn.close()
        logger.info(f"Coffee price data saved to SQLite database at {db_path}")
        return True
    
    except Exception as e:
        logger.error(f"Error saving coffee price data to SQLite: {e}")
        return False


def main():
    """Main function to run the indexing process."""
    logger.info("Starting coffee price indexing process")
    
    # Start SubQuery node (optional, can be commented out if already running)
    # start_subquery_node()
    
    # Fetch coffee prices from GraphQL endpoint
    coffee_prices = fetch_coffee_prices()
    
    if not coffee_prices:
        logger.error("No coffee price data fetched, exiting")
        return
    
    # Save to DataFrame and CSV
    df = save_to_dataframe(coffee_prices)
    
    if df is not None:
        # Optionally save to SQLite
        save_to_sqlite(df)
    
    logger.info("Coffee price indexing process completed")


if __name__ == "__main__":
    main()