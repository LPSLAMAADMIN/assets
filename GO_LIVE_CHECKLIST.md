# Go-Live Checklist

**Release:** v1.0.0-rc4  
**Date:** 2025-07-05  
**Target:** Production deployment with live customer data

---

## ⛔ Required Before Live Customer Data

These items MUST be completed before the platform accepts real customer data.

### 1. Real TLS Certificate
- [ ] Register production domain
- [ ] Configure DNS A/CNAME records
- [ ] Install Let's Encrypt certificate OR commercial CA certificate
- [ ] Verify HTTPS works end-to-end
- [ ] Confirm HSTS header is active
- [ ] Test certificate auto-renewal (Let's Encrypt)

### 2. Secret Rotation / Vault
- [ ] Deploy HashiCorp Vault (or equivalent secrets manager)
- [ ] Migrate all secrets from `.env` to Vault
- [ ] Configure automatic secret rotation schedule
- [ ] Verify application reads secrets from Vault
- [ ] Remove all plaintext secrets from server filesystem
- [ ] Document secret rotation procedure

### 3. Alert Receiver
- [ ] Choose alerting channel (PagerDuty, Slack, email, or combination)
- [ ] Configure Alertmanager receiver in `alertmanager.yml`
- [ ] Test alert delivery for each severity level (critical, warning, info)
- [ ] Assign on-call rotation
- [ ] Document escalation procedure

### 4. Active DAST Scan
- [ ] Run OWASP ZAP in active scan mode against staging
- [ ] Review all findings (High, Medium, Low)
- [ ] Fix all High-severity findings
- [ ] Document accepted Medium/Low risks
- [ ] Re-scan after fixes

### 5. External Security Review
- [ ] Engage third-party security firm
- [ ] Scope: API endpoints, authentication, authorization, data encryption
- [ ] Provide access to staging environment
- [ ] Receive and review findings report
- [ ] Fix all critical and high findings
- [ ] Obtain sign-off letter

---

## ✅ Completed (RC4 Certified)

### Infrastructure
- [x] Docker Compose production stack
- [x] TLS 1.2/1.3 nginx configuration
- [x] Security headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options)
- [x] Rate limiting
- [x] Self-signed certificates for development

### Monitoring & Observability
- [x] Prometheus metrics collection
- [x] Grafana dashboards
- [x] Alertmanager with 11 alert rules
- [x] Loki + Promtail centralized logging
- [x] postgres-exporter, redis-exporter, node-exporter

### Security
- [x] SQL injection testing — all blocked
- [x] XSS testing — all blocked
- [x] OWASP ZAP passive scan
- [x] No secrets in source code
- [x] Container security scanning
- [x] Dependency vulnerability scanning

### Data Protection
- [x] Encrypted sensitive fields (routing numbers, account numbers)
- [x] Masked data in UI
- [x] RBAC implementation
- [x] Audit logging on all views
- [x] No PII or financial data on blockchain

### Operations
- [x] Automated database backup with verification
- [x] Database migration with rollback
- [x] Health probes for all services
- [x] Resource limits and restart policies
- [x] Disaster recovery procedure documented

### Testing
- [x] 162 unit tests passing
- [x] Load test: 330+ req/s (100 concurrent users)
- [x] Resilience test: services recover after restart
- [x] Backup/restore verified

### CI/CD
- [x] RC3 pipeline (5 jobs) — all passing
- [x] RC4 pipeline (3 jobs) — all passing
- [x] Automated validation on push and PR

---

## Deployment Sequence

```
1. Provision production server (4+ CPU, 8+ GB RAM, 100+ GB SSD)
2. Install Docker Engine and Docker Compose
3. Clone lps-platform repository
4. Run ./scripts/init-secrets.sh
5. Configure .env with production values
6. Install TLS certificate
7. docker compose -f docker-compose.yml -f docker-compose.production.yml up -d
8. ./scripts/migrate.sh deploy
9. ./scripts/health-check.sh
10. Verify Grafana dashboards at :3001
11. Verify Prometheus targets at :9090
12. Test end-to-end workflow manually
13. Enable alert receiver
14. Begin private beta
```

---

## Post-Launch Monitoring

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| API response time | < 200ms p95 | > 500ms |
| Error rate | < 0.1% | > 1% |
| CPU usage | < 50% avg | > 80% |
| Memory usage | < 60% avg | > 85% |
| Disk usage | < 50% | > 80% |
| Database connections | < 50% pool | > 80% pool |
| Backup success | 100% | Any failure |

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| CTO | Giovanni Fleury | | ____________ |
| Security Lead | | | ____________ |
| QA Lead | | | ____________ |
| DevOps Lead | | | ____________ |

---

## Documentation References

- [RC4 Certification](RC4_CERTIFICATION.md) — Production readiness score: 97/100
- [Security Hardening Report](SECURITY_HARDENING_REPORT.md) — TLS, headers, pentest results
- [Infrastructure Guide](INFRASTRUCTURE_GUIDE.md) — Architecture and deployment
- [Monitoring Guide](MONITORING_GUIDE.md) — Prometheus, Grafana, alerts
- [Production Checklist](PRODUCTION_CHECKLIST.md) — Pre/post-deployment tasks
- [Release Notes v1.0.0-rc4](RELEASE_NOTES_v1.0.0-rc4.md) — Full changelog
