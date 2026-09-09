# Database Setup & Development

This document describes the local PostgreSQL database setup using Docker for `emma-companionship`.

## Prerequisites

- Docker and Docker Compose installed
- `.env.local` file created (see Configuration section)
- `psql` CLI tool installed (for manual queries)

## Configuration

### `.env.local` File

The `.env.local` file contains database credentials and connection strings. **This file is in `.gitignore` and should never be committed.**

**Create `.env.local`:**

```bash
# Local Development Database Configuration
DB_USER=devuser
DB_PASSWORD=devpassword
DB_HOST=localhost
DB_PORT=5432
DB_NAME=emma_companionship_dev
DB_NAME_TEST=emma_companionship_test

DATABASE_URL=postgresql://devuser:devpassword@localhost:5432/emma_companionship_dev
DATABASE_TEST_URL=postgresql://devuser:devpassword@localhost:5432/emma_companionship_test

NODE_ENV=development
```

## Quick Start

### 1. Start PostgreSQL Container

```bash
npm run db:start
```

This command:
- Starts the PostgreSQL container in the background
- Waits 2 seconds for the database to be ready
- Creates the development and test databases
- Shows: `✅ Database creation completed`

### 2. Run Migrations

**For development database:**

```bash
npm run db:migrate:dev
```

**For test database:**

```bash
npm run db:migrate:test
```

### 3. Verify Database Connection

```bash
npm run db:psql -c "\dt"
```

This lists all tables. After migrations, you should see:
- `_schema_migrations`
- `members` (coming in COMMIT 2)
- `blacklist` (coming in COMMIT 2)
- etc.

## Available Commands

| Command | Purpose |
|---------|---------|
| `npm run db:start` | Start PostgreSQL container and create databases |
| `npm run db:stop` | Stop PostgreSQL container |
| `npm run db:create` | Create dev and test databases (run separately if needed) |
| `npm run db:migrate:dev` | Run all migrations on development database |
| `npm run db:migrate:test` | Run all migrations on test database |
| `npm run db:psql` | Connect to development database via psql CLI |
| `npm run db:reset` | Stop and restart containers (fresh state) |
| `npm run db:logs` | Follow PostgreSQL container logs |

## Migration Files

Migrations are stored in `db/migrations/` and executed in alphabetical order:

```
db/migrations/
├── 001_init.sql                    # Extensions + migration tracking
├── 002_members_table.sql           # Members table with auth fields
├── 003_oauth_identities.sql        # OAuth identities (optional)
├── 004_blacklist_security.sql      # Blacklist + security events
├── 005_roles_access_control.sql    # Roles + approval audit + auth events
├── 006_companionship.sql           # Companionship relationships
├── 007_approval_workflow.sql       # Approval workflow tables
└── 008_two_factor_auth.sql         # 2FA table (future-proofed)
```

**To add a new migration:**

1. Create a new SQL file: `db/migrations/009_my_feature.sql`
2. Write your schema changes
3. Run `npm run db:migrate:dev` to apply

## Container Management

### View Logs

```bash
npm run db:logs
```

### Connect to Running Container

```bash
docker exec -it emma_companionship_db psql -U devuser -d emma_companionship_dev
```

### Stop Container

```bash
npm run db:stop
```

### Full Reset (Delete All Data)

```bash
npm run db:reset
```

This stops the container, removes the data volume, and restarts everything fresh.

## Testing with Separate Database

Tests use a separate database (`emma_companionship_test`) to avoid affecting development data:

```bash
# Ensure test database has latest schema
npm run db:migrate:test

# Run tests (they connect to DATABASE_TEST_URL)
npm test
```

## Troubleshooting

### "Connection refused" error

**Problem:** Docker container isn't running or hasn't started yet.

**Solution:**

```bash
npm run db:stop
npm run db:start
```

### "Database already exists" error

This is normal if you run `npm run db:start` multiple times. Databases are created only if they don't exist.

### "Permission denied" when running scripts

Make sure scripts are executable:

```bash
chmod +x db/scripts/create-databases.sh
chmod +x db/migrate.sh
```

### View Database Contents

```bash
npm run db:psql
# Then in psql prompt:
\dt                    # List all tables
\d members             # Describe members table
SELECT * FROM members; # View data
\q                     # Quit psql
```

## Development Workflow

### Before Development

```bash
npm run db:start
npm run db:migrate:dev
```

### After Adding New Migration

```bash
npm run db:migrate:dev
npm run db:migrate:test  # Keep test DB in sync
```

### Reset Everything

```bash
npm run db:reset
npm run db:migrate:dev
```

## Security Notes

- ⚠️ `.env.local` contains database passwords. Keep it local and never commit.
- ⚠️ Default credentials (`devuser`/`devpassword`) are for local development only.
- ⚠️ Change credentials in production environments.
- ✅ `.env*` is in `.gitignore` for protection.

## Next Steps

- **COMMIT 2:** Create SQL migration files (002_members_table.sql, etc.)
- **COMMIT 2:** Write database integration tests
- **COMMIT 3+:** Wire up authentication logic using this database
