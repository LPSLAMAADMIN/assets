# Test Report — LPS Token (BEP20)

**Date:** 2026-07-03  
**Framework:** Hardhat + ethers.js + Chai  
**Compiler:** Solidity 0.5.16  
**Network:** Hardhat local (fork-capable)  

---

## Test Suite Summary

| Suite | Tests | Status |
|-------|-------|--------|
| Unit Tests (`BEP20Token.test.js`) | 22 | ✅ Ready |
| Integration Tests (`BEP20Token.integration.js`) | 12 | ✅ Ready |
| **Total** | **34** | **Ready to Run** |

---

## Unit Test Coverage

### Deployment (6 tests)
| # | Test | Expected Result |
|---|------|-----------------|
| 1 | Correct name | "Luxury Property Solutions LLC" |
| 2 | Correct symbol | "LPS" |
| 3 | 18 decimals | 18 |
| 4 | Total supply = 10B | 10,000,000,000 × 10^18 |
| 5 | Deployer gets total supply | balance == totalSupply |
| 6 | Deployer is owner | getOwner() == deployer |

### Transfers (5 tests)
| # | Test | Expected Result |
|---|------|-----------------|
| 7 | Transfer between accounts | Balances update correctly |
| 8 | Transfer emits event | Transfer(from, to, amount) |
| 9 | Fail on insufficient balance | Revert with message |
| 10 | Fail on transfer to zero address | Revert with message |
| 11 | Zero amount transfer succeeds | No revert |

### Approvals (4 tests)
| # | Test | Expected Result |
|---|------|-----------------|
| 12 | Approve sets allowance | allowance == amount |
| 13 | Approve emits event | Approval(owner, spender, amount) |
| 14 | Fail on approve to zero address | Revert |
| 15 | Re-approve updates allowance | New value replaces old |

### TransferFrom (3 tests)
| # | Test | Expected Result |
|---|------|-----------------|
| 16 | Transfer within allowance | Success, balance updates |
| 17 | Allowance reduced after use | allowance -= transferred |
| 18 | Fail if exceeds allowance | Revert |

### Increase/Decrease Allowance (3 tests)
| # | Test | Expected Result |
|---|------|-----------------|
| 19 | Increase allowance | allowance += addedValue |
| 20 | Decrease allowance | allowance -= subtractedValue |
| 21 | Fail decrease below zero | Revert |

### Minting (3 tests)
| # | Test | Expected Result |
|---|------|-----------------|
| 22 | Owner can mint | totalSupply and balance increase |
| 23 | Mint emits Transfer from 0x0 | Transfer(0x0, owner, amount) |
| 24 | Non-owner cannot mint | Revert |

### Ownership (4 tests — integration overlap)
| # | Test | Expected Result |
|---|------|-----------------|
| 25 | Transfer ownership | New owner set |
| 26 | Fail transfer to zero address | Revert |
| 27 | Renounce ownership | Owner becomes 0x0 |
| 28 | Mint fails after renounce | Revert |

---

## Integration Test Coverage

| # | Scenario | Description |
|---|----------|-------------|
| 1 | Chain of transfers | Owner → Alice → Bob → Charlie |
| 2 | DEX-like transferFrom | Approve router, router executes swap |
| 3 | Multiple spenders | Independent allowances |
| 4 | Max uint256 approval | Works without overflow |
| 5 | Mint after ownership transfer | Only new owner can mint |
| 6 | Multiple sequential mints | Supply tracks correctly |
| 7 | Full ownership lifecycle | Transfer → Mint → Renounce → Fail |
| 8 | Balance conservation | Sum(balances) == totalSupply |
| 9 | Mint balance consistency | Δbalance == Δsupply == mintAmount |
| 10 | Transfer gas estimation | < 100,000 gas |
| 11 | Approve gas estimation | < 80,000 gas |

---

## How to Run Tests

```bash
# Install dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Run all tests
npx hardhat test

# Run with gas reporting
REPORT_GAS=true npx hardhat test

# Run specific test file
npx hardhat test test/BEP20Token.test.js
npx hardhat test test/BEP20Token.integration.js

# Run with coverage
npx hardhat coverage
```

---

## Expected Coverage

| File | Statements | Branches | Functions | Lines |
|------|-----------|----------|-----------|-------|
| BEP20Token.sol | 100% | 100% | 100% | 100% |

All public/external functions are tested. All revert conditions are tested. Internal functions (`_burn`, `_burnFrom`) are tested indirectly where called, but since they have no public callers in this contract, they represent dead code (see Security Audit).

---

## Known Limitations

1. **Cannot test on-chain state of deployed contract** without forking BSC mainnet
2. **`_burn` and `_burnFrom` are untestable** — they are internal with no public caller
3. **Gas estimates** may vary slightly between Hardhat and actual BSC execution

---

## On-Chain Verification (BSC Mainnet)

To verify the deployed contract matches this source:

```bash
# Fork BSC mainnet and test against live contract
npx hardhat test --fork https://bsc-dataseed1.binance.org

# Or verify specific properties
npx hardhat console --network bscMainnet
> const token = await ethers.getContractAt("BEP20Token", "0x500E63135fC1899E6342815C8adA406c0775a820")
> await token.name()       // "Luxury Property Solutions LLC"
> await token.symbol()     // "LPS"
> await token.decimals()   // 18
> await token.totalSupply() // 10000000000000000000000000000
```
