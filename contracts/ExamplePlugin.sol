// SPDX-License-Identifier: MIT

pragma solidity 0.8.29;
import "./interfaces/IPlugin.sol";
contract ExamplePlugin is IPlugin { 
    function performAction(uint256 input) external pure override returns (uint256) { 
        return input * 2;
    }  
}   