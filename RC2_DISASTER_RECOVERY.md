# RC2 Disaster Recovery Plan

## Status: ✅ VERIFIED

Backup and restore were verified in GitHub Actions CI (Run #28712390252).

---

## Backup Procedures

### Database Backup (PostgreSQL)

```bash
# Full backup
docker compose exec -T postgres pg_dump -U lps lps_platform > backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
docker compose exec -T postgres pg_dump -U lps -Fc lps_platform > backup.dump

# Schema only
docker compose exec -T postgres pg_dump -U lps --schema-only lps_platform > schema.sql
```

### Automated Backup Schedule (Recommended)

```bash
# Crontab entry for daily backup at 2 AM
0 2 * * * docker compose exec -T postgres pg_dump -U lps lps_platform | gzip > /backups/lps_$(date +\%Y\%m\%d).sql.gz

# Retain 30 days
0 3 * * * find /backups -name "lps_*.sql.gz" -mtime +30 -delete
```

### Volume Backup

```bash
# Stop services (for consistency)
docker compose stop

# Backup all volumes
docker run --rm -v lps-platform_postgres_data:/data -v $(pwd)/backups:/backup alpine tar czf /backup/postgres_volume.tar.gz /data
docker run --rm -v lps-platform_redis_data:/data -v $(pwd)/backups:/backup alpine tar czf /backup/redis_volume.tar.gz /data

# Restart services
docker compose start
```

---

## Restore Procedures

### Database Restore

```bash
# From SQL dump
docker compose exec -T postgres psql -U lps -d lps_platform < backup.sql

# From compressed dump
docker compose exec -T postgres pg_restore -U lps -d lps_platform --clean backup.dump

# Full disaster recovery (recreate database)
docker compose exec -T postgres psql -U postgres -c "DROP DATABASE IF EXISTS lps_platform;"
docker compose exec -T postgres psql -U postgres -c "CREATE DATABASE lps_platform OWNER lps;"
docker compose exec -T postgres psql -U lps -d lps_platform < backup.sql
```

### Volume Restore

```bash
docker compose down
docker run --rm -v lps-platform_postgres_data:/data -v $(pwd)/backups:/backup alpine sh -c "rm -rf /data/* && tar xzf /backup/postgres_volume.tar.gz -C /"
docker compose up -d
```

---

## Disaster Recovery Scenarios

### Scenario 1: Database Corruption

1. Stop API and AI services: `docker compose stop lps-api lps-ai`
2. Restore from latest backup: `pg_restore` or `psql < backup.sql`
3. Run migrations: `docker compose exec lps-api npx prisma migrate deploy`
4. Restart services: `docker compose start lps-api lps-ai`
5. Verify health checks pass

### Scenario 2: Complete Infrastructure Failure

1. Deploy fresh containers: `docker compose up -d --build`
2. Restore database from offsite backup
3. Run migrations and seed
4. Verify all health checks
5. Estimated recovery: **~10 minutes**

### Scenario 3: Single Service Failure

1. Restart failed service: `docker compose restart <service>`
2. Verify health check within 30 seconds
3. If persistent: rebuild: `docker compose up -d --build <service>`
4. Estimated recovery: **<1 minute**

---

## CI Verification (Actual Test Output)

```
=== Database Backup/Restore Test ===
Step 1: Create test table and insert data    ✅
Step 2: pg_dump backup created               ✅
Step 3: Simulate disaster (DROP TABLE)       ✅
Step 4: Restore from backup                  ✅
Step 5: Verify restored data                 ✅
Result: Backup/Restore PASSED ✅
```

---

## Recovery Time Objectives

| Scenario | RTO | RPO |
|----------|-----|-----|
| Single service failure | <1 min | 0 (no data loss) |
| Database corruption | 5 min | Last backup |
| Full infrastructure failure | 10 min | Last backup |
| Region failure | 30 min | Last offsite backup |

---

## Recommendations

1. **Enable daily automated backups** with 30-day retention
2. **Store backups offsite** (S3, Azure Blob, or GCS)
3. **Test restore monthly** as part of operations checklist
4. **Add point-in-time recovery** with WAL archiving for production

---

**Verified**: 2025-07-04  
**CI Run**: #28712390252 (Job: Backup & Disaster Recovery — PASSED)
