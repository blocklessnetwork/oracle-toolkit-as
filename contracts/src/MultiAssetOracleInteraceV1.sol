// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title Generic oracle interface inherited by multi asset data oracle
 * @author Blockless
 * @notice 
 */
interface MultiAssetOracleInterfaceV1 {
    function name() external view returns (string memory);

    function description() external view returns (string memory);

    function decimals() external view returns (uint8);

    function latestData(string memory symbol) external view returns (
        uint256 answer,
        uint256 timestamp,
        uint256 answeredAt,
        uint80 answeredInRound
    );

    event NewAnswer(
        string indexed symbol,
        uint256 answer,
        uint256 timestamp,
        uint256 answeredAt,
        uint80 answeredInRound
    );
}
