// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CafeIndex {
    // Estructura para almacenar los datos de precio
    struct PriceData {
        string id;
        uint256 timestamp;
        uint256 price;  // Precio en centavos para evitar decimales
        address submitter;
    }
    
    // Array para almacenar todos los precios enviados
    PriceData[] public prices;
    
    // Mapping para verificar si un ID ya existe
    mapping(string => bool) public priceExists;
    
    // Evento que se emite cuando se agrega un nuevo precio
    event PriceSubmitted(string id, uint256 timestamp, uint256 price, address submitter);
    
    /**
     * @dev Permite enviar un nuevo dato de precio de café
     * @param id Identificador único para este precio
     * @param timestamp Marca de tiempo en segundos desde epoch
     * @param price Precio en centavos (ej. 375 = $3.75)
     */
    function submitPrice(string memory id, uint256 timestamp, uint256 price) public {
        // Verificar que el ID no exista ya
        require(!priceExists[id], "Este ID de precio ya existe");
        
        // Crear nueva entrada de precio
        PriceData memory newPrice = PriceData({
            id: id,
            timestamp: timestamp,
            price: price,
            submitter: msg.sender
        });
        
        // Guardar en el array y marcar como existente
        prices.push(newPrice);
        priceExists[id] = true;
        
        // Emitir evento
        emit PriceSubmitted(id, timestamp, price, msg.sender);
    }
    
    /**
     * @dev Obtiene el número total de precios almacenados
     * @return Cantidad de precios en el array
     */
    function getPriceCount() public view returns (uint256) {
        return prices.length;
    }
    
    /**
     * @dev Obtiene los detalles de un precio por su índice
     * @param index Posición en el array de precios
     * @return Estructura PriceData completa
     */
    function getPriceByIndex(uint256 index) public view returns (PriceData memory) {
        require(index < prices.length, "Indice fuera de rango");
        return prices[index];
    }
    
    /**
     * @dev Obtiene los últimos N precios enviados
     * @param count Número de precios a obtener
     * @return Array de estructuras PriceData
     */
    function getLatestPrices(uint256 count) public view returns (PriceData[] memory) {
        // Ajustar count si es mayor que la cantidad de precios disponibles
        uint256 resultCount = count;
        if (resultCount > prices.length) {
            resultCount = prices.length;
        }
        
        // Crear array de resultados
        PriceData[] memory result = new PriceData[](resultCount);
        
        // Llenar el array con los últimos precios
        for (uint256 i = 0; i < resultCount; i++) {
            result[i] = prices[prices.length - resultCount + i];
        }
        
        return result;
    }
}