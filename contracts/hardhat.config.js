require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");
require("solidity-coverage");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },
    testnet: {
      url: "https://evmrpc-testnet.0g.ai",
      chainId: 16601,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: "auto",
      timeout: 60000,
    },
    mainnet: {
      url: "https://evmrpc-mainnet.0g.ai", // Update with actual mainnet RPC
      chainId: 16600, // Update with actual mainnet chain ID
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: "auto",
      timeout: 60000,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    gasPrice: 20,
  },
  etherscan: {
    apiKey: {
      testnet: "0g-testnet-api-key", // Update with actual API key
      mainnet: "0g-mainnet-api-key", // Update with actual API key
    },
    customChains: [
      {
        network: "testnet",
        chainId: 16601,
        urls: {
          apiURL: "https://api-testnet.0g.ai/api", // Update with actual API URL
          browserURL: "https://chainscan-galileo.0g.ai",
        },
      },
      {
        network: "mainnet",
        chainId: 16600, // Update with actual mainnet chain ID
        urls: {
          apiURL: "https://api-mainnet.0g.ai/api", // Update with actual API URL
          browserURL: "https://chainscan.0g.ai", // Update with actual browser URL
        },
      },
    ],
  },
  paths: {
    sources: "./src",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 40000,
  },
};
