# Performance Benchmarks

## AI Engine Performance

Measured on: Windows 11, Python 3.11, AMD Ryzen (single-threaded)

| Module | Operation | Latency (avg) | Throughput | Status |
|--------|-----------|---------------|------------|--------|
| Risk Engine | Full 6-category scoring | 0.019ms | 52,631/sec | ✅ Excellent |
| Scenario Engine | 4-scenario analysis | 0.028ms | 35,714/sec | ✅ Excellent |
| Market Analysis | Comparable assessment (3 comps) | 0.006ms | 166,667/sec | ✅ Excellent |
| Field Mapper | PSA extraction (regex) | <1ms | >10,000/sec | ✅ Excellent |
| Fraud Detector | 8-check analysis | <1ms | >10,000/sec | ✅ Excellent |

## Smart Contract Performance

| Contract | Operation | Gas (estimated) | Cost @ 3 gwei |
|----------|-----------|-----------------|---------------|
| DocumentRegistry | deploy | ~500,000 | ~$0.45 |
| DocumentRegistry | registerDocument | ~80,000 | ~$0.07 |
| EscrowVerification | deploy | ~700,000 | ~$0.63 |
| EscrowVerification | recordVerification | ~120,000 | ~$0.11 |
| UnderwritingReport | deploy | ~600,000 | ~$0.54 |
| UnderwritingReport | storeReport | ~100,000 | ~$0.09 |

*Note: BNB Smart Chain gas prices typically 3-5 gwei. Costs in USD estimated at BNB=$300.*

## Build Performance

| Repo | Operation | Duration | Status |
|------|-----------|----------|--------|
| lps-contracts | Compile (5 files) | 2s | ✅ |
| lps-contracts | Test suite (63 tests) | 2s | ✅ |
| lps-ai | Test suite (71 tests) | 0.27s | ✅ |
| lps-api | TypeScript compile | <2s | ✅ |
| lps-api | Jest (28 tests) | 14s | ✅ |
| lps-dashboard | Next.js build | ~15s | ✅ |

## Frontend Bundle Size

| Route | Size | First Load JS | Status |
|-------|------|---------------|--------|
| /dashboard | 2.63 kB | 98.6 kB | ✅ Good |
| /escrow | 1.68 kB | 97.7 kB | ✅ Good |
| /escrow/[id] | 2.75 kB | 90 kB | ✅ Good |
| /properties/new | 4.42 kB | 100 kB | ✅ Good |
| /underwriting | 968 B | 88.2 kB | ✅ Excellent |
| /underwriting/[id] | 1.9 kB | 89.2 kB | ✅ Good |
| Shared JS | 87.3 kB | — | ✅ Good |

## Database Query Performance (Expected)

| Query Pattern | Expected Latency | Notes |
|---------------|-----------------|-------|
| Get property by ID | <5ms | UUID PK lookup |
| List user properties | <20ms | Indexed on userId |
| Get escrow with relations | <15ms | FK indexed |
| Underwriting report + scores | <25ms | Eager load relations |
| Full text search | <100ms | Requires PG index |

*Note: Not measured against live DB. Estimates based on indexed schema and Prisma query planning.*

---

**Measured**: 2025-07-03  
**Environment**: Windows 11, Node 18, Python 3.11, Hardhat
