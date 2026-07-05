# Compliance Checklist — LPS Token

**Entity:** Luxury Property Solutions LLC  
**Token:** LPS (BEP20)  
**Last Updated:** 2026-07-03  

---

## 1. Corporate Governance

| Item | Status | Notes |
|------|--------|-------|
| LLC formation and good standing | ☐ Verify | Confirm state of formation and annual filings are current |
| Operating agreement executed | ☐ Verify | Should define member rights, token policy, and authority |
| Board/manager authorization for token issuance | ☐ Verify | Document resolution authorizing minting and distribution |
| Registered agent current | ☐ Verify | Required for service of process |
| Corporate minutes documenting token decisions | ☐ Verify | All material decisions should be memorialized |
| Officer/manager identification | ☐ Verify | Key persons with signing authority documented |
| Conflict of interest policy | ☐ Implement | Disclose related-party transactions |
| Succession/continuity plan | ☐ Implement | Address key-person dependency |

---

## 2. AML/KYC Touchpoints

| Touchpoint | Requirement | Status |
|-----------|-------------|--------|
| Token distribution to new holders | KYC if securities or regulated | ☐ Assess |
| Fiat on-ramp/off-ramp | Must comply with BSA/AML | ☐ Assess |
| Large transactions (>$10,000 equivalent) | CTR filing may apply | ☐ Assess |
| Suspicious activity | SAR filing obligation | ☐ Implement monitoring |
| Sanctioned addresses (OFAC) | Must screen recipients | ☐ Implement |
| Beneficial ownership | Must identify UBOs for entity holders | ☐ Implement |
| Ongoing monitoring | Transaction monitoring program | ☐ Implement |
| Record retention (5+ years) | BSA requirement | ☐ Confirm |

### Notes
- The LPS smart contract has **no on-chain KYC/AML enforcement**. All compliance is handled off-chain.
- If tokens are distributed to the public, a securities law analysis (Howey test) should be completed.
- Consider implementing a transfer whitelist or partnering with a compliant transfer agent if required.

---

## 3. Custody Considerations

| Item | Status | Recommendation |
|------|--------|---------------|
| Owner private key storage | ☐ Review | Hardware wallet (Ledger/Trezor) minimum |
| Multisig implementation | ☐ Implement | Gnosis Safe (2-of-3 or 3-of-5) for treasury |
| Key backup and recovery | ☐ Document | Seed phrase stored in separate secure locations |
| Institutional custody (if applicable) | ☐ Assess | Fireblocks, BitGo, or equivalent for large holdings |
| Access logging | ☐ Implement | Log all wallet access attempts |
| Geographic separation of keys | ☐ Implement | Keys in different physical locations |
| Insurance coverage | ☐ Assess | Crime/specie insurance for digital assets |

### Owner Key Risk

The deployed contract owner key controls the `mint()` function. This is the most critical custody concern:

- **Current state:** Single EOA controls minting
- **Recommended:** Transfer ownership to a multisig, OR renounce ownership if minting is complete

---

## 4. Recordkeeping

| Record | Retention Period | Storage |
|--------|-----------------|---------|
| Token distribution records | 7 years minimum | Off-chain secure database |
| KYC/AML documentation | 5 years after relationship ends | Encrypted storage, access-controlled |
| Transaction logs | Permanent (on-chain) | BNB Smart Chain (public) |
| Corporate resolutions | Permanent | Corporate records |
| Smart contract source code | Permanent | GitHub + BscScan verification |
| Audit reports | 7 years | Secure document management |
| Tax records (1099s, K-1s if applicable) | 7 years | Accountant + backup |
| Communication records | 5 years | Email archive, encrypted |

### On-Chain vs Off-Chain

| Data | Location | Access |
|------|----------|--------|
| Token balances | On-chain (public) | Anyone via BscScan |
| Transfer history | On-chain (public) | Anyone via BscScan |
| Holder identity | Off-chain only | Restricted access |
| Legal agreements | Off-chain only | Parties + counsel |
| Property records | Off-chain (county recorder) | Public records |

---

## 5. Security Controls

### Technical Controls

| Control | Status | Priority |
|---------|--------|----------|
| Smart contract verified on BscScan | ✅ Done | — |
| Owner key on hardware wallet | ☐ Implement | Critical |
| Multisig for treasury operations | ☐ Implement | Critical |
| Two-factor auth on all admin accounts | ☐ Implement | High |
| IP allowlisting for RPC access | ☐ Assess | Medium |
| Monitoring for unauthorized minting | ☐ Implement | High |
| Alert on ownership transfer events | ☐ Implement | High |
| Regular key rotation (where possible) | ☐ Plan | Medium |

### Operational Controls

| Control | Status | Priority |
|---------|--------|----------|
| Separation of duties (no single point of failure) | ☐ Implement | High |
| Change management process for any contract interaction | ☐ Document | High |
| Incident response plan documented | ☐ Create | High |
| Regular security assessments (quarterly) | ☐ Schedule | Medium |
| Employee/contractor background checks | ☐ Implement | Medium |
| Vendor due diligence | ☐ Document | Medium |

### Physical Controls

| Control | Status | Priority |
|---------|--------|----------|
| Hardware wallet in secure location | ☐ Implement | Critical |
| Seed phrase backup in bank vault or safe deposit | ☐ Implement | Critical |
| Access log for physical key storage | ☐ Implement | High |

---

## 6. Smart Contract Audit Status

| Item | Status | Details |
|------|--------|---------|
| Source code verified | ✅ Complete | BscScan verified (Solidity 0.5.16) |
| Automated analysis | ✅ Complete | See SECURITY_AUDIT.md |
| Manual code review | ✅ Complete | Standard BEP20 template, no custom logic |
| Formal verification | ☐ Not performed | Low priority — simple token contract |
| Third-party audit firm | ☐ Not engaged | Recommended if token will be widely distributed |
| Bug bounty program | ☐ Not established | Consider if token gains significant value |
| Re-audit trigger | — | Any contract interaction that changes state (minting, ownership transfer) |

### Audit Summary

- **Critical vulnerabilities:** 0
- **High-severity findings:** 1 (unlimited minting — centralization risk)
- **Medium findings:** 2 (no burn, no supply cap)
- **Low findings:** 3 (approve race, old compiler, no mint event)
- **Contract is immutable:** Cannot be patched on-chain

### Recommended Third-Party Auditors (if needed)

- CertiK
- OpenZeppelin
- Trail of Bits
- Hacken
- SlowMist

---

## 7. Regulatory Considerations

| Jurisdiction | Consideration | Action Required |
|-------------|--------------|-----------------|
| United States (Federal) | Securities classification (Howey test) | ☐ Legal opinion |
| United States (State) | Money transmitter licensing | ☐ Legal analysis |
| United States (FinCEN) | BSA/AML compliance | ☐ Assess applicability |
| International | Varies by jurisdiction of token holders | ☐ Restrict if needed |

### Important Notes

- This checklist is a framework, not legal advice.
- Engage qualified legal counsel for jurisdiction-specific requirements.
- Regulatory landscape for digital assets is evolving rapidly.
- Document all compliance decisions and their rationale.
