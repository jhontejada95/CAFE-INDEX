# Guía de Integración - Contrato Solidity para CaféIndex

Este documento explica cómo desplegar e interactuar con el contrato inteligente `CafeIndex.sol` usando Remix y MetaMask.

## Requisitos

- [MetaMask](https://metamask.io/download/) instalado en tu navegador
- Conexión a una red Ethereum (puede ser testnet como Sepolia o Goerli)
- ETH para pruebas (si estás en testnet, puedes obtener ETH gratis en faucets)

## Paso 1: Desplegar el contrato en Remix

1. Abre [Remix IDE](https://remix.ethereum.org/)
2. Crea un nuevo archivo llamado `CafeIndex.sol`
3. Copia y pega el código del contrato desde `frontend/contracts/CafeIndex.sol`
4. Compila el contrato usando el compilador de Solidity 0.8.0 o superior
5. Despliega el contrato:
   - Ve a la pestaña "Deploy & Run Transactions"
   - Selecciona "Injected Provider - MetaMask" como entorno
   - Haz clic en "Deploy"
   - Confirma la transacción en MetaMask
6. Una vez desplegado, copia la dirección del contrato para usarla en el frontend

## Paso 2: Integrar el contrato en el frontend

1. Ejecuta la aplicación con `npm run dev`
2. Abre la aplicación en tu navegador
3. Haz clic en la pestaña "Ethereum" en la sección de conectores
4. Conecta tu wallet MetaMask
5. Pega la dirección del contrato desplegado en el campo correspondiente
6. Haz clic en "Guardar"
7. Ahora puedes usar el botón "Enviar Precio a Ethereum" para enviar datos al contrato

## Estructura del Contrato

El contrato `CafeIndex.sol` es simple pero efectivo:

- Utiliza una estructura `PriceData` para almacenar:
  - `id`: Identificador único para cada registro
  - `timestamp`: Marca de tiempo de la entrada
  - `price`: Precio del café (en centavos para evitar decimales)
  - `submitter`: Dirección que envió los datos

- Funciones principales:
  - `submitPrice(string id, uint256 timestamp, uint256 price)`: Envía un nuevo precio
  - `getPriceCount()`: Obtiene la cantidad total de precios almacenados
  - `getPriceByIndex(uint256 index)`: Obtiene un precio específico por su índice
  - `getLatestPrices(uint256 count)`: Obtiene los últimos N precios

## Interactuar con el Contrato en Remix

Puedes probar las funciones del contrato en Remix después de desplegarlo:

1. En la sección "Deployed Contracts", expande tu contrato
2. Llama a `submitPrice` con:
   - `id`: Un identificador único (ej. "CAFE-TEST-1")
   - `timestamp`: La marca de tiempo actual en segundos (ej. 1685432000)
   - `price`: El precio en centavos (ej. 375 para $3.75)
3. Comprueba que se haya registrado con `getPriceCount()` y `getPriceByIndex(0)`

## Notas Importantes

- Los precios se almacenan en centavos para evitar problemas con decimales en Solidity
- Cada ID debe ser único; intentar usar un ID existente resultará en error
- El contrato guardará el historial completo de precios enviados
- La dirección del remitente se registra automáticamente con cada precio

## Modificaciones Futuras

Posibles mejoras para el contrato:

- Control de acceso: Restringir quién puede enviar precios
- Promedio de precios: Calcular promedios por periodo
- Eventos avanzados: Añadir más eventos para mejor indexación
- Oráculos: Integrar con oráculos para obtener precios automáticamente