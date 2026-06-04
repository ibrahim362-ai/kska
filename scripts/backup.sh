#!/usr/bin/env bash
# =====================================================================
# Community Hub - Database Backup Script
# =====================================================================
# Usage: ./scripts/backup.sh
# Cron: 0 2 * * * /opt/community-hub/scripts/backup.sh
# =====================================================================

set -e

BACKUP_DIR="${BACKUP_DIR:-/opt/backups/community-hub}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
DATE_LABEL=$(date +%Y-%m-%d)
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Load env vars
if [ -f .env ]; then
  set -a; source .env; set +a
fi

DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-community_db}"

mkdir -p "$BACKUP_DIR"

echo "=== Backup started at $(date) ==="

# =====================================================================
# 1. Database dump
# =====================================================================
echo "[1/3] Dumping database..."
DB_FILE="$BACKUP_DIR/db-$TIMESTAMP.sql.gz"

docker compose exec -T postgres pg_dump \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --no-owner \
  --clean \
  --if-exists \
  | gzip > "$DB_FILE"

DB_SIZE=$(stat -c %s "$DB_FILE" 2>/dev/null || stat -f %z "$DB_FILE")
echo "      ✓ Database dumped: $DB_FILE ($(numfmt --to=iec $DB_SIZE 2>/dev/null || echo "$DB_SIZE bytes"))"

# =====================================================================
# 2. Uploads (Cloudinary primary, but local backups of any)
# =====================================================================
echo "[2/3] Backing up uploads..."
UPLOAD_DIR="$BACKUP_DIR/uploads-$TIMESTAMP"
if [ -d "./backend/uploads" ] && [ -n "$(ls -A ./backend/uploads 2>/dev/null)" ]; then
  cp -r ./backend/uploads "$UPLOAD_DIR"
  UPLOAD_SIZE=$(du -sh "$UPLOAD_DIR" | cut -f1)
  echo "      ✓ Uploads backed up: $UPLOAD_DIR ($UPLOAD_SIZE)"
else
  echo "      - No local uploads (using Cloudinary)"
fi

# =====================================================================
# 3. Verify backup integrity
# =====================================================================
echo "[3/3] Verifying backup..."
if [ -f "$DB_FILE" ] && [ -s "$DB_FILE" ]; then
  # Quick test: can we read the gzip file?
  if gunzip -t "$DB_FILE" 2>/dev/null; then
    echo "      ✓ Backup file is valid"
  else
    echo "      ✗ Backup file appears corrupted!"
    exit 1
  fi
else
  echo "      ✗ Backup file is empty or missing!"
  exit 1
fi

# =====================================================================
# 4. Cleanup old backups
# =====================================================================
echo "[Cleanup] Removing backups older than $RETENTION_DAYS days..."
DELETED=$(find "$BACKUP_DIR" -maxdepth 1 -type f -mtime +$RETENTION_DAYS -name 'db-*.sql.gz' -delete -print | wc -l)
echo "      ✓ Removed $DELETED old backup(s)"

# Also clean up uploads
if [ -d "$BACKUP_DIR" ]; then
  find "$BACKUP_DIR" -maxdepth 1 -type d -name 'uploads-*' -mtime +$RETENTION_DAYS -exec rm -rf {} \; 2>/dev/null || true
fi

# =====================================================================
# 5. Summary
# =====================================================================
echo ""
echo "=== Backup complete ==="
echo "Database: $DB_FILE"
[ -d "$UPLOAD_DIR" ] && echo "Uploads:  $UPLOAD_DIR"
echo "Retention: $RETENTION_DAYS days"
echo ""

# List current backups
echo "Recent backups:"
ls -lht "$BACKUP_DIR"/db-*.sql.gz 2>/dev/null | head -5 | awk '{print "  " $9, "(" $5 " bytes,", $6, $7, $8 ")"}'
