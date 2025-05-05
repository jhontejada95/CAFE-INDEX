"""Mu00f3dulo para enviar precios del cafu00e9 a la blockchain Westend de Polkadot.

Este mu00f3dulo proporciona funcionalidades para conectar con la testnet Westend
y enviar transacciones de precios como un oru00e1culo descentralizado.
"""

import os
import logging
import time
from datetime import datetime
import pandas as pd
from dotenv import load_dotenv
from substrateinterface import SubstrateInterface
from substrateinterface.keypair import Keypair
from substrateinterface.exceptions import SubstrateRequestException

# Configurar logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Cargar variables de entorno
load_dotenv()

# Obtener las variables de entorno
WESTEND_WS_URL = os.getenv('WESTEND_WS_URL', 'wss://westend-rpc.polkadot.io')
SIGNER_SEED = os.getenv('SIGNER_SEED')


class PriceOracle:
    """Oru00e1culo de precios para enviar datos a la blockchain Westend de Polkadot."""

    def __init__(self):
        """Inicializa la conexiu00f3n con la blockchain y configura la cuenta firmante."""
        self.substrate = None
        self.signer = None
        self.is_connected = False
        self.connect()

    def connect(self) -> bool:
        """Establece conexiu00f3n con la blockchain Westend y configura la cuenta firmante.
        
        Returns:
            bool: True si la conexiu00f3n fue exitosa, False en caso contrario.
        """
        try:
            logger.info(f"Conectando a Westend en {WESTEND_WS_URL}")
            self.substrate = SubstrateInterface(
                url=WESTEND_WS_URL,
                ss58_format=42,  # Formato de direcciu00f3n para Westend
                type_registry_preset='westend'
            )
            
            # Verificar si tenemos la semilla para el firmante
            if not SIGNER_SEED:
                logger.error("No se ha proporcionado SIGNER_SEED en .env")
                return False
            
            # Configurar la cuenta firmante
            self.signer = Keypair.create_from_mnemonic(SIGNER_SEED)
            logger.info(f"Cuenta firmante configurada: {self.signer.ss58_address}")
            
            # Verificar saldo de la cuenta
            account_info = self.substrate.query(
                'System', 'Account', [self.signer.ss58_address]
            )
            balance = account_info.value['data']['free']
            logger.info(f"Saldo disponible: {balance / 10**10} WND")
            
            if balance == 0:
                logger.warning("La cuenta no tiene saldo para enviar transacciones")
                
            self.is_connected = True
            return True
            
        except Exception as e:
            logger.error(f"Error al conectar con Westend: {e}")
            self.is_connected = False
            return False

    def submit_price(self, record_id: str, timestamp: str, price: float) -> bool:
        """Envu00eda un precio a la blockchain Westend.
        
        Args:
            record_id: Identificador del registro de precio.
            timestamp: Marca de tiempo en formato ISO.
            price: Precio del cafu00e9 en USD.
            
        Returns:
            bool: True si la transacciu00f3n fue exitosa, False en caso contrario.
        """
        if not self.is_connected or not self.substrate or not self.signer:
            logger.error("No hay conexiu00f3n con la blockchain")
            return False
        
        try:
            # Convertir timestamp a milisegundos
            timestamp_ms = int(datetime.fromisoformat(timestamp.replace('Z', '+00:00')).timestamp() * 1000)
            
            # Convertir precio a un entero (multiplicando por 100 y redondeando)
            price_uint = int(round(price * 100))
            
            logger.info(f"Enviando precio a Westend - ID: {record_id}, Timestamp: {timestamp_ms}, Precio: {price_uint}")
            
            # Crear la llamada
            call = self.substrate.compose_call(
                call_module='PriceFeed',
                call_function='submitPrice',
                call_params={
                    'id': record_id,
                    'timestamp': timestamp_ms,
                    'price': price_uint
                }
            )
            
            # Crear la extru00ednseca
            extrinsic = self.substrate.create_signed_extrinsic(
                call=call, keypair=self.signer
            )
            
            # Enviar la extru00ednseca y esperar el resultado
            receipt = self.substrate.submit_extrinsic(extrinsic, wait_for_inclusion=True)
            logger.info(f"Transacciu00f3n incluida en el bloque {receipt.block_hash}")
            
            # Esperar confirmaciu00f3n
            if receipt.is_success:
                logger.info(f"Transacciu00f3n exitosa para el precio {price} USD (ID: {record_id})")
                return True
            else:
                logger.error(f"Error en la transacciu00f3n: {receipt.error_message}")
                return False
                
        except SubstrateRequestException as e:
            logger.error(f"Error en la solicitud a Substrate: {e}")
            return False
        except Exception as e:
            logger.error(f"Error inesperado al enviar precio: {e}")
            return False

    def submit_prices_batch(self, price_records: pd.DataFrame) -> dict:
        """Envu00eda un lote de precios a la blockchain.
        
        Args:
            price_records: DataFrame con columnas 'id', 'timestamp', 'price'.
            
        Returns:
            dict: Resultados de las transacciones {id: u00e9xito}.
        """
        results = {}
        
        if not self.is_connected:
            logger.error("No hay conexiu00f3n con la blockchain")
            return results
            
        for _, row in price_records.iterrows():
            record_id = str(row.get('id', ''))
            timestamp = row.get('timestamp')
            price = float(row.get('price', 0))
            
            # Validar datos
            if not record_id or not timestamp or price <= 0:
                logger.warning(f"Datos invu00e1lidos: {row}")
                results[record_id] = False
                continue
                
            # Enviar precio
            success = self.submit_price(record_id, timestamp, price)
            results[record_id] = success
            
            # Esperar un poco entre transacciones para evitar congestionar la red
            time.sleep(2)
            
        return results