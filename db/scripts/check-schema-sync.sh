#!/bin/bash

# Show whether the exported tables have identical schemas on EXPORT and IMPORT DBs.
# Usage: npm run db:check_schema_sync
# Requires: EXPORT_CONTAINER, EXPORT_DB_USER, EXPORT_DB_NAME,
#           IMPORT_DATABASE_URL  — all in .env.local

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

echo "Tables checked: ${EXPORTED_TABLES[*]}"
echo "EXPORT: $EXPORT_CONTAINER / $EXPORT_DB_NAME"
echo "IMPORT: $IMPORT_DATABASE_URL"
echo ""

check_schema_match
