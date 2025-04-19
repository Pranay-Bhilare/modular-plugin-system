# Solidity Modular Plugin System

This project implements a modular, plugin-based extension system for smart contracts. It consists of a Core contract that maintains a registry of plugins, and plugins that implement a common interface.

## Project Structure

- **Core.sol**: Central contract that manages plugin registry and dispatches calls to plugins
- **IPlugin.sol**: Interface that all plugins must implement
- **ExamplePlugin.sol**: Simple plugin that multiplies input by 2
- **VaultPlugin.sol**: Plugin that creates vaults and returns a vault identifier

## Getting Started

### Prerequisites

- Node.js (>= 14.x)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```shell
npm install
```

### Compiling Contracts

To compile the contracts, run:

```shell
npx hardhat compile
```

### Running Tests

The test suite verifies registry management, plugin execution, and vault creation:

```shell
npx hardhat test
```

For detailed gas reporting:

```shell
REPORT_GAS=true npx hardhat test
```

### Local Deployment

To deploy the contracts to a local Hardhat node:

1. Start a local Hardhat node:

```shell
npx hardhat node
```

2. In a separate terminal, deploy the contracts:

```shell
npx hardhat run scripts/deploy.js --network localhost
```

## Contract Details

### Core Contract

The Core contract is the central component that manages the plugin registry and provides dynamic dispatch to plugins:

- `addPlugin(address plugin)`: Adds a new plugin to the registry
- `updatePlugin(uint256 pluginId, address newAddress)`: Updates a plugin at a specific index
- `removePlugin(uint256 pluginId)`: Removes a plugin from the registry
- `executePlugin(uint256 pluginId, uint256 input)`: Executes a plugin's `performAction` function dynamically
- `getPluginsCount()`: Returns the total number of plugins
- `getPluginAddress(uint256 pluginId)`: Returns the address of a plugin at a specific index

### Plugins

All plugins implement the `IPlugin` interface:

```solidity
function performAction(uint256 input) external returns (uint256);
```

- **ExamplePlugin**: Multiplies the input by 2
- **VaultPlugin**: Creates a vault with the provided input as the initial balance, stores vault data on-chain, and returns a unique vault ID

## How to Use

1. Deploy the Core contract
2. Deploy plugin contracts (ExamplePlugin, VaultPlugin, etc.)
3. Add plugin addresses to the Core contract using `addPlugin()`
4. Execute plugins through the Core contract using `executePlugin()`

### Example Usage

```solidity
// Assuming Core and plugins are deployed
// Add plugins to Core
core.addPlugin(examplePluginAddress);
core.addPlugin(vaultPluginAddress);

// Execute ExamplePlugin (doubles the input)
uint256 result = core.executePlugin(0, 5); // Result: 10

// Execute VaultPlugin (creates a vault with initial balance of 100)
uint256 vaultId = core.executePlugin(1, 100); // Returns a unique vault ID
```
