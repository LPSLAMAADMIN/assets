# Known Limitations — LPS Platform v1.0

## Architecture Limitations

| # | Limitation | Impact | Workaround |
|---|-----------|--------|------------|
| 1 | No root docker-compose.yml | Cannot deploy full stack in one command | Deploy services individually |
| 2 | lps-dashboard has no Dockerfile | Cannot containerize frontend | Use `next build && next start` |
| 3 | No database migrations committed | Schema must be created fresh | Run `prisma migrate dev` |
| 4 | No shared service discovery | Services use hardcoded URLs | Configure via env vars |

## Testing Limitations

| # | Limitation | Impact | Workaround |
|---|-----------|--------|------------|
| 5 | No E2E test suite | Full workflow not automatically verified | Manual testing with running services |
| 6 | Integration tests require running DB | Cannot run in CI without Docker | Use test containers or mock DB |
| 7 | No cross-browser testing | UI not verified on Safari/Firefox | Manual browser testing |
| 8 | AI accuracy not benchmarked | No F1/precision/recall metrics | Regression tests cover functionality |

## AI Limitations

| # | Limitation | Impact | Workaround |
|---|-----------|--------|------------|
| 9 | OCR not tested with real scans | Poor quality docs may fail extraction | Human review queue |
| 10 | Regex-based extraction | May miss unusual document formats | Custom patterns per document type |
| 11 | No ML model training pipeline | Cannot improve accuracy over time | Rule-based updates |
| 12 | Market analysis requires manual comps | No automated MLS/CoStar feed | Manual input of comparable sales |
| 13 | Scenario engine uses static adjustments | Cannot customize per deal type | Configurable thresholds possible |

## Blockchain Limitations

| # | Limitation | Impact | Workaround |
|---|-----------|--------|------------|
| 14 | No upgrade proxy | Contracts cannot be upgraded | Deploy new version, migrate data |
| 15 | No formal audit | Unknown vulnerabilities possible | Self-audited, tested |
| 16 | Single owner pattern | Central point of failure | Multi-sig recommended for production |
| 17 | No gas optimization audit | May be more expensive than necessary | Optimizer enabled (200 runs) |

## Security Limitations

| # | Limitation | Impact | Workaround |
|---|-----------|--------|------------|
| 18 | No WAF/edge protection | Vulnerable to DDoS | Cloudflare or AWS WAF |
| 19 | No HTTP security headers | Browser-based attacks possible | Add helmet.js |
| 20 | Dependency vulnerabilities | Known CVEs in transitive deps | npm audit fix |
| 21 | No penetration test | Unknown attack vectors | Schedule pentest |

## Operational Limitations

| # | Limitation | Impact | Workaround |
|---|-----------|--------|------------|
| 22 | No monitoring/alerting | Issues not detected proactively | Prometheus endpoints ready |
| 23 | No log aggregation | Debugging across services difficult | Add ELK/Loki stack |
| 24 | No backup strategy | Data loss risk | PostgreSQL pg_dump scheduled |
| 25 | No disaster recovery plan | Extended downtime on failure | Document and test DR |

## Feature Limitations

| # | Limitation | Impact | Workaround |
|---|-----------|--------|------------|
| 26 | GraphQL limited to 2 types | Not all data queryable via GQL | Use REST endpoints |
| 27 | No email notifications | Users not alerted to status changes | Check dashboard manually |
| 28 | No file storage service | Files stored on local disk | Migrate to S3/Azure Blob |
| 29 | PDF generation not tested E2E | May have formatting issues | Manual verification |
| 30 | No multi-tenancy isolation | Single organization only | Add org-based scoping |

---

**Last Updated**: 2025-07-03  
**Version**: 1.0.0-rc1
