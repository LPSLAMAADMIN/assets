# Deployment Guide — LPS Token (BEP20)

## Current Deployment

| Property | Value |
|----------|-------|
| **Network** | BNB Smart Chain Mainnet |
| **Chain ID** | 56 |
| **Contract Address** | `0x500E63135fC1899E6342815C8adA406c0775a820` |
| **Block Deployed** | Verified on BscScan |
| **Compiler** | Solidity 0.5.16 |
| **Optimization** | Yes (200 runs) |
| **Contract Name** | BEP20Token |
| **Status** | ✅ LIVE — Verified Source |

---

## Prerequisites (For Redeployment / Testnet)

### Software
- Node.js 18+
- npm or yarn
- Hardhat (`npm install --save-dev hardhat`)

### Accounts
- BNB for gas (mainnet: ~0.005 BNB for deployment)
- Private key of deployer wallet
- BscScan API key (for verification)

### Environment Variables
```bash
# .env file (DO NOT COMMIT)
DEPLOYER_PRIVATE_KEY=0x...
BSC_MAINNET_RPC=https://bsc-dataseed1.binance.org
BSC_TESTNET_RPC=https://data-seed-prebsc-1-s1.binance.org:8545
BSCSCAN_API_KEY=...
```

---

## Deployment Steps

### 1. Install Dependencies

```bash
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv
```

### 2. Configure Hardhat

```javascript
// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.5.16",
    settings: {
      optimizer: { enabled: true, runs: 200 }
    }
  },
  networks: {
    bscTestnet: {
      url: process.env.BSC_TESTNET_RPC || "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
    },
    bscMainnet: {
      url: process.env.BSC_MAINNET_RPC || "https://bsc-dataseed1.binance.org",
      chainId: 56,
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
    }
  },
  etherscan: {
    apiKey: { bsc: process.env.BSCSCAN_API_KEY || "" }
  }
};
```

### 3. Deploy

```bash
# Testnet
npx hardhat run scripts/deploy.js --network bscTestnet

# Mainnet (CAUTION: uses real funds)
npx hardhat run scripts/deploy.js --network bscMainnet
```

### 4. Verify on BscScan

```bash
npx hardhat verify --network bscMainnet 0x500E63135fC1899E6342815C8adA406c0775a820
```

---

## Post-Deployment Checklist

- [ ] Contract verified on BscScan
- [ ] Owner address confirmed
- [ ] Total supply confirmed (10,000,000,000 LPS)
- [ ] Transfer test (send small amount between wallets)
- [ ] Approve + transferFrom test
- [ ] Add token to Trust Wallet (this repo's purpose)
- [ ] Add liquidity on PancakeSwap (if applicable)
- [ ] Consider renouncing ownership or transferring to multisig

---

## Testnet Faucets

| Network | Faucet URL |
|---------|-----------|
| BSC Testnet | https://testnet.bnbchain.org/faucet-smart |

---

## Network Configuration

### BSC Mainnet
```
RPC: https://bsc-dataseed1.binance.org
Chain ID: 56
Symbol: BNB
Explorer: https://bscscan.com
```

### BSC Testnet
```
RPC: https://data-seed-prebsc-1-s1.binance.org:8545
Chain ID: 97
Symbol: tBNB
Explorer: https://testnet.bscscan.com
```

---

## Emergency Procedures

### If ownership is compromised:
1. Call `renounceOwnership()` immediately from the owner wallet
2. This permanently disables minting
3. All existing tokens remain functional

### If contract has a bug:
- The contract is **not upgradeable** — it cannot be patched
- Deploy a new contract and migrate (requires user action)
- Announce migration clearly with sufficient notice

---

## Gas Estimates

| Operation | Gas (approx) | Cost at 5 Gwei |
|-----------|-------------|----------------|
| Deploy | ~1,200,000 | 0.006 BNB |
| Transfer | ~51,000 | 0.000255 BNB |
| Approve | ~46,000 | 0.00023 BNB |
| TransferFrom | ~65,000 | 0.000325 BNB |
| Mint | ~68,000 | 0.00034 BNB |
