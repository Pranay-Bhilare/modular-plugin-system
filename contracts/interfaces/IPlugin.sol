//SPDX-License-Identifier: MIT
pragma solidity 0.8.29;

interface IPlugin { 
  function performAction(uint256) external returns (uint256);
}