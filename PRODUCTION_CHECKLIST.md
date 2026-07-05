# Production Checklist

## Pre-Deployment

- [ ] All secrets generated (`./scripts/init-secrets.sh`)
- [ ] TLS certificates configured (Let's Encrypt or self-signed)
- [ ] DNS A record pointing to server IP
- [ ] Firewall: only ports 80, 443 open to internet
- [ ] Minimum 8GB RAM, 4 CPU, 50GB disk
- [ ] Docker Engine 24+ and Docker Compose 2.20+ installed
- [ ] Git repository cloned
- [ ] `.env` not committed (verify with `git status`)

## Deployment

```bash
cd lps-platform
./scripts/init-secrets.sh
./scripts/generate-certs.sh   # or configure Let's Encrypt
docker compose -f docker-compose.yml -f docker-compose.production.yml up -d
docker compose exec lps-api npx prisma migrate deploy
docker compose exec lps-api npx prisma db seed
```

- [ ] All containers running (`docker compose ps`)
- [ ] PostgreSQL healthy (`pg_isready`)
- [ ] Redis healthy (`redis-cli ping`)
- [ ] AI service healthy (`curl localhost:8000/health`)
- [ ] API responds (`curl https://yourdomain.com/api/v1/health`)
- [ ] Dashboard loads (`curl https://yourdomain.com`)
- [ ] HTTPS working (certificate valid)
- [ ] HTTP redirects to HTTPS

## Monitoring

- [ ] Prometheus scraping all targets (`localhost:9090/targets`)
- [ ] Grafana accessible (`localhost:3001`)
- [ ] Grafana password changed from default
- [ ] Alertmanager configured (`localhost:9093`)
- [ ] Loki receiving logs
- [ ] Alert webhook endpoint configured
- [ ] Test alert fires and resolves correctly

## Security

- [ ] No default passwords in production
- [ ] JWT secret is random (≥32 characters)
- [ ] Database not exposed to internet
- [ ] Redis not exposed to internet
- [ ] Rate limiting active (test: rapid requests get 429)
- [ ] Security headers present (check with curl -I)
- [ ] HSTS enabled
- [ ] Container images updated (no critical CVEs)
- [ ] CORS configured for production domain only

## Backup

- [ ] Nightly backup cron configured
- [ ] Backup script tested manually
- [ ] Restore procedure tested
- [ ] Backups stored in separate location
- [ ] Backup monitoring alert active (24h threshold)
- [ ] 30-day retention verified

## Performance

- [ ] API response time < 100ms (P95)
- [ ] AI processing time < 5s per document
- [ ] Dashboard loads in < 3s
- [ ] Database query time < 50ms (P95)
- [ ] No memory leaks after 24h runtime

## Operational Readiness

- [ ] Runbook documented (this checklist + guides)
- [ ] On-call rotation defined
- [ ] Incident response procedure documented
- [ ] Rollback procedure tested
- [ ] Contact information for all team members
- [ ] Escalation path defined

## Post-Deployment Verification

- [ ] Create test property end-to-end
- [ ] Upload document → AI extraction succeeds
- [ ] Create escrow → verification completes
- [ ] Run underwriting → report generates
- [ ] Blockchain hash stored
- [ ] PDF report downloads correctly
- [ ] Audit log entries appear
- [ ] Monitoring shows traffic

## Ongoing Maintenance

| Task | Frequency |
|------|-----------|
| Check monitoring dashboards | Daily |
| Review alert history | Daily |
| Verify backup success | Daily |
| Security patch containers | Weekly |
| npm/pip audit | Weekly |
| Certificate renewal check | Monthly |
| Load test | Quarterly |
| Disaster recovery drill | Quarterly |
| Penetration test | Annually |

---

**Version**: 1.0.0-RC4  
**Last Updated**: 2025-07-04
