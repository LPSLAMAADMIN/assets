// Integration Tests for LPS Token (BEP20)
// Tests multi-step scenarios and edge cases
// Run: npx hardhat test test/BEP20Token.integration.js

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BEP20Token Integration Tests", function () {
  let token;
  let owner;
  let alice;
  let bob;
  let charlie;

  const TOTAL_SUPPLY = ethers.utils.parseEther("10000000000");

  beforeEach(async function () {
    [owner, alice, bob, charlie] = await ethers.getSigners();
    const BEP20Token = await ethers.getContractFactory("BEP20Token");
    token = await BEP20Token.deploy();
    await token.deployed();
  });

  describe("Multi-hop Transfer Scenarios", function () {
    it("Should handle chain of transfers correctly", async function () {
      const amount = ethers.utils.parseEther("1000");

      // Owner -> Alice -> Bob -> Charlie
      await token.transfer(alice.address, amount);
      await token.connect(alice).transfer(bob.address, amount);
      await token.connect(bob).transfer(charlie.address, amount);

      expect(await token.balanceOf(alice.address)).to.equal(0);
      expect(await token.balanceOf(bob.address)).to.equal(0);
      expect(await token.balanceOf(charlie.address)).to.equal(amount);
    });

    it("Should handle transferFrom workflow (DEX-like scenario)", async function () {
      const depositAmount = ethers.utils.parseEther("5000");
      const swapAmount = ethers.utils.parseEther("2000");

      // Alice gets tokens
      await token.transfer(alice.address, depositAmount);

      // Alice approves Bob (e.g., a DEX router)
      await token.connect(alice).approve(bob.address, depositAmount);

      // Bob transfers from Alice to Charlie (e.g., swap execution)
      await token.connect(bob).transferFrom(alice.address, charlie.address, swapAmount);

      expect(await token.balanceOf(alice.address)).to.equal(depositAmount.sub(swapAmount));
      expect(await token.balanceOf(charlie.address)).to.equal(swapAmount);
      expect(await token.allowance(alice.address, bob.address)).to.equal(depositAmount.sub(swapAmount));
    });
  });

  describe("Allowance Edge Cases", function () {
    it("Should handle multiple spenders independently", async function () {
      await token.approve(alice.address, 1000);
      await token.approve(bob.address, 2000);

      expect(await token.allowance(owner.address, alice.address)).to.equal(1000);
      expect(await token.allowance(owner.address, bob.address)).to.equal(2000);
    });

    it("Should handle increaseAllowance from zero", async function () {
      await token.increaseAllowance(alice.address, 500);
      expect(await token.allowance(owner.address, alice.address)).to.equal(500);
    });

    it("Should handle max uint256 approval", async function () {
      const maxUint = ethers.constants.MaxUint256;
      await token.approve(alice.address, maxUint);
      expect(await token.allowance(owner.address, alice.address)).to.equal(maxUint);
    });
  });

  describe("Minting Scenarios", function () {
    it("Should mint after ownership transfer", async function () {
      await token.transferOwnership(alice.address);

      // Old owner can no longer mint
      await expect(token.mint(1000)).to.be.revertedWith("Ownable: caller is not the owner");

      // New owner can mint
      const mintAmount = ethers.utils.parseEther("1000");
      await token.connect(alice).mint(mintAmount);
      expect(await token.balanceOf(alice.address)).to.equal(mintAmount);
    });

    it("Should track total supply correctly after multiple mints", async function () {
      const mint1 = ethers.utils.parseEther("100");
      const mint2 = ethers.utils.parseEther("200");

      await token.mint(mint1);
      await token.mint(mint2);

      expect(await token.totalSupply()).to.equal(TOTAL_SUPPLY.add(mint1).add(mint2));
    });
  });

  describe("Ownership Lifecycle", function () {
    it("Owner -> Transfer -> New owner mints -> Renounce -> No one can mint", async function () {
      // Transfer ownership to Alice
      await token.transferOwnership(alice.address);
      expect(await token.getOwner()).to.equal(alice.address);

      // Alice mints
      await token.connect(alice).mint(ethers.utils.parseEther("100"));

      // Alice renounces
      await token.connect(alice).renounceOwnership();

      // No one can mint now
      await expect(
        token.connect(alice).mint(1)
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await expect(
        token.mint(1)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Balance Consistency", function () {
    it("Sum of all balances should equal total supply", async function () {
      const amount1 = ethers.utils.parseEther("3000");
      const amount2 = ethers.utils.parseEther("7000");

      await token.transfer(alice.address, amount1);
      await token.transfer(bob.address, amount2);

      const ownerBal = await token.balanceOf(owner.address);
      const aliceBal = await token.balanceOf(alice.address);
      const bobBal = await token.balanceOf(bob.address);

      expect(ownerBal.add(aliceBal).add(bobBal)).to.equal(TOTAL_SUPPLY);
    });

    it("Mint increases total supply and recipient balance equally", async function () {
      const mintAmount = ethers.utils.parseEther("5000");
      const supplyBefore = await token.totalSupply();
      const balanceBefore = await token.balanceOf(owner.address);

      await token.mint(mintAmount);

      expect(await token.totalSupply()).to.equal(supplyBefore.add(mintAmount));
      expect(await token.balanceOf(owner.address)).to.equal(balanceBefore.add(mintAmount));
    });
  });

  describe("Gas Estimation", function () {
    it("Transfer gas should be reasonable", async function () {
      const tx = await token.transfer(alice.address, ethers.utils.parseEther("100"));
      const receipt = await tx.wait();
      // Standard ERC20 transfer should be ~51,000 gas
      expect(receipt.gasUsed.toNumber()).to.be.lessThan(100000);
    });

    it("Approve gas should be reasonable", async function () {
      const tx = await token.approve(alice.address, ethers.utils.parseEther("100"));
      const receipt = await tx.wait();
      expect(receipt.gasUsed.toNumber()).to.be.lessThan(80000);
    });
  });
});
