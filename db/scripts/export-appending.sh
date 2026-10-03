#!/bin/bash

# Export all data as INSERT ... ON CONFLICT DO NOTHING statements.
# Running the output on a target DB appends new rows and skips duplicates.
# Usage: npm run db:appending_export
# Output: db/exports/appending-seed.sql  (gitignored — may contain real data)

set -e

if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

DB_USER=${DB_USER:-devuser}
DB_NAME=${DB_NAME:-emma_companionship_dev}
CONTAINER_NAME="emma_companionship_db"
OUT="db/exports/appending-seed.sql"

mkdir -p db/exports

docker exec "$CONTAINER_NAME" pg_dump \
    -U "$DB_USER" -d "$DB_NAME" \
    --data-only --inserts --on-conflict-do-nothing --no-privileges --no-owner \
    | grep -v '^\\' > "$OUT"

echo "✅ Written: $OUT"
