require("@nomiclabs/hardhat-waffle");

// Secret should be a json file containing:
// url: (your RPC URL)
// key: (your wallet's private key)
let secret = require("./secret");

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.12",
  networks: {
    ethereum: {
      url: "https://mainnet.infura.io/v3/e93c710cf06945faa49852f9ea1171ef",
      accounts: [secret.key]
    },
    goerli: {
      url: "https://rpc.goerli.mudit.blog",
      accounts: [secret.key]
    },
    polygon: {
      url: "https://polygon-rpc.com",
      accounts: [secret.key]
    }
  }
};
