#!/bin/bash

# Append rows from db/exports/appending-seed.sql into the target DB.
# Skips rows whose UUID already exists (ON CONFLICT DO NOTHING).
# Usage: npm run db:appending_import
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

SEED="db/exports/appending-seed.sql"

if [ ! -f "$SEED" ]; then
    echo "❌ $SEED not found — run npm run db:appending_export first"
    exit 1
fi

echo "🌱 Appending $SEED → target DB (skipping existing UUIDs)..."
docker exec -i "$EXPORT_CONTAINER" psql "$IMPORT_DATABASE_URL" < "$SEED"
echo "✅ Done."
