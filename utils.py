"""Utility functions for Cafu00e9Index AI project.

This module provides various helper functions used across the project.
"""

import logging
import os
import json
from datetime import datetime
from typing import Dict, Any, List, Optional

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def setup_directories(dirs: List[str]) -> None:
    """Create necessary directories if they don't exist.
    
    Args:
        dirs: List of directory paths to create.
    """
    for dir_path in dirs:
        os.makedirs(dir_path, exist_ok=True)
        logger.info(f"Created directory: {dir_path}")


def save_json(data: Any, file_path: str) -> bool:
    """Save data to a JSON file.
    
    Args:
        data: Data to save.
        file_path: Path to save the JSON file.
        
    Returns:
        bool: True if the data was saved successfully, False otherwise.
    """
    try:
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=2, default=str)
        
        logger.info(f"Data saved to {file_path}")
        return True
    
    except Exception as e:
        logger.error(f"Error saving data to {file_path}: {e}")
        return False


def load_json(file_path: str) -> Optional[Any]:
    """Load data from a JSON file.
    
    Args:
        file_path: Path to the JSON file.
        
    Returns:
        Optional[Any]: Loaded data, or None if an error occurs.
    """
    try:
        if not os.path.exists(file_path):
            logger.error(f"File not found: {file_path}")
            return None
        
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        logger.info(f"Data loaded from {file_path}")
        return data
    
    except Exception as e:
        logger.error(f"Error loading data from {file_path}: {e}")
        return None


def format_timestamp(timestamp) -> str:
    """Format a timestamp as an ISO string.
    
    Args:
        timestamp: Timestamp to format.
        
    Returns:
        str: Formatted timestamp.
    """
    if isinstance(timestamp, (int, float)):
        # Convert Unix timestamp to datetime
        dt = datetime.fromtimestamp(timestamp / 1000 if timestamp > 1e10 else timestamp)
        return dt.isoformat()
    elif isinstance(timestamp, str):
        try:
            # Try to parse as ISO format
            dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            return dt.isoformat()
        except ValueError:
            return timestamp
    elif isinstance(timestamp, datetime):
        return timestamp.isoformat()
    else:
        return str(timestamp)