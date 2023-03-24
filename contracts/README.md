Blockless Data Contracts
===

This is a Hardhat project containing all contracts used for Blockless Data.

## Getting Started

### Prerequisites

To use this project, you need to have the following software installed:

- Node.js
- Hardhat

### Installation

Clone the repository:

```sh
git clone https://github.com/blocklessnetwork/data-sdk.git
```

Navigate to the project directory:

```sh
cd data-sdk/contracts
```

Install the project dependencies:

```sh
yarn install
```

### Usage

Compile the contracts:

```sh
npx hardhat compile
```

Run the tests:

```sh
npx hardhat test
```

Deploy the contracts:

```sh
npx hardhat run scripts/deploy.ts --network <network-name>
```

Replace <network-name> with the name of the network you want to deploy to, such as rinkeby or mainnet.

## Contracts

### MultiAssetPriceOracleV1

The MultiAssetPriceOracleV1 contract implements a multi-asset price oracle that can return the price of multiple assets. The contract uses the OracleInterfaceV1 contract to get the price of each asset.

### OracleInterfaceV1

The OracleInterfaceV1 contract is an interface contract that defines the functions that a price oracle must implement to be used by the MultiAssetPriceOracleV1 contract.
Testing

The project includes a suite of tests for the contracts. You can run the tests with the following command:

```sh
npx hardhat test
```

## Deployment

To deploy the contracts, you can use the provided deploy.js script. Before deploying, make sure to set the required environment variables for the network you want to deploy to.

```sh
npx hardhat run scripts/deploy.ts --network <network-name>
```

Replace <network-name> with the name of the network you want to deploy to, such as rinkeby or mainnet.
Contributing

If you want to contribute to this project, please read the CONTRIBUTING.md file for guidelines.
License

This project is licensed under the MIT License.