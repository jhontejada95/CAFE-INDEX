#!/usr/bin/env python
"""Script para enviar datos de precios del cafu00e9 a la blockchain Westend de Polkadot.

Este script estu00e1 diseñado para ser ejecutado como un cron job cada 15 minutos,
leyendo los datos de precios mu00e1s recientes y envu00e1ndolos a la blockchain.
"""

import os
import sys
import logging
import argparse
from datetime import datetime
import pandas as pd
from dotenv import load_dotenv

# Asegurar que el directorio raiz del proyecto estu00e1 en el path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Importar mu00f3dulos del proyecto
from price_oracle import PriceOracle
import config

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(config.DATA_DIR, "oracle.log")),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


def load_price_data(source: str = 'file') -> pd.DataFrame:
    """Carga los datos de precios mu00e1s recientes para enviar a la blockchain.
    
    Args:
        source: Fuente de los datos ('file' o 'db').
        
    Returns:
        pd.DataFrame: DataFrame con los datos de precios.
    """
    try:
        if source == 'file':
            # Cargar desde el archivo de predicciones
            file_path = os.path.join(config.DATA_DIR, "predictions.csv")
            if not os.path.exists(file_path):
                # Si no existe el archivo de predicciones, usar datos procesados
                file_path = config.PROCESSED_DATA_PATH
                
            logger.info(f"Cargando datos de precios desde {file_path}")
            df = pd.read_csv(file_path)
            
            # Verificar que existan las columnas necesarias
            required_columns = ['id', 'date', 'price']
            for col in required_columns:
                if col not in df.columns:
                    logger.error(f"Falta la columna {col} en los datos")
                    if col == 'id' and 'blockHeight' in df.columns:
                        df['id'] = df['blockHeight']
                        logger.info("Usando blockHeight como id")
                    elif col == 'date' and 'timestamp' in df.columns:
                        df['date'] = pd.to_datetime(df['timestamp']).dt.date.astype(str)
                        logger.info("Usando timestamp para generar date")
                    else:
                        return pd.DataFrame()
            
            # Si no hay columna timestamp pero hay date, crear timestamp
            if 'timestamp' not in df.columns and 'date' in df.columns:
                df['timestamp'] = pd.to_datetime(df['date']).dt.isoformat()
                
            return df
        elif source == 'db':
            # Implementar carga desde la base de datos si es necesario
            logger.error("Carga desde base de datos no implementada")
            return pd.DataFrame()
        else:
            logger.error(f"Fuente de datos no vu00e1lida: {source}")
            return pd.DataFrame()
    except Exception as e:
        logger.error(f"Error al cargar datos de precios: {e}")
        return pd.DataFrame()


def filter_recent_prices(df: pd.DataFrame, hours: int = 24) -> pd.DataFrame:
    """Filtra los precios mu00e1s recientes dentro de un periodo de tiempo.
    
    Args:
        df: DataFrame con datos de precios.
        hours: Nu00famero de horas para filtrar (por defecto 24).
        
    Returns:
        pd.DataFrame: DataFrame filtrado con precios recientes.
    """
    try:
        # Asegurar que hay una columna de timestamp
        if 'timestamp' not in df.columns:
            logger.error("No se puede filtrar por tiempo, falta la columna 'timestamp'")
            return df
            
        # Convertir timestamp a datetime si no lo es ya
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        # Obtener la fecha y hora actual
        now = datetime.now()
        
        # Filtrar registros de las u00faltimas 'hours' horas
        recent_df = df[df['timestamp'] > now - pd.Timedelta(hours=hours)]
        
        logger.info(f"Filtrados {len(recent_df)} registros de las u00faltimas {hours} horas")
        return recent_df
    except Exception as e:
        logger.error(f"Error al filtrar precios recientes: {e}")
        return df


def run_oracle(data_source: str = 'file', time_filter: int = 24) -> None:
    """Ejecuta el proceso de enviu00f3 de precios a la blockchain.
    
    Args:
        data_source: Fuente de los datos ('file' o 'db').
        time_filter: Filtrar precios de las u00faltimas N horas.
    """
    logger.info("Iniciando proceso de enviu00f3 de precios a la blockchain")
    
    # Cargar datos de precios
    price_data = load_price_data(data_source)
    if price_data.empty:
        logger.error("No se pudieron cargar datos de precios")
        return
        
    # Filtrar precios recientes
    recent_prices = filter_recent_prices(price_data, time_filter) if time_filter > 0 else price_data
    if recent_prices.empty:
        logger.warning("No hay precios recientes para enviar")
        return
        
    # Inicializar el oru00e1culo
    oracle = PriceOracle()
    if not oracle.is_connected:
        logger.error("No se pudo conectar con la blockchain")
        return
        
    # Enviar precios a la blockchain
    logger.info(f"Enviando {len(recent_prices)} precios a la blockchain")
    results = oracle.submit_prices_batch(recent_prices)
    
    # Analizar resultados
    success_count = sum(1 for success in results.values() if success)
    logger.info(f"Resultados: {success_count} transacciones exitosas de {len(results)}")
    
    # Guardar registro de resultados
    results_df = pd.DataFrame([
        {'id': id, 'success': success, 'timestamp': datetime.now().isoformat()}
        for id, success in results.items()
    ])
    results_path = os.path.join(config.DATA_DIR, "oracle_results.csv")
    results_df.to_csv(results_path, mode='a', header=not os.path.exists(results_path), index=False)
    logger.info(f"Resultados guardados en {results_path}")


def main():
    """Funciun principal para ejecutar el script desde la lu00ednea de comandos."""
    # Cargar variables de entorno
    load_dotenv()
    
    # Crear analizador de argumentos
    parser = argparse.ArgumentParser(description='Enviar precios del cafu00e9 a la blockchain Westend')
    parser.add_argument('--source', choices=['file', 'db'], default='file',
                        help='Fuente de datos de precios (archivo o base de datos)')
    parser.add_argument('--hours', type=int, default=24,
                        help='Filtrar precios de las u00faltimas N horas (0 para no filtrar)')
    
    # Analizar argumentos
    args = parser.parse_args()
    
    # Ejecutar el oru00e1culo
    run_oracle(args.source, args.hours)


if __name__ == "__main__":
    main()