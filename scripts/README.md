# Scripts

Utility scripts for Community Hub operations.

## Files

| Script | Purpose | Usage |
|--------|---------|-------|
| `smoke-test.sh` | End-to-end health & API smoke test | `./scripts/smoke-test.sh [BASE_URL]` |
| `backup.sh` | Automated database + uploads backup | `./scripts/backup.sh` (cron: daily 2am) |
| `restore.sh` | Restore database from backup | `./scripts/restore.sh <backup-file>` |

## Setup

```bash
# Make executable (one-time)
chmod +x scripts/*.sh

# Run smoke test
./scripts/smoke-test.sh

# Run smoke test against production
./scripts/smoke-test.sh https://api.communityhub.com
```

## Automated Backups (Cron)

```bash
# Edit crontab
crontab -e

# Add line (runs daily at 2 AM)
0 2 * * * cd /opt/community-hub && /opt/community-hub/scripts/backup.sh >> /var/log/community-hub-backup.log 2>&1

# Verify
crontab -l
```

## Restore Drill (Monthly)

Practice restoring from backup to verify integrity:

```bash
# 1. Create test database
docker compose exec postgres psql -U postgres -d postgres -c "CREATE DATABASE community_drill;"

# 2. Restore to drill database
LATEST=$(ls -t /opt/backups/community-hub/db-*.sql.gz | head -1)
gunzip -c "$LATEST" | docker compose exec -T postgres psql -U postgres -d community_drill

# 3. Verify
docker compose exec postgres psql -U postgres -d community_drill -c \
  "SELECT COUNT(*) FROM \"User\";"

# 4. Drop drill database
docker compose exec postgres psql -U postgres -d postgres -c "DROP DATABASE community_drill;"
```

## Environment Variables

| Var | Default | Description |
|-----|---------|-------------|
| `BACKUP_DIR` | `/opt/backups/community-hub` | Where to store backups |
| `RETENTION_DAYS` | `30` | How long to keep old backups |
| `POSTGRES_USER` | `postgres` | DB user (from .env) |
| `POSTGRES_DB` | `community_db` | DB name (from .env) |

## Monitoring Backups

Add to your monitoring (e.g., Sentry, Grafana, or simple cron monitor):

```bash
# Check backup freshness
find /opt/backups/community-hub -name "db-*.sql.gz" -mmin -1500 | wc -l
# Should be >= 1 (i.e., a backup in the last 25 hours)
```

Alert if zero (no recent backup).
