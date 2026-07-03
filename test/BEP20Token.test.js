// Unit Tests for LPS Token (BEP20)
// Framework: Hardhat + ethers.js
// Run: npx hardhat test test/BEP20Token.test.js

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BEP20Token", function () {
  let token;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  const TOTAL_SUPPLY = ethers.utils.parseEther("10000000000"); // 10 billion
  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    const BEP20Token = await ethers.getContractFactory("BEP20Token");
    token = await BEP20Token.deploy();
    await token.deployed();
  });

  describe("Deployment", function () {
    it("Should set the correct name", async function () {
      expect(await token.name()).to.equal("Luxury Property Solutions LLC");
    });

    it("Should set the correct symbol", async function () {
      expect(await token.symbol()).to.equal("LPS");
    });

    it("Should set 18 decimals", async function () {
      expect(await token.decimals()).to.equal(18);
    });

    it("Should set total supply to 10 billion tokens", async function () {
      expect(await token.totalSupply()).to.equal(TOTAL_SUPPLY);
    });

    it("Should assign total supply to deployer", async function () {
      expect(await token.balanceOf(owner.address)).to.equal(TOTAL_SUPPLY);
    });

    it("Should set deployer as owner", async function () {
      expect(await token.getOwner()).to.equal(owner.address);
    });
  });

  describe("Transfers", function () {
    it("Should transfer tokens between accounts", async function () {
      const amount = ethers.utils.parseEther("100");
      await token.transfer(addr1.address, amount);
      expect(await token.balanceOf(addr1.address)).to.equal(amount);
      expect(await token.balanceOf(owner.address)).to.equal(TOTAL_SUPPLY.sub(amount));
    });

    it("Should emit Transfer event", async function () {
      const amount = ethers.utils.parseEther("100");
      await expect(token.transfer(addr1.address, amount))
        .to.emit(token, "Transfer")
        .withArgs(owner.address, addr1.address, amount);
    });

    it("Should fail if sender has insufficient balance", async function () {
      const amount = ethers.utils.parseEther("1");
      await expect(
        token.connect(addr1).transfer(owner.address, amount)
      ).to.be.revertedWith("BEP20: transfer amount exceeds balance");
    });

    it("Should fail when transferring to zero address", async function () {
      const amount = ethers.utils.parseEther("100");
      await expect(
        token.transfer(ZERO_ADDRESS, amount)
      ).to.be.revertedWith("BEP20: transfer to the zero address");
    });

    it("Should allow zero amount transfers", async function () {
      await expect(token.transfer(addr1.address, 0)).to.not.be.reverted;
    });
  });

  describe("Approvals", function () {
    it("Should approve tokens for spending", async function () {
      const amount = ethers.utils.parseEther("1000");
      await token.approve(addr1.address, amount);
      expect(await token.allowance(owner.address, addr1.address)).to.equal(amount);
    });

    it("Should emit Approval event", async function () {
      const amount = ethers.utils.parseEther("1000");
      await expect(token.approve(addr1.address, amount))
        .to.emit(token, "Approval")
        .withArgs(owner.address, addr1.address, amount);
    });

    it("Should fail when approving to zero address", async function () {
      await expect(
        token.approve(ZERO_ADDRESS, 100)
      ).to.be.revertedWith("BEP20: approve to the zero address");
    });

    it("Should update allowance on re-approve", async function () {
      await token.approve(addr1.address, 1000);
      await token.approve(addr1.address, 2000);
      expect(await token.allowance(owner.address, addr1.address)).to.equal(2000);
    });
  });

  describe("TransferFrom", function () {
    const approveAmount = ethers.utils.parseEther("1000");

    beforeEach(async function () {
      await token.approve(addr1.address, approveAmount);
    });

    it("Should transfer within allowance", async function () {
      const transferAmount = ethers.utils.parseEther("500");
      await token.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount);
      expect(await token.balanceOf(addr2.address)).to.equal(transferAmount);
    });

    it("Should reduce allowance after transferFrom", async function () {
      const transferAmount = ethers.utils.parseEther("500");
      await token.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount);
      expect(await token.allowance(owner.address, addr1.address)).to.equal(
        approveAmount.sub(transferAmount)
      );
    });

    it("Should fail if transfer exceeds allowance", async function () {
      const tooMuch = approveAmount.add(1);
      await expect(
        token.connect(addr1).transferFrom(owner.address, addr2.address, tooMuch)
      ).to.be.revertedWith("BEP20: transfer amount exceeds allowance");
    });
  });

  describe("Increase/Decrease Allowance", function () {
    it("Should increase allowance", async function () {
      await token.approve(addr1.address, 1000);
      await token.increaseAllowance(addr1.address, 500);
      expect(await token.allowance(owner.address, addr1.address)).to.equal(1500);
    });

    it("Should decrease allowance", async function () {
      await token.approve(addr1.address, 1000);
      await token.decreaseAllowance(addr1.address, 400);
      expect(await token.allowance(owner.address, addr1.address)).to.equal(600);
    });

    it("Should fail if decreasing below zero", async function () {
      await token.approve(addr1.address, 100);
      await expect(
        token.decreaseAllowance(addr1.address, 200)
      ).to.be.revertedWith("BEP20: decreased allowance below zero");
    });
  });

  describe("Minting", function () {
    it("Should allow owner to mint", async function () {
      const mintAmount = ethers.utils.parseEther("1000");
      await token.mint(mintAmount);
      expect(await token.totalSupply()).to.equal(TOTAL_SUPPLY.add(mintAmount));
      expect(await token.balanceOf(owner.address)).to.equal(TOTAL_SUPPLY.add(mintAmount));
    });

    it("Should emit Transfer event from zero address on mint", async function () {
      const mintAmount = ethers.utils.parseEther("1000");
      await expect(token.mint(mintAmount))
        .to.emit(token, "Transfer")
        .withArgs(ZERO_ADDRESS, owner.address, mintAmount);
    });

    it("Should fail if non-owner tries to mint", async function () {
      await expect(
        token.connect(addr1).mint(1000)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Ownership", function () {
    it("Should transfer ownership", async function () {
      await token.transferOwnership(addr1.address);
      expect(await token.getOwner()).to.equal(addr1.address);
    });

    it("Should emit OwnershipTransferred event", async function () {
      await expect(token.transferOwnership(addr1.address))
        .to.emit(token, "OwnershipTransferred")
        .withArgs(owner.address, addr1.address);
    });

    it("Should fail transferring ownership to zero address", async function () {
      await expect(
        token.transferOwnership(ZERO_ADDRESS)
      ).to.be.revertedWith("Ownable: new owner is the zero address");
    });

    it("Should renounce ownership", async function () {
      await token.renounceOwnership();
      expect(await token.getOwner()).to.equal(ZERO_ADDRESS);
    });

    it("Should prevent minting after ownership renounced", async function () {
      await token.renounceOwnership();
      await expect(token.mint(1000)).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should fail if non-owner tries to transfer ownership", async function () {
      await expect(
        token.connect(addr1).transferOwnership(addr2.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
