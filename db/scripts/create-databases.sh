#!/bin/bash

# Create development and test databases using docker exec
# Usage: npm run db:create

set -e

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Database connection details
DB_USER=${DB_USER:-devuser}
DB_PASSWORD=${DB_PASSWORD:-devpassword}
DB_NAME=${DB_NAME:-emma_companionship_dev}
DB_NAME_TEST=${DB_NAME_TEST:-emma_companionship_test}
CONTAINER_NAME="emma_companionship_db"

echo "🗄️  Creating databases..."

# Wait for PostgreSQL container to be healthy
echo "⏳ Waiting for PostgreSQL container to be ready..."
for i in {1..30}; do
    if docker exec "$CONTAINER_NAME" pg_isready -U "$DB_USER" >/dev/null 2>&1; then
        echo "✅ PostgreSQL is ready"
        break
    fi
    echo "  Attempt $i/30..."
    sleep 1
done

# Create development database
echo "📍 Creating development database: $DB_NAME"
docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 && echo "  ✅ Already exists" || (
    docker exec "$CONTAINER_NAME" psql -U "$DB_USER" \
        -c "CREATE DATABASE $DB_NAME ENCODING 'UTF8' LC_COLLATE 'en_US.UTF-8' LC_CTYPE 'en_US.UTF-8';"
    echo "  ✅ Created"
)

# Create test database
echo "📍 Creating test database: $DB_NAME_TEST"
docker exec "$CONTAINER_NAME" psql -U "$DB_USER" -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME_TEST'" | grep -q 1 && echo "  ✅ Already exists" || (
    docker exec "$CONTAINER_NAME" psql -U "$DB_USER" \
        -c "CREATE DATABASE $DB_NAME_TEST ENCODING 'UTF8' LC_COLLATE 'en_US.UTF-8' LC_CTYPE 'en_US.UTF-8';"
    echo "  ✅ Created"
)

echo "✅ Database creation completed"
