"""Main script for Cafu00e9Index AI.

This script orchestrates the entire pipeline of indexing, processing, modeling,
and serving predictions for coffee prices.
"""

import os
import logging
import argparse
from typing import Dict, Any

from data_indexing.indexer import main as run_indexing
from data_processing.preprocessor import preprocess_data
from data_processing.model_trainer import train_and_save_model
import utils
import config

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def setup_environment() -> None:
    """Set up the environment for the project."""
    # Create necessary directories
    utils.setup_directories([config.DATA_DIR])
    
    # Check for OpenAI API key
    if not os.environ.get("OPENAI_API_KEY") and not config.OPENAI_API_KEY:
        logger.warning("OpenAI API key not set. Explanations will not be available.")


def run_pipeline(index: bool = True, process: bool = True, train: bool = True) -> Dict[str, Any]:
    """Run the complete data pipeline.
    
    Args:
        index: Whether to run the indexing step.
        process: Whether to run the processing step.
        train: Whether to run the model training step.
        
    Returns:
        Dict[str, Any]: Status of each pipeline step.
    """
    status = {}
    
    # Setup environment
    setup_environment()
    
    # Run indexing
    if index:
        logger.info("Starting indexing step")
        try:
            run_indexing()
            status['indexing'] = "success"
        except Exception as e:
            logger.error(f"Error in indexing step: {e}")
            status['indexing'] = f"failed: {str(e)}"
    
    # Run processing
    if process:
        logger.info("Starting processing step")
        try:
            processed_data = preprocess_data()
            if processed_data is not None:
                status['processing'] = "success"
            else:
                status['processing'] = "failed: no data processed"
        except Exception as e:
            logger.error(f"Error in processing step: {e}")
            status['processing'] = f"failed: {str(e)}"
    
    # Run model training
    if train:
        logger.info("Starting model training step")
        try:
            model_info = train_and_save_model()
            if model_info is not None:
                status['training'] = "success"
            else:
                status['training'] = "failed: no model trained"
        except Exception as e:
            logger.error(f"Error in model training step: {e}")
            status['training'] = f"failed: {str(e)}"
    
    return status


def main():
    """Main function to run the Cafu00e9Index AI pipeline."""
    parser = argparse.ArgumentParser(description="Cafu00e9Index AI: Coffee price indexing and prediction")
    parser.add_argument("--skip-index", action="store_true", help="Skip the indexing step")
    parser.add_argument("--skip-process", action="store_true", help="Skip the processing step")
    parser.add_argument("--skip-train", action="store_true", help="Skip the model training step")
    
    args = parser.parse_args()
    
    logger.info("Starting Cafu00e9Index AI pipeline")
    status = run_pipeline(
        index=not args.skip_index,
        process=not args.skip_process,
        train=not args.skip_train
    )
    
    logger.info("Pipeline execution completed")
    for step, result in status.items():
        logger.info(f"{step.capitalize()}: {result}")
    
    # Save pipeline status
    utils.save_json(status, f"{config.DATA_DIR}/pipeline_status.json")


if __name__ == "__main__":
    main()