// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import '@openzeppelin/contracts/access/Ownable.sol';
import "./MultiAssetOracleInteraceV1.sol";

/**
 * @title A simple price oracle contract that allows authorized oracles to update the price of assets
 * @author Blockless
 */
contract MultiAssetPriceOracleV1 is Ownable, MultiAssetOracleInterfaceV1 {
    string private _name;
    string private _description;
    uint8 private _decimals;

    // Struct to hold price data for each asset
    struct Price {
        uint256 price;
        uint256 timestamp;
    }

    // Mapping of asset symbol to its current price
    mapping(string => Price) private _prices;

    // Mapping of authorized updater
    mapping(address => bool) private _authorizedUpdater;

    /**
     * @dev MultiAssetPriceOracleV1 constructor
     * @param name_ A sluggified string identifier
     * @param description_ A short string text description
     * @param decimals_ The decimal factor for price value
     */
    constructor(string memory name_, string memory description_, uint8 decimals_) {
        _name = name_;
        _description = description_;
        _decimals = decimals_;
    }

    /**
     * @dev Function to return the name of the oracle
     * @return name
     */
    function name() external view override returns (string memory) {
        return _name;
    }

    /**
     * @dev Function to return the description of the oracle
     * @return description
     */
    function description() external view override returns (string memory) {
        return _description;
    }

    /**
     * @dev Function to return the number of decimals
     * @return decimals
     */
    function decimals() external view override returns (uint8) {
        return _decimals;
    }

    /**
     * @dev Function to authorize a new updater
     * @param updater The address of the updater to authorize
     */
    function authorizeUpdater(address updater) external onlyOwner {
        _authorizedUpdater[updater] = true;
    }

    /**
     * @dev Function to deauthorize an updater
     * @param updater The address of the updater to deauthorize
     */
    function deauthorizeUpdater(address updater) external onlyOwner {
        _authorizedUpdater[updater] = false;
    }

    /**
     * @dev Function to check whether an updater is authorized
     * @param updater The address of the updater to check
     */
    function isUpdaterAuthorized(address updater) external view returns (bool) {
        return _authorizedUpdater[updater];
    }

    /**
     * @dev Function to update the price of an asset
     * @param symbol The symbol of the asset to update the price of
     * @param price The new price of the asset
     * @param timestamp The timestamp of when the price was updated
     * @param signature The digital signature of the data
     */
    function updatePrice(string memory symbol, uint256 price, uint256 timestamp, bytes memory signature) external {
        // Verify that the oracle is authorized to update prices
        require(_authorizedUpdater[msg.sender], 'PriceOracle: unauthorized updater');

        // Verify that the signature is valid
        bytes32 messageHash = keccak256(abi.encodePacked(symbol, price, timestamp));
        require(verify(messageHash, signature), 'PriceOracle: invalid signature');

        // Check that the price and timestamp are valid
        require(price > 0, 'PriceOracle: price must be positive');
        require(timestamp <= block.timestamp, 'PriceOracle: timestamp cannot be in the future');

        // Ensure the timestamp is within the valid range
        uint256 timeWindow = 1 minutes; // or any desired time window
        require(timestamp >= block.timestamp - timeWindow, 'PriceOracle: timestamp outside valid range');

        // Check that the price is different from the previous price within the time window
        Price storage prevPrice = _prices[symbol];
        require(
            prevPrice.timestamp < block.timestamp - timeWindow || prevPrice.price != price,
            'PriceOracle: price already updated within time window'
        );

        // Update the price for the specified asset
        _prices[symbol] = Price(price, timestamp);

        // Emit the new price event
        emit NewAnswer(symbol, price, timestamp, block.timestamp, uint80(block.number));
    }

    /**
     * @dev Function to get the current price of an asset
     * @param symbol The symbol of the asset to get the price of
     * @return answer 
     * @return timestamp 
     * @return answeredAt 
     * @return answeredInRound 
     */
    function latestData(string memory symbol) external view returns (
        uint256 answer,
        uint256 timestamp,
        uint256 answeredAt,
        uint80 answeredInRound
    ) {
        Price storage price = _prices[symbol];
        return (
            price.price,
            price.timestamp,
            block.timestamp,
            uint80(block.number)
        );
    }

    /**
     * @dev Function to verify a signature
     * @param messageHash The hash of the message that was signed
     * @param signature The digital signature of the data
     * @return True if the signature is valid, false otherwise
     */
    function verify(bytes32 messageHash, bytes memory signature) internal view returns (bool) {
        // Verify that the signature is valid
        bytes32 prefixedHash = keccak256(abi.encodePacked('\x19Ethereum Signed Message:\n32', messageHash));
        address signer = recoverSigner(prefixedHash, signature);
        return _authorizedUpdater[signer];
    }

    /**
     * @dev Recovers the address of the signer of a message.
     * @param message The signed message.
     * @param sig The signature of the message.
     * @return The address of the signer.
     */
    function recoverSigner(bytes32 message, bytes memory sig) internal pure returns (address) {
        require(sig.length == 65, 'Signature length must be 65');

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }

        if (v < 27) {
            v += 27;
        }

        require(v == 27 || v == 28, 'Invalid signature version');

        return ecrecover(message, v, r, s);
    }
}
