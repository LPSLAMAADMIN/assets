# Security Analysis Pipeline

## Overview

This document describes the automated security analysis pipeline for the LPS Token (BEP20) smart contract deployed on BNB Smart Chain.

**Contract:** `0x500E63135fC1899E6342815C8adA406c0775a820`  
**Solidity Version:** 0.5.16  
**Chain:** BNB Smart Chain (BSC)

---

## Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    GitHub Actions Trigger                         │
│              (push/PR to master on contracts/**)                  │
└─────────────────┬───────────────────────────────────────────────┘
                  │
    ┌─────────────┼─────────────┬──────────────┐
    ▼             ▼             ▼              ▼
┌────────┐  ┌─────────┐  ┌──────────┐  ┌────────────────┐
│Slither │  │ Mythril │  │ Echidna  │  │Coverage & Gas  │
│Static  │  │Symbolic │  │  Fuzz    │  │   Analysis     │
│Analysis│  │Execution│  │ Testing  │  │                │
└───┬────┘  └────┬────┘  └────┬─────┘  └───────┬────────┘
    │            │             │                │
    ▼            ▼             ▼                ▼
┌────────┐  ┌─────────┐  ┌──────────┐  ┌────────────────┐
│ SARIF  │  │  SARIF  │  │  Report  │  │  Coverage +    │
│ Report │  │  Report │  │          │  │  Gas + Size    │
└───┬────┘  └────┬────┘  └────┬─────┘  └───────┬────────┘
    │            │             │                │
    └────────────┴──────┬──────┴────────────────┘
                        ▼
              ┌──────────────────┐
              │ Security Summary │
              │   (Aggregated)   │
              └────────┬─────────┘
                       ▼
              ┌──────────────────┐
              │  GitHub Security │
              │     Tab (SARIF)  │
              └──────────────────┘
```

---

## Tools

### 1. Slither (Static Analysis)

**Purpose:** Pattern-based vulnerability detection covering 90+ detector categories.

**What it finds:**
- Reentrancy vulnerabilities
- Uninitialized state variables
- Unchecked external calls
- Access control issues
- Integer overflow/underflow patterns
- Dangerous delegatecall usage
- Unused variables and dead code
- Gas optimization opportunities

**Configuration:** `security/slither.config.json`

**Local usage:**
```bash
pip install slither-analyzer
slither contracts/BEP20Token.sol --solc-version 0.5.16 --json security/results/slither-report.json
```

**Output:** SARIF report uploaded to GitHub Security tab + JSON artifact.

---

### 2. Mythril (Symbolic Execution)

**Purpose:** Formal verification via symbolic execution to find exploitable bugs.

**What it finds:**
- Integer overflow/underflow (SWC-101)
- Reentrancy (SWC-107)
- Unprotected ether withdrawal (SWC-105)
- Unprotected SELFDESTRUCT (SWC-106)
- Unchecked call return values (SWC-104)
- Transaction order dependence (SWC-114)
- Timestamp dependence (SWC-116)
- Delegatecall to untrusted callee (SWC-112)

**Configuration:** `security/mythril.config.yml`

**Local usage:**
```bash
pip install mythril
myth analyze contracts/BEP20Token.sol --solv 0.5.16 --max-depth 50 -o json
```

**Output:** SARIF report uploaded to GitHub Security tab + JSON artifact.

---

### 3. Echidna (Property-Based Fuzzing)

**Purpose:** Randomized transaction sequence testing against invariant properties.

**Properties tested:**
| Property | Description |
|----------|-------------|
| `echidna_balance_leq_supply` | No balance exceeds total supply |
| `echidna_transfer_preserves_supply` | Transfers don't create/destroy tokens |
| `echidna_zero_address_no_balance` | Zero address always has zero balance |
| `echidna_allowance_bounded` | Allowances stay within uint256 bounds |
| `echidna_owner_valid` | Owner is always a valid state |
| `echidna_mint_increases_supply` | Minting strictly increases supply |
| `echidna_transfer_conservation` | Token conservation across transfers |
| `echidna_supply_no_underflow` | Supply never underflows |

**Configuration:** `security/echidna.config.yml`  
**Test contract:** `security/echidna/EchidnaTest.sol`

**Local usage:**
```bash
# Install echidna from https://github.com/crytic/echidna/releases
echidna security/echidna/EchidnaTest.sol --contract EchidnaTest --config security/echidna.config.yml
```

**Output:** Text report with property pass/fail status + corpus for reproducibility.

---

### 4. Solidity Coverage

**Purpose:** Measure test coverage of contract code paths.

**Configuration:** `.solcover.js`

**Local usage:**
```bash
npx hardhat coverage
```

**Output:** HTML + LCOV coverage reports.

**Targets:**
| Metric | Minimum | Target |
|--------|---------|--------|
| Statement coverage | 80% | 95%+ |
| Branch coverage | 70% | 90%+ |
| Function coverage | 90% | 100% |
| Line coverage | 80% | 95%+ |

---

### 5. Gas Reporting

**Purpose:** Measure gas consumption for all contract functions.

**Local usage:**
```bash
REPORT_GAS=true npx hardhat test
```

**Output:** Per-function gas usage table with min/max/avg.

**Key thresholds:**
| Function | Expected Gas | Alert If > |
|----------|-------------|-----------|
| transfer | ~51,000 | 80,000 |
| approve | ~46,000 | 70,000 |
| transferFrom | ~58,000 | 90,000 |
| mint | ~68,000 | 100,000 |
| deploy | ~1,200,000 | 2,000,000 |

---

### 6. Contract Size Analysis

**Purpose:** Verify contract stays within the 24,576 byte EIP-170 limit.

**Local usage:**
```bash
npx hardhat size
```

**Output:** Contract bytecode sizes in bytes.

**LPS Token expected size:** ~4,500 bytes (well within limit).

---

## GitHub Actions Workflow

**File:** `.github/workflows/security-analysis.yml`

**Triggers:**
- Push to `master`/`main` (paths: `contracts/**`, `security/**`)
- Pull requests to `master`/`main`
- Manual dispatch (`workflow_dispatch`)

**Jobs:**
1. `slither` — Static analysis → SARIF upload
2. `mythril` — Symbolic execution → SARIF upload
3. `echidna` — Fuzz testing → artifact upload
4. `coverage-gas` — Coverage + gas + size reports
5. `security-summary` — Aggregated results (depends on all above)

**SARIF Integration:**
Results from Slither and Mythril are uploaded as SARIF to GitHub's Security tab, providing:
- Inline code annotations on PRs
- Persistent security alerts
- Trend tracking over time
- Rule-based filtering and triage

---

## Running Locally

### Prerequisites

```bash
# Python tools
pip install slither-analyzer mythril solc-select
solc-select install 0.5.16
solc-select use 0.5.16

# Node tools
npm install --save-dev hardhat solidity-coverage hardhat-gas-reporter hardhat-contract-sizer

# Echidna (download binary)
# https://github.com/crytic/echidna/releases
```

### Full Local Pipeline

```bash
# 1. Slither
slither contracts/BEP20Token.sol --solc-version 0.5.16 --json security/results/slither-report.json

# 2. Mythril
myth analyze contracts/BEP20Token.sol --solv 0.5.16 -o json > security/results/mythril-report.json

# 3. Echidna
echidna security/echidna/EchidnaTest.sol --contract EchidnaTest --config security/echidna.config.yml

# 4. Coverage
npx hardhat coverage

# 5. Gas
REPORT_GAS=true npx hardhat test

# 6. Contract size
npx hardhat size
```

---

## Interpreting Results

### Severity Levels

| Level | Action Required | SLA |
|-------|----------------|-----|
| Critical | Immediate fix before any deployment | Block release |
| High | Fix before next release | 24 hours |
| Medium | Plan fix in current sprint | 1 week |
| Low | Track in backlog | Next release |
| Informational | Review and document | No deadline |

### False Positive Handling

If a finding is a false positive:
1. Document in `SECURITY_AUDIT.md` with justification
2. Add to Slither's `--exclude` list if pattern-level
3. Add inline `// slither-disable-next-line detector-name` for one-offs
4. Record in `AUDIT_READY_CHECKLIST.md`

---

## Maintenance

- **Weekly:** Review new Slither/Mythril detector releases
- **Monthly:** Update tool versions in CI
- **Per-release:** Run full pipeline and archive reports
- **Annually:** Engage external auditor to validate pipeline findings
