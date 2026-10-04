#!/bin/bash

# Export members + companionship_relations as INSERT ... ON CONFLICT DO NOTHING statements.
# Running the output on a target DB appends new rows and skips duplicates.
# Usage: npm run db:appending_export
# Requires: EXPORT_CONTAINER, EXPORT_DB_USER, EXPORT_DB_NAME in .env.local

set -e

if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

missing=()
[ -z "$EXPORT_CONTAINER" ] && missing+=("EXPORT_CONTAINER")
[ -z "$EXPORT_DB_USER"   ] && missing+=("EXPORT_DB_USER")
[ -z "$EXPORT_DB_NAME"   ] && missing+=("EXPORT_DB_NAME")

if [ ${#missing[@]} -gt 0 ]; then
    echo "❌ Missing required env vars in .env.local: ${missing[*]}"
    echo "   See .env.example for the EXPORT_* section."
    exit 1
fi

OUT="db/exports/appending-seed.sql"
mkdir -p db/exports

docker exec "$EXPORT_CONTAINER" pg_dump \
    -U "$EXPORT_DB_USER" -d "$EXPORT_DB_NAME" \
    --data-only --inserts --on-conflict-do-nothing --no-privileges --no-owner \
    -t members -t companionship_relations \
    | grep -v '^\\' > "$OUT"

echo "✅ Written: $OUT"
