#!/bin/bash

# Wipe the target DB and import from db/exports/wiping-seed.sql.
# TRUNCATES exported tables then inserts all rows.
# Usage: npm run db:wiping_import
# Requires: EXPORT_CONTAINER, EXPORT_DB_USER, EXPORT_DB_NAME,
#           IMPORT_DATABASE_URL  — all in .env.local

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib/exported-tables.sh"

if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

missing=()
[ -z "$EXPORT_CONTAINER"    ] && missing+=("EXPORT_CONTAINER")
[ -z "$EXPORT_DB_USER"      ] && missing+=("EXPORT_DB_USER")
[ -z "$EXPORT_DB_NAME"      ] && missing+=("EXPORT_DB_NAME")
[ -z "$IMPORT_DATABASE_URL" ] && missing+=("IMPORT_DATABASE_URL")

if [ ${#missing[@]} -gt 0 ]; then
    echo "❌ Missing required env vars in .env.local: ${missing[*]}"
    echo "   See .env.example for the EXPORT_* / IMPORT_* section."
    exit 1
fi

SEED="db/exports/wiping-seed.sql"

if [ ! -f "$SEED" ]; then
    echo "❌ $SEED not found — run npm run db:wiping_export first"
    exit 1
fi

check_schema_match

echo "⚠️  This will TRUNCATE $(tables_truncate_list) on: $IMPORT_DATABASE_URL"
echo "   Seed file : $SEED"
read -p "   Type YES to continue: " confirm
if [ "$confirm" != "YES" ]; then
    echo "Aborted."
    exit 0
fi

echo "🌱 Importing $SEED → target DB..."
docker exec -i "$EXPORT_CONTAINER" psql "$IMPORT_DATABASE_URL" < "$SEED"
echo "✅ Done."
