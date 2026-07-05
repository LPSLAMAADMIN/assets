# Infrastructure Guide

## Architecture Overview

```
Internet
    │
    ▼
┌─────────────────────────────────────────────────────────────────┐
│  Nginx (TLS Termination + Reverse Proxy)                        │
│  Port 80 → 301 → HTTPS                                         │
│  Port 443 (TLS 1.2/1.3)                                        │
├─────────────────────────────────────────────────────────────────┤
│  Rate Limiting: 30r/s (API), 5r/s (uploads)                    │
└──────┬─────────────────┬────────────────────┬───────────────────┘
       │ /api/*           │ /ai/*              │ /*
       ▼                  ▼                    ▼
┌────────────┐   ┌────────────────┐   ┌──────────────┐
│  lps-api   │   │    lps-ai      │   │lps-dashboard │
│  :4000     │   │    :8000       │   │   :3000      │
│  Node.js   │   │    FastAPI     │   │   Next.js    │
└─────┬──────┘   └────────────────┘   └──────────────┘
      │
      ├──────────────────┐
      ▼                  ▼
┌──────────┐      ┌──────────┐      ┌──────────────┐
│ postgres │      │  redis   │      │  blockchain  │
│  :5432   │      │  :6379   │      │ (anvil:8545) │
└──────────┘      └──────────┘      └──────────────┘

┌─────────────── Monitoring Stack ────────────────────────────────┐
│  Prometheus :9090  │  Grafana :3001  │  Alertmanager :9093       │
│  Loki :3100        │  Promtail      │  Node Exporter            │
│  Postgres Exporter │  Redis Exporter│                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Deployment Modes

### Development
```bash
docker compose up -d
```
- HTTP only (port 80)
- Default passwords
- No monitoring

### Staging
```bash
docker compose -f docker-compose.yml -f docker-compose.staging.yml up -d
```
- HTTP only with resource limits
- Simulates production constraints

### Production
```bash
# 1. Initialize
./scripts/init-secrets.sh
./scripts/generate-certs.sh  # or configure Let's Encrypt

# 2. Deploy
docker compose -f docker-compose.yml -f docker-compose.production.yml up -d

# 3. Migrate database
docker compose exec lps-api npx prisma migrate deploy
docker compose exec lps-api npx prisma db seed
```
- HTTPS (TLS 1.2/1.3)
- Docker secrets
- Full monitoring stack
- Rate limiting
- Automated backups

---

## Service Configuration

### Environment Variables

| Variable | Service | Description |
|----------|---------|-------------|
| POSTGRES_PASSWORD | postgres | Database password |
| JWT_SECRET | lps-api | Token signing key |
| DATABASE_URL | lps-api | Full PostgreSQL connection string |
| REDIS_URL | lps-api | Redis connection |
| AI_SERVICE_URL | lps-api | AI service endpoint |
| GRAFANA_PASSWORD | grafana | Dashboard admin password |

### Ports

| Port | Service | Access |
|------|---------|--------|
| 80 | Nginx (HTTP→HTTPS redirect) | Public |
| 443 | Nginx (HTTPS) | Public |
| 3001 | Grafana | Internal/VPN |
| 9090 | Prometheus | Internal/VPN |
| 9093 | Alertmanager | Internal |
| 3100 | Loki | Internal |
| 4000 | API (direct) | Internal |
| 8000 | AI (direct) | Internal |
| 5432 | PostgreSQL | Internal |
| 6379 | Redis | Internal |

---

## Scaling

### Horizontal Scaling
```yaml
# Scale API to 3 instances
docker compose up -d --scale lps-api=3

# Scale AI to 2 instances
docker compose up -d --scale lps-ai=2
```

Nginx automatically load balances via Docker DNS.

### Vertical Scaling (resource limits in production.yml)
| Service | CPU | Memory |
|---------|-----|--------|
| lps-api | 2.0 | 1G |
| lps-ai | 4.0 | 4G |
| postgres | 1.0 (staging) | 512M |
| redis | 0.5 | 256M |

---

## Database Operations

### Migrations
```bash
# Apply pending migrations
docker compose exec lps-api npx prisma migrate deploy

# Check migration status
docker compose exec lps-api npx prisma migrate status

# Rollback (uses pre-migration backup)
docker compose run --rm lps-api /scripts/migrate.sh rollback
```

### Backup
```bash
# Manual backup
docker compose run --rm --profile backup backup /scripts/backup.sh

# Automated nightly (add to crontab)
0 2 * * * cd /path/to/lps-platform && docker compose run --rm --profile backup backup /scripts/backup.sh
```

### Restore
```bash
# From backup file
gunzip -c backups/lps_YYYYMMDD_HHMMSS.sql.gz | \
  docker compose exec -T postgres psql -U lps -d lps_platform
```

---

## Certificate Management

### Self-Signed (Development/Staging)
```bash
./scripts/generate-certs.sh
```

### Let's Encrypt (Production)
```bash
# Initial certificate
docker compose --profile certbot run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d yourdomain.com -d www.yourdomain.com \
  --email admin@yourdomain.com --agree-tos

# Auto-renewal (handled by certbot container)
docker compose --profile certbot up -d certbot
```

---

## Troubleshooting

### Service won't start
```bash
docker compose logs <service> --tail=50
docker compose ps --format json | python3 -m json.tool
```

### Database connection issues
```bash
docker compose exec postgres pg_isready -U lps
docker compose exec lps-api npx prisma migrate status
```

### Memory issues
```bash
docker stats --no-stream
docker system df
docker system prune -f  # Clean unused images
```

### Health check
```bash
./scripts/health-check.sh
```

---

**Version**: 1.0.0-RC4  
**Last Updated**: 2025-07-04
