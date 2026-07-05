# Technical Debt Report

**Version:** 1.0.0-rc4  
**Date:** 2025-07-05  
**Objective:** Catalog and prioritize technical debt for resolution before v1.1

---

## Priority: High (Fix Before Private Beta)

### 1. Docker Secrets Management
**Location:** lps-platform/docker-compose.production.yml  
**Issue:** Removed Docker file-based secrets during RC4 to fix CI. Production still uses `.env` file with plaintext credentials.  
**Impact:** Security risk if server is compromised.  
**Fix:** Re-implement Docker secrets or integrate HashiCorp Vault. Estimated: 2 days.

### 2. Hardcoded Configuration Values
**Location:** lps-api/src/config/index.ts  
**Issue:** Several values (rate limits, pagination defaults, AI timeout) are hardcoded rather than configurable via environment.  
**Impact:** Requires code change to tune production behavior.  
**Fix:** Extract all tunable values to config module with env var overrides. Estimated: 1 day.

### 3. Missing Error Boundary in Dashboard
**Location:** lps-dashboard/src/app/  
**Issue:** No global React error boundary. Unhandled component errors crash the entire page.  
**Impact:** Poor UX — user sees blank screen on any rendering error.  
**Fix:** Add top-level ErrorBoundary with fallback UI. Estimated: 0.5 days.

### 4. Database Connection Pool Not Tuned
**Location:** lps-api/prisma/  
**Issue:** Prisma connection pool uses default settings. No explicit pool size, timeout, or idle configuration.  
**Impact:** Under load, connections may exhaust or timeout unpredictably.  
**Fix:** Configure `connection_limit`, `pool_timeout` in DATABASE_URL. Estimated: 0.5 days.

### 5. AI Service Has No Request Queue
**Location:** lps-ai/  
**Issue:** Document processing requests are handled synchronously. No queue for backpressure.  
**Impact:** Under burst load, AI service may OOM or drop requests.  
**Fix:** Add Redis-backed task queue (Celery or Bull). Estimated: 3 days.

---

## Priority: Medium (Fix Before GA)

### 6. Duplicate Validation Logic
**Location:** lps-api + lps-dashboard  
**Issue:** Form validation rules (field lengths, formats, required fields) duplicated between frontend and backend.  
**Impact:** Maintenance burden; rules can drift out of sync.  
**Fix:** Share validation schemas via a common package (Zod or JSON Schema). Estimated: 2 days.

### 7. Inconsistent Error Response Format
**Location:** lps-api/src/  
**Issue:** Some endpoints return `{ error: string }`, others `{ message: string, code: number }`, others throw raw Prisma errors.  
**Impact:** Frontend must handle multiple error shapes; poor DX.  
**Fix:** Implement unified error middleware with consistent `{ error, code, details }` shape. Estimated: 1 day.

### 8. No API Versioning
**Location:** lps-api/src/routes/  
**Issue:** Routes are at `/api/v1/` but no mechanism to support v2 without breaking clients.  
**Impact:** Cannot evolve API without breaking existing integrations.  
**Fix:** Implement versioned route loader with deprecation headers. Estimated: 1 day.

### 9. Smart Contract Gas Optimization
**Location:** lps-contracts/contracts/  
**Issue:** Storage patterns not optimized. Uses individual mappings where struct packing could reduce gas.  
**Impact:** Higher transaction costs than necessary.  
**Fix:** Audit and optimize storage layout, use events instead of storage where appropriate. Estimated: 2 days.

### 10. Missing Request Tracing
**Location:** All services  
**Issue:** No correlation ID / trace ID propagated across service calls.  
**Impact:** Difficult to debug cross-service issues in production.  
**Fix:** Add OpenTelemetry trace context propagation. Estimated: 2 days.

### 11. Dashboard Bundle Size
**Location:** lps-dashboard/  
**Issue:** No code splitting or lazy loading for heavy pages (PDF viewer, chart libraries).  
**Impact:** Initial page load larger than necessary.  
**Fix:** Dynamic imports for heavy components, analyze with `@next/bundle-analyzer`. Estimated: 1 day.

### 12. Test Coverage Gaps
**Location:** lps-api/src/services/  
**Issue:** Service layer has unit tests but no integration tests hitting real database.  
**Impact:** Logic errors at the DB boundary go undetected.  
**Fix:** Add Testcontainers-based integration test suite. Estimated: 3 days.

---

## Priority: Low (v1.1 Backlog)

### 13. No Structured Logging in API
**Issue:** Uses `console.log` in some places instead of structured logger.  
**Fix:** Replace all console.log with Winston/Pino structured logger. Estimated: 1 day.

### 14. CSS Inconsistency
**Issue:** Mix of Tailwind utilities and inline styles in some components.  
**Fix:** Standardize on Tailwind; remove inline styles. Estimated: 1 day.

### 15. Unused Dependencies
**Issue:** Several npm packages installed but unused across repos.  
**Fix:** Run `depcheck` and remove unused packages. Estimated: 0.5 days.

### 16. Missing DB Indexes
**Issue:** Some frequently-queried columns lack indexes (e.g., status fields, foreign keys in join tables).  
**Fix:** Analyze slow query log, add indexes. Estimated: 0.5 days.

### 17. Docker Image Size
**Issue:** Production images not fully optimized (node_modules includes devDependencies in some layers).  
**Fix:** Multi-stage build optimization, `.dockerignore` audit. Estimated: 0.5 days.

---

## Summary

| Priority | Count | Estimated Effort |
|----------|-------|------------------|
| High | 5 | 7 days |
| Medium | 7 | 12 days |
| Low | 5 | 4 days |
| **Total** | **17** | **23 days** |

---

## Recommendation

Address all High-priority items before opening private beta. Medium items should be resolved before GA. Low items can be addressed incrementally in v1.1 sprints.
