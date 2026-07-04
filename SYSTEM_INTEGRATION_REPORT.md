# System Integration Report

## Service Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐
│  lps-dashboard  │────▶│   lps-api    │────▶│     lps-ai      │
│  (Next.js 14)   │     │  (Express)   │     │   (FastAPI)     │
└─────────────────┘     └──────┬───────┘     └─────────────────┘
                               │
                    ┌──────────┼──────────┐
                    ▼          ▼          ▼
              ┌──────────┐ ┌───────┐ ┌──────────────┐
              │PostgreSQL│ │ Redis │ │ BSC (via RPC)│
              └──────────┘ └───────┘ └──────────────┘
```

## Integration Points

### Dashboard → API
| Integration | Protocol | Auth | Status |
|-------------|----------|------|--------|
| Property CRUD | REST/JSON | JWT Bearer | ✅ Implemented |
| Escrow CRUD | REST/JSON | JWT Bearer | ✅ Implemented |
| Underwriting | REST/JSON | JWT Bearer | ✅ Implemented |
| Document Upload | multipart/form-data | JWT Bearer | ✅ Implemented |
| Auth (login/register) | REST/JSON | None/JWT | ✅ Implemented |
| WebSocket (escrow status) | WS | JWT | ✅ Defined |

### API → AI Service
| Integration | Protocol | Status |
|-------------|----------|--------|
| Document Extraction | POST /api/v1/extract | ✅ Implemented |
| Document Classification | POST /api/v1/classify | ✅ Implemented |
| Escrow Verification | POST /api/v1/escrow/verify | ✅ Implemented |
| Underwriting Analysis | POST /api/v1/underwriting/analyze | ✅ Implemented |
| Health Check | GET /health | ✅ Implemented |

### API → Blockchain
| Integration | Contract | Method | Status |
|-------------|----------|--------|--------|
| Register Document | DocumentRegistry | registerDocument() | ✅ |
| Record Verification | EscrowVerification | recordVerification() | ✅ |
| Store Report | UnderwritingReport | storeReport() | ✅ |
| Verify Hash | All | verify*() | ✅ |

### API → Database
| Model | Relations | Indexes | Constraints | Status |
|-------|-----------|---------|-------------|--------|
| Property | 4 relations | PK + FK | UUID, unique | ✅ |
| Document | 2 relations | PK + FK | Foreign key | ✅ |
| Escrow | 6 relations | PK + FK | Status enum | ✅ |
| UnderwritingReport | 5 relations | PK + FK | Grade enum | ✅ |
| User | 3 relations | PK + email unique | Password hash | ✅ |

## Data Flow: Complete Transaction

```
1. User Login → API validates JWT
2. Create Property → DB insert → return ID
3. Upload Documents → Store file → AI extract → DB store results
4. Document Hash → Blockchain DocumentRegistry.registerDocument()
5. Create Escrow → DB insert → link to Property
6. Upload Escrow Docs → AI fraud detection → confidence score
7. Verify Escrow → Cross-reference PSA → status update
8. Verification Hash → Blockchain EscrowVerification.recordVerification()
9. Run Underwriting → AI risk scoring + scenarios → DB store
10. Report Hash → Blockchain UnderwritingReport.storeReport()
11. Generate PDF → Property + Escrow + Underwriting data → PDF
12. Dashboard → Fetch all data → Render pages
```

## Integration Test Coverage

| Flow | Unit Tests | Integration | E2E |
|------|-----------|-------------|-----|
| Auth flow | ✅ 14 tests | ⚠️ Needs env | ❌ |
| Property intake | ✅ 14 tests | ⚠️ Needs DB | ❌ |
| Escrow verification | ✅ 23 AI + 14 API | ⚠️ Needs DB | ❌ |
| Underwriting | ✅ 28 AI + contract | ⚠️ Needs DB | ❌ |
| Blockchain | ✅ 63 Hardhat tests | ✅ Local chain | ❌ |

## Missing Integrations (Not Blockers)

1. No email/notification service connected
2. No file storage service (S3/Azure Blob) — uses local disk
3. No monitoring/APM connected (Prometheus endpoints exist)
4. No CI/CD pipeline running integration tests with DB

---

**Generated**: 2025-07-03
