# API Storage Permission Fix Report

**Date:** 2025-07-05  
**Issue:** `EACCES: permission denied, mkdir '/app/storage/certificates'`  
**Resolution:** ✅ Fixed — all services healthy  
**CI Run:** [28745204350](https://github.com/LPSLAMAADMIN/lps-platform/actions/runs/28745204350) — 3/3 PASSED

---

## Root Cause

`CertificateService` in lps-api creates `/app/storage/certificates` at runtime to store generated verification certificates. The Dockerfile did not create this directory before switching to the non-root `lpsapi` user, so the `mkdir` call failed with `EACCES`.

---

## Fix Applied

### lps-api/Dockerfile

```diff
-# Fix permissions: Prisma engines must be readable, uploads/logs writable
-RUN chown -R lpsapi:nodejs /app/node_modules/.prisma \
-    && chown -R lpsapi:nodejs /app/node_modules/@prisma \
-    && mkdir -p uploads logs && chown -R lpsapi:nodejs uploads logs
+# Fix permissions: Prisma engines + all runtime directories writable by lpsapi
+RUN chown -R lpsapi:nodejs /app/node_modules/.prisma \
+    && chown -R lpsapi:nodejs /app/node_modules/@prisma \
+    && mkdir -p /app/storage/certificates /app/uploads /app/logs \
+    && chown -R lpsapi:nodejs /app/storage /app/uploads /app/logs
```

### lps-dashboard/app/page.tsx (new)

```tsx
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/dashboard');
}
```

Navigating to `/` now redirects to `/dashboard` instead of returning 404.

---

## Directory Layout (post-fix)

```
/app/
├── dist/              # Compiled TypeScript (root-owned, read-only)
├── node_modules/      # Dependencies
│   ├── .prisma/       # ← lpsapi:nodejs (Prisma client)
│   └── @prisma/       # ← lpsapi:nodejs (Prisma engines)
├── prisma/            # Schema + migrations (root-owned, read-only)
├── storage/           # ← lpsapi:nodejs
│   └── certificates/  # ← lpsapi:nodejs (CertificateService writes here)
├── uploads/           # ← lpsapi:nodejs (document uploads)
├── logs/              # ← lpsapi:nodejs (application logs)
└── package.json
```

---

## Verification

| Job | Status |
|-----|--------|
| Production Stack (TLS + Monitoring) | ✅ All 7 services healthy |
| OWASP ZAP Security Scan | ✅ Passed |
| Unit Tests (162) | ✅ Passed |

### Service Health (from CI)

| Service | Status |
|---------|--------|
| postgres | ✅ healthy |
| redis | ✅ healthy |
| lps-api | ✅ healthy |
| lps-ai | ✅ healthy |
| lps-dashboard | ✅ healthy |
| nginx | ✅ healthy |
| blockchain | ✅ healthy |

---

## Cumulative Dockerfile Fixes (RC4)

| Fix | Commit | Issue |
|-----|--------|-------|
| Add `openssl` package | `51a1ba7` | Prisma can't detect libssl |
| chown `.prisma` + `@prisma` dirs | `51a1ba7` | Can't write to engines |
| Increase health check start-period | `51a1ba7` | Health check fails during migration |
| Create `/app/storage/certificates` | `ac59462` | CertificateService EACCES |
| Create `/app/uploads` + `/app/logs` | `ac59462` | Consolidated directory setup |

---

## Final Dockerfile

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
RUN npx prisma generate
COPY tsconfig.json ./
COPY src ./src/
RUN npm run build

FROM node:20-alpine AS runtime

# Install OpenSSL (required by Prisma for DB connections)
RUN apk add --no-cache openssl

WORKDIR /app
RUN addgroup -g 1001 -S nodejs && adduser -S lpsapi -u 1001

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

# Fix permissions: Prisma engines + all runtime directories writable by lpsapi
RUN chown -R lpsapi:nodejs /app/node_modules/.prisma \
    && chown -R lpsapi:nodejs /app/node_modules/@prisma \
    && mkdir -p /app/storage/certificates /app/uploads /app/logs \
    && chown -R lpsapi:nodejs /app/storage /app/uploads /app/logs

USER lpsapi

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/v1/health || exit 1

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
```
