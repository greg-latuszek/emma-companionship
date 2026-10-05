#!/bin/bash

# Export members + companionship_relations as TRUNCATE + INSERT statements.
# Running the output on a target DB wipes existing rows first.
# Usage: npm run db:wiping_export
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

OUT="db/exports/wiping-seed.sql"
mkdir -p db/exports

{
    printf '%s\n' \
        '-- wiping-seed.sql: TRUNCATE then INSERT' \
        '-- Destroys all existing rows. Safe only on a fresh or dev DB.' \
        "TRUNCATE TABLE $(tables_truncate_list) RESTART IDENTITY CASCADE;" \
        ''
    docker exec "$EXPORT_CONTAINER" pg_dump \
        -U "$EXPORT_DB_USER" -d "$EXPORT_DB_NAME" \
        --data-only --column-inserts --no-privileges --no-owner \
        $(pg_dump_table_flags) \
        | grep -v '^\\'
} > "$OUT"

echo "✅ Written: $OUT"
