# Security Audit Report — LPS Token (BEP20)

**Contract:** `0x500E63135fC1899E6342815C8adA406c0775a820`  
**Chain:** BNB Smart Chain (BSC)  
**Compiler:** Solidity 0.5.16  
**Auditor:** Automated Analysis  
**Date:** 2026-07-03  
**Status:** DEPLOYED & IMMUTABLE  

---

## Executive Summary

The LPS Token is a standard BEP20 token based on the Binance-provided template. It implements basic ERC20/BEP20 functionality with ownership and minting capabilities. The contract is already deployed and **cannot be modified on-chain**.

**Overall Risk: LOW-MEDIUM**

| Severity | Count | Description |
|----------|-------|-------------|
| Critical | 0 | No critical vulnerabilities |
| High | 1 | Unlimited minting (centralization) |
| Medium | 2 | No mint cap, no burn exposure |
| Low | 3 | Approve race, old compiler, no events on key actions |
| Informational | 4 | Style/optimization notes |

---

## Findings

### HIGH-1: Unlimited Minting (Centralization Risk)

**Location:** `BEP20Token.mint()` (line ~440)  
**Severity:** HIGH  
**Status:** ACCEPTED (contract is immutable)

```solidity
function mint(uint256 amount) public onlyOwner returns (bool) {
    _mint(_msgSender(), amount);
    return true;
}
```

**Description:** The owner can mint an unlimited number of tokens at any time with no supply cap. This allows infinite token inflation, devaluing existing holders' tokens.

**Impact:** If ownership is not renounced or transferred to a multisig/DAO, a single EOA can inflate supply arbitrarily.

**Recommendation:**
- Renounce ownership (`renounceOwnership()`) if minting is no longer needed
- Transfer ownership to a multisig (e.g., Gnosis Safe)
- For future contracts: add a `maxSupply` cap

---

### MEDIUM-1: No Public Burn Function

**Location:** `_burn()` and `_burnFrom()` are `internal`  
**Severity:** MEDIUM  
**Status:** BY DESIGN

**Description:** Token holders cannot burn their own tokens. Only internal calls can burn. This limits deflationary mechanisms.

**Impact:** Users cannot voluntarily reduce supply. No buyback-and-burn mechanism possible without a wrapper contract.

**Recommendation:** For future versions, expose a public `burn(uint256 amount)` function.

---

### MEDIUM-2: No Supply Cap on Minting

**Location:** `_mint()` internal function  
**Severity:** MEDIUM  

**Description:** There is no `maxSupply` check in the mint function. Combined with HIGH-1, this allows unbounded inflation.

**Recommendation:** For future versions:
```solidity
uint256 public constant MAX_SUPPLY = 10_000_000_000 * 10**18;
require(_totalSupply.add(amount) <= MAX_SUPPLY, "Exceeds max supply");
```

---

### LOW-1: ERC20 Approve Race Condition

**Location:** `approve()` function  
**Severity:** LOW  
**Status:** MITIGATED

**Description:** Standard ERC20 approve race condition where changing allowance from N to M allows a spender to spend N+M via front-running.

**Mitigation present:** `increaseAllowance()` and `decreaseAllowance()` are provided as safe alternatives. This is the standard mitigation used by OpenZeppelin.

---

### LOW-2: Solidity 0.5.16 (Outdated Compiler)

**Location:** Pragma directive  
**Severity:** LOW  
**Status:** CANNOT FIX (deployed)

**Description:** Solidity 0.5.16 is significantly outdated. Newer versions (0.8.x+) include built-in overflow checks, custom errors, and numerous security improvements.

**Impact:** SafeMath is used to mitigate overflow/underflow, which is correct for this version.

---

### LOW-3: No Event Emission on Mint

**Location:** `mint()` public function  
**Severity:** LOW  

**Description:** While `_mint()` emits a `Transfer` event from address(0), there is no dedicated `Mint` event. This makes it harder for indexers to distinguish mints from regular transfers.

---

### INFO-1: No Reentrancy Risk

The contract has no external calls, no ETH handling, and no callbacks. Reentrancy is not a concern.

---

### INFO-2: No Oracle Dependencies

The contract does not rely on any external oracle or price feed.

---

### INFO-3: No Upgradeability / Proxy Pattern

The contract is not upgradeable. This is both a feature (immutability guarantees) and a limitation (bugs cannot be fixed).

---

### INFO-4: Gas Optimization Opportunities (Non-actionable)

These apply to future contracts only:
- Use `immutable` for `_decimals`, `_symbol`, `_name` (Solidity 0.8+)
- Use custom errors instead of string reverts (saves ~50 gas per revert)
- Use `unchecked` blocks for SafeMath where overflow is impossible (Solidity 0.8+)

---

## Access Control Analysis

| Function | Access | Risk |
|----------|--------|------|
| `transfer` | Public | ✅ Safe |
| `approve` | Public | ✅ Safe (race mitigated) |
| `transferFrom` | Public | ✅ Safe |
| `increaseAllowance` | Public | ✅ Safe |
| `decreaseAllowance` | Public | ✅ Safe |
| `mint` | onlyOwner | ⚠️ Centralization risk |
| `renounceOwnership` | onlyOwner | ✅ Safe (irrevocable) |
| `transferOwnership` | onlyOwner | ⚠️ Should transfer to multisig |

---

## Reentrancy Analysis

| Function | External Calls | State Changes After | Risk |
|----------|---------------|-------------------|------|
| `transfer` | None | N/A | ✅ None |
| `transferFrom` | None | N/A | ✅ None |
| `approve` | None | N/A | ✅ None |
| `mint` | None | N/A | ✅ None |

**Conclusion:** No reentrancy vectors exist.

---

## Overflow/Underflow Analysis

All arithmetic operations use SafeMath library:
- `add()` → checks `c >= a`
- `sub()` → checks `b <= a`
- `mul()` → checks `c / a == b`
- `div()` → checks `b > 0`

**Conclusion:** Fully protected against overflow/underflow.

---

## Recommendations Summary

| Priority | Action | Can Fix? |
|----------|--------|----------|
| 1 | Renounce ownership or transfer to multisig | ✅ Yes (on-chain tx) |
| 2 | Document mint policy publicly | ✅ Yes (off-chain) |
| 3 | Add supply cap in future contracts | ⏳ Future only |
| 4 | Expose public burn function in future | ⏳ Future only |
| 5 | Upgrade to Solidity 0.8+ in future | ⏳ Future only |

---

## Conclusion

The LPS Token contract is a standard, well-structured BEP20 implementation with no critical vulnerabilities. The primary risk is centralization via the uncapped `mint()` function. This is a **design choice** rather than a bug, but should be communicated to token holders and ideally mitigated by renouncing ownership or implementing governance.

**The contract is safe for standard token operations (transfer, approve, hold).**
