#!/bin/bash

# Wipe the target DB and import from db/exports/wiping-seed.sql.
# TRUNCATES members and companionship_relations then inserts all rows.
# Usage: npm run db:wiping_import
# Requires: IMPORT_DATABASE_URL, EXPORT_CONTAINER in .env.local

set -e

if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

missing=()
[ -z "$IMPORT_DATABASE_URL" ] && missing+=("IMPORT_DATABASE_URL")
[ -z "$EXPORT_CONTAINER"    ] && missing+=("EXPORT_CONTAINER")

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

echo "⚠️  This will TRUNCATE members and companionship_relations on: $IMPORT_DATABASE_URL"
read -p "   Type YES to continue: " confirm
if [ "$confirm" != "YES" ]; then
    echo "Aborted."
    exit 0
fi

echo "🌱 Importing $SEED → target DB..."
docker exec -i "$EXPORT_CONTAINER" psql "$IMPORT_DATABASE_URL" < "$SEED"
echo "✅ Done."
