#!/bin/bash

# Database migration runner using docker exec
# Usage:
#   npm run db:migrate:dev   - Run migrations on development database
#   npm run db:migrate:test  - Run migrations on test database

set -e

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Determine target database
TARGET_DB=${1:-${DB_NAME}}

if [ -z "$TARGET_DB" ]; then
    echo "Error: Target database name not specified"
    echo "Usage: npm run db:migrate [database_name]"
    exit 1
fi

DB_USER=${DB_USER:-devuser}
CONTAINER_NAME="emma_companionship_db"

echo "🔄 Running migrations on database: $TARGET_DB"
echo "📁 Migrations directory: db/migrations/"

# Check if migrations directory exists
if [ ! -d "db/migrations" ]; then
    echo "❌ Error: db/migrations directory not found"
    exit 1
fi

# Run each migration file in order
for migration_file in db/migrations/*.sql; do
    if [ -f "$migration_file" ]; then
        echo "▶️  Executing: $(basename $migration_file)"
        
        # Read migration content and execute via docker exec
        MIGRATION_CONTENT=$(<"$migration_file")
        
        docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$TARGET_DB" <<< "$MIGRATION_CONTENT"
        
        if [ $? -eq 0 ]; then
            echo "✅ $(basename $migration_file) completed"
        else
            echo "❌ Error executing $(basename $migration_file)"
            exit 1
        fi
    fi
done

echo "✅ All migrations completed successfully on $TARGET_DB"
