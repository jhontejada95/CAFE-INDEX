"""Main script for Cafu00e9Index AI.

This script orchestrates the entire pipeline of indexing, processing, modeling,
serving predictions for coffee prices, and optionally publishing prices to the blockchain.
"""

import os
import logging
import argparse
from typing import Dict, Any
from dotenv import load_dotenv

from data_indexing.indexer import main as run_indexing
from data_processing.preprocessor import preprocess_data
from data_processing.model_trainer import train_and_save_model
import utils
import config

# Importar el oru00e1culo de precios cuando se requiera
price_oracle_module = None

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def setup_environment() -> None:
    """Set up the environment for the project."""
    # Cargar variables de entorno
    load_dotenv()
    
    # Create necessary directories
    utils.setup_directories([config.DATA_DIR])
    
    # Check for DeepSeek API key
    if not os.environ.get("DEEPSEEK_API_KEY") and not config.DEEPSEEK_API_KEY:
        logger.warning("DeepSeek API key not set. Explanations will not be available.")


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


def run_oracle_operations(action: str, hours: int = 24) -> None:
    """Ejecuta operaciones relacionadas con el oraculo de precios.
    
    Args:
        action: Acciun a realizar ('test-connection', 'test-send', 'submit').
        hours: Para 'submit', cuantas horas atras considerar para los precios.
    """
    global price_oracle_module
    
    # Importar el mudulo de oraculo solo cuando sea necesario
    if price_oracle_module is None:
        try:
            import price_oracle.test_oracle as test_oracle
            import price_oracle.run_oracle as run_oracle
            price_oracle_module = {
                'test': test_oracle,
                'run': run_oracle
            }
        except ImportError as e:
            logger.error(f"Error importing price oracle module: {e}")
            logger.error("Make sure substrate-interface is installed: pip install substrate-interface")
            return
    
    # Ejecutar la acciun solicitada
    try:
        if action == 'test-connection':
            logger.info("Testing connection to Westend blockchain...")
            price_oracle_module['test'].test_connection()
        elif action == 'test-send':
            logger.info("Sending test price to Westend blockchain...")
            price_oracle_module['test'].send_test_price()
        elif action == 'submit':
            logger.info(f"Submitting prices from the last {hours} hours to Westend...")
            price_oracle_module['run'].run_oracle('file', hours)
        else:
            logger.error(f"Unknown oracle action: {action}")
    except Exception as e:
        logger.error(f"Error in oracle operation: {e}")


def main():
    """Main function to run the Cafu00e9Index AI pipeline."""
    parser = argparse.ArgumentParser(description="Cafu00e9Index AI: Coffee price indexing, prediction, and on-chain oracle")
    
    # Crear grupos de argumentos
    pipeline_group = parser.add_argument_group('Pipeline arguments')
    oracle_group = parser.add_argument_group('Oracle arguments')
    
    # Argumentos para pipeline
    pipeline_group.add_argument("--skip-index", action="store_true", help="Skip the indexing step")
    pipeline_group.add_argument("--skip-process", action="store_true", help="Skip the processing step")
    pipeline_group.add_argument("--skip-train", action="store_true", help="Skip the model training step")
    
    # Argumentos para oraculo
    oracle_group.add_argument("--oracle", choices=['test-connection', 'test-send', 'submit'], 
                           help="Run oracle operations instead of the pipeline")
    oracle_group.add_argument("--hours", type=int, default=24,
                           help="For 'submit' action, consider prices from the last N hours")
    
    args = parser.parse_args()
    
    # Ejecutar operaciones de oraculo si se solicitaron
    if args.oracle:
        logger.info(f"Running oracle operation: {args.oracle}")
        run_oracle_operations(args.oracle, args.hours)
        return
    
    # De lo contrario, ejecutar el pipeline
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