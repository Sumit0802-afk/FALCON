#!/usr/bin/env bash
# Dumps the falcon MySQL database to database/backups/falcon_<timestamp>.sql
#
# Usage:
#   ./scripts/backup.sh                 # dumps from the docker-compose container
#   DB_HOST=prod-host DB_USER=... ./scripts/backup.sh   # dumps from a remote DB

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="$SCRIPT_DIR/../backups"
mkdir -p "$BACKUP_DIR"

DB_NAME="${DB_NAME:-falcon}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-password}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"

TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
OUT_FILE="$BACKUP_DIR/falcon_${TIMESTAMP}.sql"

echo "Dumping ${DB_NAME}@${DB_HOST}:${DB_PORT} -> ${OUT_FILE}"

mysqldump \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --user="$DB_USER" \
  --password="$DB_PASSWORD" \
  --single-transaction \
  --routines \
  --triggers \
  "$DB_NAME" > "$OUT_FILE"

echo "Done. $(du -h "$OUT_FILE" | cut -f1) written."
