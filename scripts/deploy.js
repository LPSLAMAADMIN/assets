// Deployment Script for LPS Token (BEP20)
// Run: npx hardhat run scripts/deploy.js --network bscTestnet
//
// NOTE: The LPS Token is already deployed at:
//   0x500E63135fC1899E6342815C8adA406c0775a820 (BSC Mainnet)
// This script is provided for testnet deployments and reference.

const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("=== LPS Token Deployment ===");
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()), "BNB");
  console.log("");

  // Deploy
  const BEP20Token = await ethers.getContractFactory("BEP20Token");
  const token = await BEP20Token.deploy();
  await token.deployed();

  console.log("✅ BEP20Token deployed to:", token.address);
  console.log("");

  // Verify deployment
  console.log("=== Verification ===");
  console.log("Name:", await token.name());
  console.log("Symbol:", await token.symbol());
  console.log("Decimals:", await token.decimals());
  console.log("Total Supply:", ethers.utils.formatEther(await token.totalSupply()), "LPS");
  console.log("Owner:", await token.getOwner());
  console.log("Deployer Balance:", ethers.utils.formatEther(await token.balanceOf(deployer.address)), "LPS");
  console.log("");

  console.log("=== Next Steps ===");
  console.log("1. Verify on BscScan:");
  console.log(`   npx hardhat verify --network ${network.name} ${token.address}`);
  console.log("2. Add to Trust Wallet assets repo");
  console.log("3. Consider renouncing ownership or transferring to multisig");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
