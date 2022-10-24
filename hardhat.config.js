require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()
const privateKeys = process.env.PRIVATE_KEY || ""

module.exports = {
  solidity: "0.8.9",
  networks: {
    localhost: {},
    goerli: {
      url: `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: privateKeys.split(","),
    },
  },
}
