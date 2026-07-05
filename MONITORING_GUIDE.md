# Monitoring Guide

## Stack Components

| Component | Role | Port | URL |
|-----------|------|------|-----|
| Prometheus | Metrics collection & alerting | 9090 | http://localhost:9090 |
| Grafana | Dashboards & visualization | 3001 | http://localhost:3001 |
| Alertmanager | Alert routing & deduplication | 9093 | http://localhost:9093 |
| Loki | Log aggregation | 3100 | http://localhost:3100 |
| Promtail | Log shipping (Docker → Loki) | 9080 | — |
| Postgres Exporter | Database metrics | 9187 | — |
| Redis Exporter | Cache metrics | 9121 | — |
| Node Exporter | System metrics | 9100 | — |

---

## Accessing Dashboards

### Grafana
- **URL**: http://localhost:3001
- **Default credentials**: admin / admin (change on first login)
- **Datasources**: Prometheus, Loki (auto-provisioned)

### Prometheus
- **URL**: http://localhost:9090
- **Targets**: http://localhost:9090/targets
- **Alerts**: http://localhost:9090/alerts

---

## Alert Rules

### Service Health
| Alert | Condition | Severity | Fires After |
|-------|-----------|----------|-------------|
| ServiceDown | up == 0 | Critical | 1 min |
| HighErrorRate | 5xx rate > 5% | Warning | 2 min |
| HighLatency | P95 > 2s | Warning | 5 min |

### Infrastructure
| Alert | Condition | Severity | Fires After |
|-------|-----------|----------|-------------|
| HighMemoryUsage | > 90% | Warning | 5 min |
| HighCPUUsage | > 90% | Warning | 5 min |
| DiskSpaceLow | < 10% free | Critical | 5 min |

### Database
| Alert | Condition | Severity | Fires After |
|-------|-----------|----------|-------------|
| PostgresDown | pg_up == 0 | Critical | 30s |
| PostgresHighConnections | > 80 | Warning | 5 min |
| PostgresReplicationLag | > 30s | Warning | 5 min |

### Redis
| Alert | Condition | Severity | Fires After |
|-------|-----------|----------|-------------|
| RedisDown | redis_up == 0 | Critical | 30s |
| RedisHighMemory | > 90% | Warning | 5 min |

### Backup
| Alert | Condition | Severity | Fires After |
|-------|-----------|----------|-------------|
| BackupFailed | No success in 24h | Critical | 1 hour |

---

## Key Metrics

### API Performance
```promql
# Request rate
rate(http_requests_total{job="lps-api"}[5m])

# Error rate
rate(http_requests_total{job="lps-api",status=~"5.."}[5m])

# Latency P95
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job="lps-api"}[5m]))
```

### AI Service
```promql
# Document processing rate
rate(documents_processed_total[5m])

# AI inference latency
histogram_quantile(0.95, rate(ai_inference_duration_seconds_bucket[5m]))
```

### Database
```promql
# Active connections
pg_stat_activity_count

# Transaction rate
rate(pg_stat_database_xact_commit{datname="lps_platform"}[5m])

# Cache hit ratio
pg_stat_database_blks_hit / (pg_stat_database_blks_hit + pg_stat_database_blks_read)
```

### System
```promql
# CPU usage
100 - (avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Memory usage
(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes

# Disk usage
1 - (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"})
```

---

## Log Queries (Grafana → Explore → Loki)

```logql
# All API errors
{service="lps-api"} |= "error"

# Slow requests (> 1s)
{service="lps-api"} | json | request_time > 1

# AI document processing
{service="lps-ai"} |= "document"

# Authentication failures
{service="lps-api"} |= "unauthorized"

# Database errors
{service="lps-api"} |= "prisma" |= "error"
```

---

## On-Call Procedures

### Alert: ServiceDown
1. Check `docker compose ps` for container status
2. Check `docker compose logs <service> --tail=50` for errors
3. Attempt restart: `docker compose restart <service>`
4. If persistent: rebuild: `docker compose up -d --build <service>`
5. Escalate if not recovered in 10 minutes

### Alert: HighMemoryUsage
1. Check `docker stats --no-stream`
2. Identify memory-heavy container
3. For AI: may need to reduce concurrent workers
4. For Postgres: check for long-running queries
5. Consider scaling vertically

### Alert: BackupFailed
1. Check backup container logs
2. Verify disk space: `df -h`
3. Run manual backup: `docker compose run --rm --profile backup backup /scripts/backup.sh`
4. Verify database is accessible
5. Check network connectivity to backup storage

---

## Adding Custom Metrics

### API (Express/Node.js)
```typescript
import { collectDefaultMetrics, register } from 'prom-client';
collectDefaultMetrics();
app.get('/api/v1/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

### AI (FastAPI/Python)
```python
from prometheus_client import make_asgi_app
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)
```

---

**Version**: 1.0.0-RC4  
**Last Updated**: 2025-07-04
