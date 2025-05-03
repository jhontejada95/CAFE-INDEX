#!/usr/bin/env python
"""Script para probar el oru00e1culo de precios Westend manualmente.

Este script permite verificar la conexiu00f3n con la testnet Westend y realizar
enviu00edos de prueba de precios del cafu00e9 a la blockchain.
"""

import os
import sys
import logging
import argparse
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv

# Asegurar que el directorio raiz del proyecto estu00e1 en el path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Importar mu00f3dulos del proyecto
from price_oracle import PriceOracle
import config

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def test_connection():
    """Prueba la conexiu00f3n con la blockchain Westend."""
    logger.info("Probando conexiu00f3n con Westend...")
    oracle = PriceOracle()
    if oracle.is_connected:
        logger.info("Conexiu00f3n exitosa con Westend")
        return True
    else:
        logger.error("No se pudo conectar con Westend")
        return False


def create_test_data():
    """Crea un conjunto de datos de prueba para enviar a la blockchain."""
    logger.info("Creando datos de prueba...")
    
    # Crear DataFrame con datos de prueba
    test_data = [
        {
            'id': 'CAFE-TEST-001',
            'timestamp': datetime.now().isoformat(),
            'price': 3.75
        }
    ]
    
    return pd.DataFrame(test_data)


def send_test_price():
    """Envu00eda un precio de prueba a la blockchain Westend."""
    logger.info("Enviando precio de prueba a Westend...")
    
    # Inicializar el oru00e1culo
    oracle = PriceOracle()
    if not oracle.is_connected:
        logger.error("No se pudo conectar con la blockchain")
        return False
    
    # Crear datos de prueba
    test_df = create_test_data()
    if test_df.empty:
        logger.error("No se pudieron crear datos de prueba")
        return False
    
    # Enviar precios de prueba
    row = test_df.iloc[0]
    logger.info(f"Enviando precio de prueba: {row.to_dict()}")
    
    success = oracle.submit_price(
        record_id=row['id'],
        timestamp=row['timestamp'],
        price=row['price']
    )
    
    if success:
        logger.info("Precio de prueba enviado exitosamente")
    else:
        logger.error("Error al enviar precio de prueba")
        
    return success


def main():
    """Funciun principal para ejecutar pruebas desde la lu00ednea de comandos."""
    # Cargar variables de entorno
    load_dotenv()
    
    # Crear analizador de argumentos
    parser = argparse.ArgumentParser(description='Probar el oru00e1culo de precios Westend')
    parser.add_argument('--action', choices=['connect', 'send'], default='connect',
                        help='Acciu00f3n a realizar: probar conexiu00f3n o enviar precio de prueba')
    
    # Analizar argumentos
    args = parser.parse_args()
    
    # Ejecutar acciu00f3n seleccionada
    if args.action == 'connect':
        test_connection()
    elif args.action == 'send':
        send_test_price()


if __name__ == "__main__":
    main()