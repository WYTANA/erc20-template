const hre = require("hardhat")

async function main() {
  const Token = await hre.ethers.getContractFactory("Token")
  const token = await Token.deploy("TLO Token", "TLO", "1000")

  await token.deployed()

  console.log(`Token deployed here ---> ${token.address}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
