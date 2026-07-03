# Operations Manual — LPS Token

**Entity:** Luxury Property Solutions LLC  
**Token:** LPS (BEP20)  
**Contract:** `0x500E63135fC1899E6342815C8adA406c0775a820`  
**Last Updated:** 2026-07-03  

---

## 1. Minting Policy

### Current Capability

The deployed contract includes a `mint(uint256 amount)` function restricted to the contract owner. There is no on-chain supply cap.

### Minting Rules

| Rule | Requirement |
|------|-------------|
| Authorization | Written resolution by LLC manager(s) before any mint |
| Purpose | Mint only for documented business purposes (e.g., new property onboarding) |
| Maximum per mint | Define internal cap per mint event (recommend ≤1% of outstanding supply) |
| Frequency | No more than [TBD] mints per calendar quarter |
| Disclosure | All mints must be disclosed to stakeholders within 48 hours |
| Record | Transaction hash, amount, date, purpose, and authorizer logged |

### Minting Procedure

1. **Proposal:** Authorized manager submits mint request with business justification
2. **Approval:** Second authorized party approves (dual control)
3. **Execution:** Owner wallet executes `mint(amount)` transaction
4. **Verification:** Confirm on BscScan that balance and supply updated correctly
5. **Documentation:** Log in operations ledger with TX hash, date, amount, reason
6. **Disclosure:** Notify stakeholders per disclosure policy

### Disabling Minting

If minting is no longer needed:
```
// Permanently disables minting by removing owner
function renounceOwnership() public onlyOwner
```
**WARNING:** This is irreversible. Once ownership is renounced, no further minting is possible.

---

## 2. Treasury Management

### Treasury Wallet Structure

| Wallet | Purpose | Recommended Type |
|--------|---------|-----------------|
| Owner Wallet | Contract admin (minting, ownership) | Multisig (Gnosis Safe) |
| Operating Wallet | Day-to-day transfers and distributions | Hardware wallet |
| Reserve Wallet | Long-term holdings, vesting | Cold storage |

### Treasury Policies

| Policy | Rule |
|--------|------|
| Single transaction limit | ≤ [TBD] LPS without additional approval |
| Large transaction threshold | > [TBD] LPS requires dual authorization |
| Reserve ratio | Maintain ≥ [TBD]% of supply in reserve wallet |
| Liquidity provision | Documented approval required before providing DEX liquidity |
| Disbursement schedule | Tokens distributed per approved schedule only |

### Reconciliation

- **Daily:** Verify wallet balances match expected state via BscScan
- **Weekly:** Reconcile all outgoing transactions against authorization records
- **Monthly:** Full treasury report to LLC members/managers
- **Quarterly:** Independent review of treasury operations

---

## 3. Ownership and Key Management

### Key Inventory

| Key | Purpose | Holder | Storage | Backup |
|-----|---------|--------|---------|--------|
| Owner private key | Contract admin | [Designated manager] | Hardware wallet | Seed in vault |
| Operating wallet key | Token transfers | [Operations lead] | Hardware wallet | Seed in vault |
| Reserve wallet key | Cold storage | [Designated custodian] | Air-gapped device | Seed in separate vault |

### Key Management Rules

1. **No single person** should have unsupervised access to the owner key
2. **Hardware wallets only** — never store keys on internet-connected computers
3. **Seed phrases** stored in tamper-evident envelopes in geographically separated secure locations
4. **Access log** maintained for every key access event
5. **Regular verification** — confirm keys are accessible quarterly (without exposing them)

### Ownership Transfer Procedure

If ownership must be transferred (e.g., new manager, multisig migration):

1. Verify new owner address is correct (triple-check, test with small TX first)
2. Obtain written authorization from LLC governance
3. Execute `transferOwnership(newOwner)` from current owner
4. Verify on BscScan that `OwnershipTransferred` event was emitted
5. Confirm new owner can call `owner()` successfully
6. Update this document and key inventory
7. Securely destroy old owner key material (if no longer needed)

---

## 4. Incident Response

### Incident Classification

| Level | Description | Response Time | Example |
|-------|-------------|---------------|---------|
| **P1 — Critical** | Active exploit, unauthorized minting, key compromise | Immediate (< 15 min) | Owner key stolen |
| **P2 — High** | Suspicious activity, failed auth attempts | < 1 hour | Unknown transactions from treasury |
| **P3 — Medium** | Operational issue, service degradation | < 4 hours | BscScan showing incorrect data |
| **P4 — Low** | Minor issue, no security impact | < 24 hours | Documentation discrepancy |

### Incident Response Playbooks

#### P1: Owner Key Compromise

```
1. IMMEDIATELY call renounceOwnership() from the owner wallet
   → This permanently disables minting (the only privileged function)
2. If ownership already stolen: no on-chain remedy exists
3. Notify all stakeholders
4. Engage legal counsel
5. File law enforcement report if applicable
6. Assess whether token migration is needed
7. Document timeline and root cause
```

#### P1: Unauthorized Minting Detected

```
1. Verify the mint transaction on BscScan
2. If owner key is still controlled: renounceOwnership() immediately
3. If key is compromised: no on-chain remedy
4. Document the unauthorized mint (TX hash, amount, block)
5. Notify stakeholders with full transparency
6. Assess dilution impact
7. Consider token migration if damage is severe
```

#### P2: Suspicious Wallet Activity

```
1. Freeze all outgoing transactions from affected wallet
2. Verify transaction history on BscScan
3. Check hardware wallet for physical tampering
4. Rotate access credentials for all related services
5. Determine if activity was authorized but undocumented
6. Escalate to P1 if compromise is confirmed
```

### Post-Incident

- Conduct root cause analysis within 48 hours
- Document lessons learned
- Update procedures to prevent recurrence
- Communicate resolution to stakeholders

---

## 5. Disaster Recovery

### Recovery Scenarios

| Scenario | Recovery Method | RTO |
|----------|----------------|-----|
| Hardware wallet lost/damaged | Restore from seed phrase backup | < 4 hours |
| Seed phrase lost (single copy) | Use alternate backup location | < 24 hours |
| All seed copies destroyed | **UNRECOVERABLE** — funds permanently lost | N/A |
| BSC network outage | Wait for network recovery; no action needed | Network-dependent |
| BscScan unavailable | Use alternate RPC/explorer; on-chain data is safe | Minutes |
| Key person incapacitated | Succession plan activates backup keyholder | Per plan |

### Backup Strategy

| Asset | Primary | Secondary | Tertiary |
|-------|---------|-----------|----------|
| Owner seed phrase | Bank safe deposit box A | Secure location B (different city) | Attorney escrow |
| Operating seed phrase | Office safe | Bank safe deposit box | Trusted party |
| Operations documentation | GitHub (private repo) | Encrypted cloud backup | Local encrypted drive |
| Corporate records | Attorney's office | Cloud storage (encrypted) | Physical copies |

### Recovery Testing

- **Quarterly:** Verify seed phrases can derive expected addresses (DO NOT broadcast transactions)
- **Annually:** Full tabletop exercise of P1 incident response
- **On personnel change:** Verify all backups are accessible to authorized successors

---

## 6. Upgrade Procedures

### Contract Limitations

The LPS Token contract is **not upgradeable**. It has no proxy pattern, no delegatecall, and no admin functions to change logic. This means:

- ✅ The contract cannot be rugged or logic-swapped
- ❌ Bugs cannot be patched
- ❌ New features cannot be added

### If a New Contract Version is Needed

A full token migration is the only option:

1. **Deploy new contract** with corrected/enhanced logic
2. **Announce migration** with minimum 30-day notice
3. **Snapshot** all holder balances at a specific block
4. **Airdrop or claim** — distribute new tokens 1:1 to existing holders
5. **Cease operations** on old contract (renounce ownership, stop listing)
6. **Update all references** — Trust Wallet, BscScan, DEX listings
7. **Support both** for a transition period

### Upgrade Decision Criteria

Only initiate migration if:
- Critical vulnerability discovered that puts holder funds at risk
- Regulatory requirement mandates new contract features
- Business requirement that cannot be met with current contract
- Supermajority of stakeholders approve the migration

### Versioning

| Version | Address | Status | Notes |
|---------|---------|--------|-------|
| v1 (current) | `0x500E63135fC1899E6342815C8adA406c0775a820` | ✅ Active | Standard BEP20, immutable |
| v2 (if needed) | TBD | — | Would include supply cap, burn, etc. |

---

## Appendix: Quick Reference

### Critical Contract Functions

| Function | Who Can Call | What It Does | Risk Level |
|----------|-------------|-------------|-----------|
| `transfer(to, amount)` | Any holder | Move tokens | Low |
| `approve(spender, amount)` | Any holder | Allow spending | Low |
| `mint(amount)` | Owner only | Create new tokens | High |
| `renounceOwnership()` | Owner only | Permanently disable admin | Irreversible |
| `transferOwnership(new)` | Owner only | Change admin | High |

### Emergency Contacts

| Role | Contact | Responsibility |
|------|---------|---------------|
| Primary Key Holder | [Name/Contact] | Owner wallet operations |
| Backup Key Holder | [Name/Contact] | Succession/emergency access |
| Legal Counsel | [Firm/Contact] | Regulatory and legal issues |
| Technical Advisor | [Name/Contact] | Smart contract and blockchain issues |
