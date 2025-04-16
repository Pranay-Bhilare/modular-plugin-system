require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.29",
  networks : {
    hardhat : {
      chainId : 1337
    }
  }
};
