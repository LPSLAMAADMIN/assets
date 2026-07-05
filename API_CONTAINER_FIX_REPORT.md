# API Container Fix Report

**Date:** 2025-07-05  
**Issue:** lps-api container fails health checks — Prisma cannot initialize  
**Resolution:** ✅ Fixed — all services healthy  
**CI Verification:** [Run 28742634041](https://github.com/LPSLAMAADMIN/lps-platform/actions/runs/28742634041) — 3/3 PASSED

---

## Error Analysis

### Error 1: Permission Denied
```
Error: Can't write to /app/node_modules/@prisma/engines
```

**Root Cause:** The multi-stage Dockerfile copies `node_modules` from builder (owned by root) then switches to `lpsapi` user. When `npx prisma migrate deploy` runs at startup, Prisma attempts to write to its engines directory but lacks permission.

### Error 2: OpenSSL Not Found
```
Prisma failed to detect libssl/OpenSSL version
```

**Root Cause:** `node:20-alpine` does not include OpenSSL. Prisma's query engine requires `libssl` for TLS database connections.

---

## Fix Applied

### Dockerfile Changes

```diff
 FROM node:20-alpine AS runtime

+# Install OpenSSL (required by Prisma for DB connections)
+RUN apk add --no-cache openssl
+
 WORKDIR /app
 RUN addgroup -g 1001 -S nodejs && adduser -S lpsapi -u 1001

 COPY --from=builder /app/dist ./dist
 COPY --from=builder /app/node_modules ./node_modules
 COPY --from=builder /app/prisma ./prisma
 COPY --from=builder /app/package.json ./

-RUN mkdir -p uploads logs && chown -R lpsapi:nodejs uploads logs
+# Fix permissions: Prisma engines must be readable, uploads/logs writable
+RUN chown -R lpsapi:nodejs /app/node_modules/.prisma \
+    && chown -R lpsapi:nodejs /app/node_modules/@prisma \
+    && mkdir -p uploads logs && chown -R lpsapi:nodejs uploads logs
+
 USER lpsapi

-HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
+HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=5 \
   CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/v1/health || exit 1
```

---

## Changes Summary

| Change | Reason |
|--------|--------|
| `apk add --no-cache openssl` | Provides libssl for Prisma query engine |
| `chown -R lpsapi:nodejs /app/node_modules/.prisma` | Allows Prisma client to access generated engine |
| `chown -R lpsapi:nodejs /app/node_modules/@prisma` | Allows Prisma CLI write access during migrate |
| `start-period=30s` | Allows time for `prisma migrate deploy` before health check starts |
| `retries=5` | More tolerance for slow migration runs |

---

## Verification

### CI Run 28742634041 — All Passed

| Job | Result |
|-----|--------|
| Production Stack (TLS + Monitoring) | ✅ Pass |
| OWASP ZAP Security Scan | ✅ Pass |
| Unit Tests | ✅ Pass |

### Container Startup Sequence (verified in CI)

```
1. postgres → healthy (pg_isready)
2. redis → healthy (redis-cli ping)
3. lps-api starts:
   a. npx prisma migrate deploy → SUCCESS
   b. node dist/main.js → listening on :4000
   c. health check → HTTP 200 on /api/v1/health
4. lps-ai → healthy (/health)
5. lps-dashboard → healthy (port 3000)
6. nginx → healthy (proxy pass)
7. blockchain (anvil) → healthy (cast block-number)
```

### docker compose ps (from CI logs)

All 7 services report **healthy** status.

---

## Design Notes

### Why Prisma Generate Happens at Build Time
- `npx prisma generate` runs in the builder stage during `docker build`
- This generates the Prisma Client and query engine binary
- The generated files are copied to the runtime image
- No generation needed at container startup

### Why Prisma Migrate Happens at Container Startup
- `npx prisma migrate deploy` applies pending migrations
- It must run against the live database (not available at build time)
- It only writes to the database, not to the filesystem
- The permission fix ensures the CLI can read its own engine files

### Why OpenSSL is Required
- Prisma's binary query engine links against libssl
- Alpine doesn't include it by default (unlike Debian-based images)
- Required for TLS connections to PostgreSQL
- `openssl` package provides both `libssl` and `libcrypto`

---

## Files Modified

| File | Repository | Change |
|------|-----------|--------|
| `Dockerfile` | lps-api | Added openssl, fixed permissions, increased health check tolerance |

## Commits

- `51a1ba7` on `feature/underwriting-engine` — fix applied
- `6c9d8a5` merged to `main` — production-ready
- Tag `v1.0.0-rc4` updated to new main HEAD
