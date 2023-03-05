require("@matterlabs/hardhat-zksync-solc")
require("@nomicfoundation/hardhat-toolbox")
require("@matterlabs/hardhat-zksync-deploy")
require("@matterlabs/hardhat-zksync-verify")
require("dotenv").config()

module.exports = {
  zksolc: {
    version: "1.3.1",
    compilerSource: "binary",
    settings: {},
  },
  solidity: {
    version: "0.8.17",
  },
  defaultNetwork: "zkTestnet",
  networks: {
    zkTestnet: {
      url: "https://zksync2-testnet.zksync.dev", 
      ethNetwork: process.env.ALCHEMY_API, // or "goerli" to use a default endpoint
      zksync: true,
      verifyURL: 'https://zksync2-testnet-explorer.zksync.dev/contract_verification'
    }
  }
};