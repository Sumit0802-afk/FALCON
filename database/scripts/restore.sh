#!/usr/bin/env bash
# Restores a dump produced by backup.sh.
#
# Usage:
#   ./scripts/restore.sh backups/falcon_20260909_120000.sql

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <path-to-dump.sql>" >&2
  exit 1
fi

DUMP_FILE="$1"
if [[ ! -f "$DUMP_FILE" ]]; then
  echo "File not found: $DUMP_FILE" >&2
  exit 1
fi

DB_NAME="${DB_NAME:-falcon}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-password}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"

echo "Restoring ${DUMP_FILE} -> ${DB_NAME}@${DB_HOST}:${DB_PORT}"
read -p "This overwrites existing data. Continue? [y/N] " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  echo "Aborted."
  exit 0
fi

mysql \
  --host="$DB_HOST" \
  --port="$DB_PORT" \
  --user="$DB_USER" \
  --password="$DB_PASSWORD" \
  "$DB_NAME" < "$DUMP_FILE"

echo "Restore complete."
