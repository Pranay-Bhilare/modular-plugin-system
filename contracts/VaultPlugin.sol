// SPDX-License-Identifier: MIT

pragma solidity 0.8.29;
import "./interfaces/IPlugin.sol";

contract VaultPlugin is IPlugin {
    uint256 public vaultCounter = 1;

    struct Vault {
        address owner;
        uint256 balance;
        uint256 createdAt;
        string vaultName;
    }

    mapping(uint256 => Vault) public vaults;

    event VaultCreated(
        uint256 indexed vaultId, 
        address indexed owner, 
        uint256 balance, 
        uint256 timestamp, 
        string vaultName
    );
    function performAction(uint256 input) external override returns (uint256) {
        require(input > 0, "Initial deposit must be greater than 0");
        uint256 newCounter = vaultCounter + 1 ;
        bytes32 rawHash = keccak256(abi.encodePacked(
            msg.sender,
            input,
            block.timestamp,
            newCounter
        ));
        uint256 vaultId = uint256(rawHash);
        // Create a new vault with a default name.
        Vault memory newVault = Vault({
            owner: msg.sender,
            balance: input,
            createdAt: block.timestamp,
            vaultName: "DefaultVault"
        });
        vaults[vaultId] = newVault;
        vaultCounter = newCounter;
        emit VaultCreated(vaultId, msg.sender, input, block.timestamp, newVault.vaultName);
        return vaultId;
    }


}