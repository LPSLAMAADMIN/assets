# Architecture — LPS Token (BEP20)

## Overview

```mermaid
classDiagram
    class IBEP20 {
        <<interface>>
        +totalSupply() uint256
        +decimals() uint8
        +symbol() string
        +name() string
        +getOwner() address
        +balanceOf(address) uint256
        +transfer(address, uint256) bool
        +allowance(address, address) uint256
        +approve(address, uint256) bool
        +transferFrom(address, address, uint256) bool
    }

    class Context {
        #_msgSender() address
        #_msgData() bytes
    }

    class Ownable {
        -_owner: address
        +owner() address
        +renounceOwnership()
        +transferOwnership(address)
        #_transferOwnership(address)
    }

    class SafeMath {
        <<library>>
        +add(uint256, uint256) uint256
        +sub(uint256, uint256) uint256
        +mul(uint256, uint256) uint256
        +div(uint256, uint256) uint256
        +mod(uint256, uint256) uint256
    }

    class BEP20Token {
        -_balances: mapping
        -_allowances: mapping
        -_totalSupply: uint256
        -_decimals: uint8
        -_symbol: string
        -_name: string
        +transfer(address, uint256) bool
        +approve(address, uint256) bool
        +transferFrom(address, address, uint256) bool
        +increaseAllowance(address, uint256) bool
        +decreaseAllowance(address, uint256) bool
        +mint(uint256) bool [onlyOwner]
    }

    IBEP20 <|.. BEP20Token
    Context <|-- Ownable
    Ownable <|-- BEP20Token
    BEP20Token ..> SafeMath : uses
```

## Contract Details

| Property | Value |
|----------|-------|
| **Name** | Luxury Property Solutions LLC |
| **Symbol** | LPS |
| **Decimals** | 18 |
| **Initial Supply** | 10,000,000,000 (10 billion) |
| **Max Supply** | Unlimited (owner can mint) |
| **Compiler** | Solidity 0.5.16 |
| **License** | MIT |
| **Chain** | BNB Smart Chain (ChainID: 56) |
| **Address** | `0x500E63135fC1899E6342815C8adA406c0775a820` |

## Inheritance Chain

```
Context
  └── Ownable
       └── BEP20Token (implements IBEP20)
              └── uses SafeMath (library)
```

## Storage Layout

| Slot | Variable | Type | Access |
|------|----------|------|--------|
| 0 | `_owner` | address | Ownable (private) |
| 1 | `_balances` | mapping(address => uint256) | private |
| 2 | `_allowances` | mapping(address => mapping(address => uint256)) | private |
| 3 | `_totalSupply` | uint256 | private |
| 4 | `_decimals` | uint8 | private |
| 5 | `_symbol` | string | private |
| 6 | `_name` | string | private |

## Function Visibility Map

```mermaid
flowchart LR
    subgraph Public/External
        transfer
        approve
        transferFrom
        increaseAllowance
        decreaseAllowance
        balanceOf
        totalSupply
        allowance
        getOwner
        name
        symbol
        decimals
    end

    subgraph Owner Only
        mint
        renounceOwnership
        transferOwnership
    end

    subgraph Internal
        _transfer
        _mint
        _burn
        _approve
        _burnFrom
        _transferOwnership
    end
```

## Data Flow

```mermaid
sequenceDiagram
    participant User
    participant BEP20Token
    participant SafeMath

    User->>BEP20Token: transfer(recipient, amount)
    BEP20Token->>BEP20Token: _transfer(msg.sender, recipient, amount)
    BEP20Token->>SafeMath: sub(balance[sender], amount)
    SafeMath-->>BEP20Token: newSenderBalance
    BEP20Token->>SafeMath: add(balance[recipient], amount)
    SafeMath-->>BEP20Token: newRecipientBalance
    BEP20Token-->>User: true + Transfer event
```

## Deployment Architecture

```mermaid
flowchart TB
    subgraph BSC[BNB Smart Chain - Mainnet]
        LPS[BEP20Token<br/>0x500E63...a820]
    end

    subgraph Metadata[Trust Wallet Assets Repo]
        INFO[info.json]
        LOGO[logo.png]
    end

    subgraph Explorers
        BSCSCAN[BscScan - Verified]
    end

    LPS --> BSCSCAN
    INFO --> LPS
    LOGO --> LPS
```

## Security Boundaries

| Boundary | Protection |
|----------|-----------|
| Token transfers | Balance checks via SafeMath |
| Allowance spending | Allowance checks via SafeMath |
| Minting | `onlyOwner` modifier |
| Ownership transfer | `onlyOwner` + zero-address check |
| Overflow/Underflow | SafeMath library (all operations) |

## Dependencies

- **No external contract calls** — fully self-contained
- **No oracle dependencies** — no price feeds
- **No proxy/upgradeability** — immutable deployment
- **No external libraries** — SafeMath is inlined

## File Structure

```
contracts/
└── BEP20Token.sol          # Deployed contract source (verified on BscScan)

test/
├── BEP20Token.test.js      # Unit tests (Hardhat/ethers.js)
└── BEP20Token.integration.js  # Integration tests

scripts/
└── deploy.js               # Deployment script (reference only - already deployed)

docs/
├── SECURITY_AUDIT.md       # Security findings
├── ARCHITECTURE.md         # This file
├── DEPLOYMENT_GUIDE.md     # Deployment instructions
└── TEST_REPORT.md          # Test results
```
