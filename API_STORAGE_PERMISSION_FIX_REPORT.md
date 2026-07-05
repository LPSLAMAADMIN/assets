# API Storage Permission Fix Report

**Date:** 2025-07-05  
**Issues Fixed:**
1. `EACCES: permission denied, mkdir '/app/storage/certificates'`
2. `PrismaClientInitializationError: could not locate Query Engine for "linux-musl-openssl-3.0.x"`
3. Health check URL mismatch (`/api/v1/health` → `/health`)
4. Alpine IPv6 resolution (`localhost` → `::1` connection refused)

**Resolution:** ✅ All 7 services healthy  
**Verified locally:** `docker compose ps` — all healthy

---

## Errors and Fixes

### 1. Storage Directory Permission (EACCES)
**Error:** `EACCES: permission denied, mkdir '/app/storage/certificates'`  
**Cause:** CertificateService creates directories at runtime but `/app/storage` didn't exist.  
**Fix:** Create `/app/storage/certificates`, `/app/uploads`, `/app/logs` and `chown` to `lpsapi:nodejs` before `USER` switch.

### 2. Prisma Binary Target Mismatch
**Error:** `Prisma Client could not locate the Query Engine for runtime "linux-musl-openssl-3.0.x"`  
**Cause:** `prisma generate` builds for `linux-musl` but runtime has openssl installed, requiring `linux-musl-openssl-3.0.x`.  
**Fix:** Added `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]` to `prisma/schema.prisma`.

### 3. Wrong Health Check URL
**Error:** Health check returns 404.  
**Cause:** API registers `/health`, not `/api/v1/health`.  
**Fix:** Changed Dockerfile HEALTHCHECK to `http://localhost:4000/health`.

### 4. Alpine IPv6 Resolution
**Error:** `wget: can't connect to remote host: Connection refused` on `[::1]`  
**Cause:** Alpine resolves `localhost` to `::1` (IPv6) but Next.js/Nginx listen on `0.0.0.0` (IPv4 only).  
**Fix:** Changed all health checks to use `127.0.0.1` instead of `localhost`.

---

## Final Container Status

```
NAME                           STATUS
lps-platform-blockchain-1      Up (healthy)
lps-platform-lps-ai-1          Up (healthy)
lps-platform-lps-api-1         Up (healthy)
lps-platform-lps-dashboard-1   Up (healthy)
lps-platform-nginx-1           Up (healthy)
lps-platform-postgres-1        Up (healthy)
lps-platform-redis-1           Up (healthy)
```

---

## Files Modified

| Repository | File | Change |
|-----------|------|--------|
| lps-api | `Dockerfile` | openssl, storage dirs, chown, healthcheck URL, start-period |
| lps-api | `prisma/schema.prisma` | Added `binaryTargets` |
| lps-dashboard | `Dockerfile` | 127.0.0.1 healthcheck |
| lps-dashboard | `app/page.tsx` | Root redirect to /dashboard |
| lps-platform | `docker-compose.yml` | 127.0.0.1 nginx healthcheck |

---

## Final lps-api Dockerfile

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

RUN apk add --no-cache openssl

WORKDIR /app
RUN addgroup -g 1001 -S nodejs && adduser -S lpsapi -u 1001

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./

RUN chown -R lpsapi:nodejs /app/node_modules/.prisma \
    && chown -R lpsapi:nodejs /app/node_modules/@prisma \
    && mkdir -p /app/storage/certificates /app/uploads /app/logs \
    && chown -R lpsapi:nodejs /app/storage /app/uploads /app/logs

USER lpsapi

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:4000/health || exit 1

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
```

---

## Lessons Learned

| Issue | Root Cause | Prevention |
|-------|-----------|------------|
| Storage EACCES | Non-root user can't create dirs | Always pre-create runtime dirs in Dockerfile |
| Prisma engine mismatch | openssl changes target platform | Always specify `binaryTargets` when using Alpine + openssl |
| Healthcheck 404 | URL assumption wrong | Verify actual route before writing healthcheck |
| IPv6 connection refused | Alpine resolves localhost→::1 | Always use 127.0.0.1 in Alpine healthchecks |
