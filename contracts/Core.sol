// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IPlugin.sol";

/// Core Contract for Plugin-based System
contract Core is Ownable(msg.sender) {
    ///Stores the list of registered plugin addresses
    address[] public plugins;

    ///  Emitted when a new plugin is added
    event PluginAdded(uint256 indexed pluginId, address indexed pluginAddress);

    ///  Emitted when a plugin is updated
    event PluginUpdated(uint256 indexed pluginId, address indexed newAddress);

    ///Emitted when a plugin is removed
    event PluginRemoved(uint256 indexed pluginId);

    ///Emitted when a plugin is executed
    event PluginExecuted(uint256 indexed pluginId, uint256 input, uint256 result);

    ///  Add a new plugin to the registry
    /// @param plugin Address of the plugin contract
    function addPlugin(address plugin) external onlyOwner returns(uint256) {
        require(plugin != address(0), "Invalid plugin address");
        plugins.push(plugin);
        emit PluginAdded(plugins.length - 1, plugin);
        return plugins.length - 1;
    }

    /// @notice Update a plugin at a specific index
    /// @param pluginId Index of the plugin in the registry
    /// @param newAddress New plugin contract address
    function updatePlugin(uint256 pluginId, address newAddress) external onlyOwner {
        require(pluginId < plugins.length, "Invalid plugin ID");
        require(newAddress != address(0), "Invalid new address");
        plugins[pluginId] = newAddress;
        emit PluginUpdated(pluginId, newAddress);
    }

    /// @notice Remove a plugin from the registry (by setting to address(0))
    /// @param pluginId Index of the plugin in the registry
    function removePlugin(uint256 pluginId) external onlyOwner {
        require(pluginId < plugins.length, "Invalid plugin ID");
        plugins[pluginId] = address(0);
        emit PluginRemoved(pluginId);
    }

    /// @notice Executes a plugin's performAction function dynamically
    /// @param pluginId ID/index of the plugin in the registry
    /// @param input The input to be passed to the plugin
    /// @return result The output returned by the plugin
    function executePlugin(uint256 pluginId, uint256 input) external returns (uint256 result) {
        require(pluginId < plugins.length, "Plugin does not exist");
        address pluginAddress = plugins[pluginId];
        require(pluginAddress != address(0), "Plugin is removed or not set");

        // Dynamic dispatch to plugin
        result = IPlugin(pluginAddress).performAction(input);
        emit PluginExecuted(pluginId, input, result);
        
    }

    /// @notice Get total number of plugins (including removed ones as address(0))
    function getPluginsCount() external view returns (uint256) {
        return plugins.length;
    }

    /// @notice Get plugin address at a specific index
    function getPluginAddress(uint256 pluginId) external view returns (address) {
        require(pluginId < plugins.length, "Invalid plugin ID");
        return plugins[pluginId];
    }
}
