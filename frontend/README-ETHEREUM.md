# Integraciu00f3n con Contrato EVM en CafeIndex

Este documento describe cu00f3mo configurar y utilizar la integraciu00f3n con el contrato inteligente `CafeIndex.sol` desplegado en una red compatible con EVM.

## Prerrequisitos

1. **MetaMask** instalado en el navegador
2. Contrato `CafeIndex.sol` ya desplegado en una red EVM compatible
3. ETH/tokens de prueba en la red donde se encuentra el contrato

## Configuraciu00f3n

1. Copia el archivo `.env.example` a `.env`
2. Actualiza las siguientes variables:
   - `VITE_EVM_RPC_URL`: URL del RPC de la red donde estu00e1 desplegado el contrato
   - `VITE_CONTRACT_ADDRESS`: Direcciu00f3n del contrato `CafeIndex` desplegado

## Cu00f3mo funciona

La aplicaciu00f3n ahora soporta dos modos de conexiu00f3n:

1. **Polkadot**: Conecta con la extensiu00f3n Polkadot.js (comportamiento original)
2. **Ethereum**: Conecta con MetaMask para interactuar con el contrato `CafeIndex`

### Funcionalidades con Ethereum

- **Conectar Wallet**: Se conecta a MetaMask y obtiene las cuentas disponibles
- **Ver Saldo**: Muestra el saldo actual de ETH de la cuenta
- **Enviar Precio de Prueba**: Envu00eda una transacciu00f3n al contrato `CafeIndex` llamando a la funciu00f3n `submitPrice`

## Estructura de Archivos

- `src/services/ethereum.ts`: Contiene la lu00f3gica para interactuar con el contrato EVM
- `src/components/EthereumConnector.tsx`: Componente de UI para conectar con MetaMask
- `src/types/ethereum.d.ts`: Tipos TypeScript para la API de Ethereum

## Detalles del Contrato

El contrato `CafeIndex.sol` implementa las siguientes funciones principales:

```solidity
function submitPrice(string memory id, uint256 timestamp, uint256 price) public;
function getPriceByIndex(uint256 index) public view returns (string memory id, uint256 timestamp, uint256 price, address submitter);
function prices(uint256) public view returns (string memory id, uint256 timestamp, uint256 price, address submitter);
function priceCount() public view returns (uint256);
```

- `submitPrice`: Envu00eda un nuevo precio al contrato
- `getPriceByIndex`: Obtiene un precio especu00edfico por u00edndice
- `priceCount`: Devuelve el nu00famero total de precios registrados

## Considerar para Futuras Actualizaciones

1. **Soporte para Mu00faltiples Redes**: Permitir configurar y cambiar entre diferentes redes EVM
2. **Mu00fas Interacciones con el Contrato**: Implementar mu00e1s funcionalidades del contrato
3. **Modo Historial**: Mostrar historial de precios enviados por la cuenta
4. **Validaciu00f3n de Datos**: Validaciu00f3n adicional antes de enviar datos al contrato