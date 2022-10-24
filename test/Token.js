const { expect } = require("chai")
const { ethers } = require("hardhat")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether")
}

describe("Token", () => {
  let token, accounts, deployer, receiver, exchange

  beforeEach(async () => {
    const Token = await ethers.getContractFactory("Token")
    token = await Token.deploy("Black Hills Token", "BHT", "1000000")

    accounts = await ethers.getSigners()
    deployer = accounts[0]
    receiver = accounts[1]
    exchange = accounts[2]
  })

  describe("Deployment", () => {
    const name = "Black Hills Token"
    const symbol = "BHT"
    const decimals = 18
    const totalSupply = tokens("1000000")

    it("has correct name ...", async () => {
      expect(await token.name()).to.equal(name)
    })

    it("has correct symbol ...", async () => {
      expect(await token.symbol()).to.equal(symbol)
    })

    it("has correct decimals ...", async () => {
      expect(await token.decimals()).to.equal(decimals)
    })

    it("has correct total supply ...", async () => {
      expect(await token.totalSupply()).to.equal(totalSupply)
    })

    it("assigns total supply to deployer ...", async () => {
      expect(await token.balanceOf(deployer.address)).to.equal(totalSupply)
    })
  })

  describe("Sending tokens", () => {
    let amount, transaction, result
    describe("Successfully", () => {
      beforeEach(async () => {
        amount = tokens(100)
        transaction = await token
          .connect(deployer)
          .transfer(receiver.address, amount)
        result = await transaction.wait()
      })
      it("transfers token balances", async () => {
        expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900))
        expect(await token.balanceOf(receiver.address)).to.equal(amount)
      })

      it("emits a transfer event", async () => {
        const event = result.events[0].event
        expect(event).to.equal("Transfer")

        const args = result.events[0].args
        expect(args.from).to.equal(deployer.address)
        expect(args.to).to.equal(receiver.address)
        expect(args.value).to.equal(amount)
      })
    })

    describe("Fails", () => {
      it("for insufficient balances", async () => {
        const invalidAmount = tokens(100000000)
        await expect(
          token.connect(deployer).transfer(receiver.address, invalidAmount)
        ).to.be.reverted
      })

      it("for invalid recipient", async () => {
        const amount = tokens(100)
        const invalidAddress = "0x0000000000000000000000000000000000000000"
        await expect(token.connect(deployer).transfer(invalidAddress, amount))
          .to.be.reverted
      })
    })
  })

  describe("Approved tokens", () => {
    let amount, transaction, result
    beforeEach(async () => {
      amount = tokens(100)
      transaction = await token
        .connect(deployer)
        .approve(exchange.address, amount)
      result = await transaction.wait()
    })
    describe("Successfully", () => {
      it("allocate an allowance for delegated token spending", async () => {
        expect(
          await token.allowance(deployer.address, exchange.address)
        ).to.equal(amount)
      })

      it("emit an approval event", async () => {
        const event = result.events[0].event
        expect(event).to.equal("Approval")

        const args = result.events[0].args
        expect(args.owner).to.equal(deployer.address)
        expect(args.spender).to.equal(exchange.address)
        expect(args.value).to.equal(amount)
      })
    })

    describe("Fail", () => {
      it("for invalid spender", async () => {
        const invalidAddress = "0x0000000000000000000000000000000000000000"
        await expect(token.connect(deployer).approve(invalidAddress, amount)).to
          .be.reverted
      })
    })
  })

  describe("Delegated token transfers", () => {
    let amount, transaction, result
    beforeEach(async () => {
      amount = tokens(100)
      transaction = await token
        .connect(deployer)
        .approve(exchange.address, amount)
      result = await transaction.wait()
    })

    describe("Successfully", () => {
      beforeEach(async () => {
        transaction = await token
          .connect(exchange)
          .transferFrom(deployer.address, receiver.address, amount)
        result = await transaction.wait()
      })

      it("transfer token balances", async () => {
        expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900))
        expect(await token.balanceOf(receiver.address)).to.equal(amount)
      })

      it("reset the allowance", async () => {
        expect(
          await token.allowance(deployer.address, exchange.address)
        ).to.be.equal(0)
      })

      it("emit a transfer event", async () => {
        const event = result.events[0].event
        expect(event).to.equal("Transfer")

        const args = result.events[0].args
        expect(args.from).to.equal(deployer.address)
        expect(args.to).to.equal(receiver.address)
        expect(args.value).to.equal(amount)
      })
    })

    describe("Fail", () => {
      it("for insufficient amounts", async () => {
        const invalidAmount = tokens(100000000)
        await expect(
          token
            .connect(exchange)
            .transferFrom(deployer.address, receiver.address, invalidAmount)
        ).to.be.reverted
      })
    })
  })
})
