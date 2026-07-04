# RC2 Operations Checklist

## Pre-Deployment

- [ ] Clone `lps-platform` repository
- [ ] Copy `.env.example` to `.env`
- [ ] Set production database password
- [ ] Set JWT secret (min 32 characters)
- [ ] Set encryption key (32 bytes hex)
- [ ] Configure domain/SSL (if applicable)
- [ ] Verify Docker and Docker Compose installed
- [ ] Verify minimum 8GB RAM available
- [ ] Verify minimum 20GB disk space

---

## Deployment

```bash
# Build and start all services
docker compose up -d --build

# Wait for health checks (allow 60s)
sleep 60
docker compose ps

# Initialize database
docker compose exec lps-api npx prisma migrate deploy
docker compose exec lps-api npx prisma db seed

# Verify health
curl -s http://localhost/api/v1/health | jq
curl -s http://localhost/ai/health | jq
curl -s http://localhost
```

- [ ] All containers show "Up" or "Up (healthy)"
- [ ] API health returns 200
- [ ] AI health returns 200
- [ ] Dashboard loads in browser
- [ ] Database migrations applied
- [ ] Seed data created

---

## Post-Deployment Verification

- [ ] Create test user via API
- [ ] Login and get JWT token
- [ ] Create a property
- [ ] Upload a document
- [ ] Verify AI extraction completes
- [ ] Check blockchain hash stored
- [ ] Generate a report
- [ ] View dashboard pages

---

## Monitoring Setup

- [ ] Configure log aggregation (stdout → ELK/Loki)
- [ ] Set up uptime monitoring (health endpoints)
- [ ] Configure alerting for container restarts
- [ ] Set up disk space alerts (>80%)
- [ ] Monitor database connections
- [ ] Track AI processing queue length

---

## Backup Setup

- [ ] Configure daily database backup (2 AM)
- [ ] Set 30-day retention policy
- [ ] Store backups in separate location
- [ ] Test restore procedure
- [ ] Document backup credentials separately

---

## Security Checklist

- [ ] All default passwords changed
- [ ] JWT secret is unique and random
- [ ] Database not exposed to internet (port 5432 internal only)
- [ ] Redis not exposed to internet (port 6379 internal only)
- [ ] HTTPS configured via nginx (production)
- [ ] Rate limiting enabled on API
- [ ] CORS configured for dashboard domain only
- [ ] Container images scanned for vulnerabilities

---

## Scaling Checklist (When Needed)

- [ ] Add API replicas: `docker compose up -d --scale lps-api=3`
- [ ] Add AI replicas: `docker compose up -d --scale lps-ai=2`
- [ ] Configure nginx upstream for load balancing
- [ ] Add PostgreSQL read replica
- [ ] Enable Redis persistence (AOF)
- [ ] Move to managed database (RDS/Cloud SQL)
- [ ] Migrate blockchain to BSC mainnet/testnet

---

## Rollback Procedure

```bash
# 1. Stop current deployment
docker compose down

# 2. Restore previous version
git checkout <previous_tag>
docker compose up -d --build

# 3. Restore database if schema changed
docker compose exec -T postgres psql -U lps -d lps_platform < backup_before_deploy.sql

# 4. Verify health
docker compose ps
```

---

## Maintenance Windows

| Task | Frequency | Duration | Downtime |
|------|-----------|----------|----------|
| Security patches | Weekly | 5 min | None (rolling) |
| Database backup | Daily | 2 min | None |
| Full system update | Monthly | 15 min | 5 min |
| Load testing | Quarterly | 30 min | None |
| DR test | Monthly | 15 min | None |

---

## Emergency Contacts

| Role | Responsibility |
|------|---------------|
| Platform Owner | Giovanni Fleury |
| Infrastructure | Docker Compose self-hosted |
| Database | PostgreSQL 16 (containerized) |
| Blockchain | BSC / Anvil (local dev) |

---

## Service URLs

| Service | Internal | External |
|---------|----------|----------|
| API | http://lps-api:4000 | http://localhost/api |
| AI | http://lps-ai:8000 | http://localhost/ai |
| Dashboard | http://lps-dashboard:3000 | http://localhost |
| PostgreSQL | postgres:5432 | localhost:5432 |
| Redis | redis:6379 | localhost:6379 |
| Blockchain | blockchain:8545 | localhost:8545 |

---

**Version**: 1.0.0-RC2  
**Last Updated**: 2025-07-04
