#!/bin/bash

# Export all data as TRUNCATE + INSERT statements.
# Running the output on a target DB wipes existing rows first.
# Usage: npm run db:wiping_export
# Output: db/exports/wiping-seed.sql  (gitignored — may contain real data)

set -e

if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

DB_USER=${DB_USER:-devuser}
DB_NAME=${DB_NAME:-emma_companionship_dev}
CONTAINER_NAME="emma_companionship_db"
OUT="db/exports/wiping-seed.sql"

mkdir -p db/exports

{
    printf '%s\n' \
        '-- wiping-seed.sql: TRUNCATE then INSERT' \
        '-- Destroys all existing rows. Safe only on a fresh or dev DB.' \
        'TRUNCATE TABLE companionship_relations, members RESTART IDENTITY CASCADE;' \
        ''
    docker exec "$CONTAINER_NAME" pg_dump \
        -U "$DB_USER" -d "$DB_NAME" \
        --data-only --inserts --no-privileges --no-owner \
        | grep -v '^\\'
} > "$OUT"

echo "✅ Written: $OUT"
