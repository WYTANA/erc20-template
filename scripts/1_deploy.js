async function main() {
  // eslint-disable-next-line no-undef
  const Token = await ethers.getContractFactory("Token")
  const token = await Token.deploy()

  await token.deployed()

  console.log(`Token deployed here ---> ${token.address}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
