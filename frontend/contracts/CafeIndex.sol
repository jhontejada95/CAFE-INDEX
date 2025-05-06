// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CafeIndex {
    struct PriceData {
        string id;
        uint256 timestamp;
        uint256 price;  // En centavos
        address submitter;
    }

    // Almacenamiento optimizado usando mapping y contador
    mapping(uint256 => PriceData) public prices;
    mapping(bytes32 => bool) public priceExists;
    uint256 public priceCount;

    event PriceSubmitted(string id, uint256 timestamp, uint256 price, address indexed submitter);

    /**
     * @dev Envía un nuevo precio de café
     * @param id Identificador único
     * @param timestamp Marca de tiempo (epoch)
     * @param price Precio en centavos
     */
    function submitPrice(string memory id, uint256 timestamp, uint256 price) public {
        bytes32 idHash = keccak256(abi.encodePacked(id));
        require(!priceExists[idHash], "ID ya existe");

        prices[priceCount] = PriceData({
            id: id,
            timestamp: timestamp,
            price: price,
            submitter: msg.sender
        });

        priceExists[idHash] = true;
        emit PriceSubmitted(id, timestamp, price, msg.sender);
        priceCount++;
    }

    /**
     * @dev Obtiene un precio por índice
     */
    function getPriceByIndex(uint256 index) public view returns (
        string memory id,
        uint256 timestamp,
        uint256 price,
        address submitter
    ) {
        require(index < priceCount, "Index out of range");
        PriceData memory data = prices[index];
        return (data.id, data.timestamp, data.price, data.submitter);
    }
}
