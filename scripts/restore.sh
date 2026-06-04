#!/usr/bin/env bash
# =====================================================================
# Community Hub - Database Restore Script
# =====================================================================
# Usage:
#   ./scripts/restore.sh /path/to/backup.sql.gz
#   ./scripts/restore.sh latest  # Restore most recent
# =====================================================================

set -e

BACKUP_DIR="${BACKUP_DIR:-/opt/backups/community-hub}"
DB_FILE="${1:-$BACKUP_DIR/latest}"

# Resolve "latest" to most recent file
if [ "$DB_FILE" = "latest" ]; then
  DB_FILE=$(ls -t "$BACKUP_DIR"/db-*.sql.gz 2>/dev/null | head -1)
  if [ -z "$DB_FILE" ]; then
    echo "ERROR: No backups found in $BACKUP_DIR"
    exit 1
  fi
  echo "Using latest backup: $DB_FILE"
fi

if [ ! -f "$DB_FILE" ]; then
  echo "ERROR: Backup file not found: $DB_FILE"
  exit 1
fi

# Load env
if [ -f .env ]; then
  set -a; source .env; set +a
fi

DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-community_db}"

echo "================================================"
echo "  ⚠️  WARNING: This will REPLACE the database"
echo "================================================"
echo ""
echo "Database: $DB_NAME"
echo "Backup:   $DB_FILE"
echo "Size:     $(stat -c %s "$DB_FILE" 2>/dev/null || stat -f %z "$DB_FILE") bytes"
echo ""
read -p "Are you sure? Type 'yes' to continue: " confirm

if [ "$confirm" != "yes" ]; then
  echo "Aborted."
  exit 0
fi

echo ""
echo "[1/3] Decompressing..."
TMP_FILE="/tmp/restore-$(date +%s).sql"
gunzip -c "$DB_FILE" > "$TMP_FILE"
echo "      ✓ Decompressed to $TMP_FILE"

echo "[2/3] Dropping and recreating database..."
docker compose exec -T postgres psql -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
docker compose exec -T postgres psql -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;"
echo "      ✓ Database recreated"

echo "[3/3] Restoring..."
docker compose exec -T postgres psql -U "$DB_USER" -d "$DB_NAME" < "$TMP_FILE"
echo "      ✓ Database restored"

# Cleanup
rm -f "$TMP_FILE"

echo ""
echo "================================================"
echo "  ✅ Restore complete"
echo "================================================"
echo ""
echo "Verify with:"
echo "  docker compose exec postgres psql -U $DB_USER -d $DB_NAME -c 'SELECT COUNT(*) FROM \"User\";'"
echo ""
