# Database setup and operator scripts

Local PostgreSQL (Docker) plus Python stdlib scripts for migrate / export / import.

## Prerequisites

- **Docker** and Docker Compose
- **Node.js** (for `npm run db:*` and the Next app)
- **Python 3.10+** as `python3` on PATH — required by DB operator scripts (stdlib only; no pip install)

## Configuration (env profiles)

Do **not** put everything in one `.env.local`. Use discrete parts (no hand-maintained `DATABASE_URL` for scripts).

| File | Purpose |
|------|---------|
| `.env.local` | Auth / shared secrets; optional `SOURCE_PROFILE` / `TARGET_PROFILE` |
| `.env.development` | Local Docker `DB_*` — Next loads this on `next dev`; export SOURCE default |
| `.env.staging` | Cloud staging `DB_*` — import TARGET default |
| `.env.production` | Cloud production `DB_*` |

Canonical keys and examples: see [`.env.example`](../.env.example).

**Sensitive keys for staging/production:** you may leave `DB_USER`, `DB_PASSWORD`, and `DB_HOST` blank in the profile file 
and export them in the shell instead (keeps secrets out of files AI tools can read). 
A non-empty value in the file still wins over the shell.

```bash
# example — leading space so the export is not stored in shell history
 export DB_PASSWORD='…'
 export DB_USER='…'
 export DB_HOST='…'
```

Never commit `.env*` (gitignored except `.env.example`).

## Local quick start

```bash
# Auth secrets in .env.local; DB_* in .env.development (from .env.example)
npm run db:start          # postgres container + create databases
npm run db:migrate:dev    # apply db/migrations/*.sql
npm run dev               # Next uses .env.local + .env.development
```

**Port trap:** Compose publishes `${DB_PORT:-5433}:5432`. Set the same `DB_PORT` in `.env.development` that Compose uses (default **5433**).

## Available commands

| Command | Purpose |
|---------|---------|
| `npm run db:start` | Start Postgres and create databases |
| `npm run db:stop` | Stop Compose services |
| `npm run db:create` | Create dev + test databases |
| `npm run db:migrate:dev` | Migrations on development DB |
| `npm run db:migrate:test` | Migrations on test DB |
| `npm run db:psql` | Interactive psql in the Docker container |
| `npm run db:reset` | Stop and start fresh |
| `npm run db:logs` | Follow Postgres logs |
| `npm run db:wiping_export` | Export seed with TRUNCATE header |
| `npm run db:appending_export` | Export seed with `ON CONFLICT DO NOTHING` |
| `npm run db:wiping_import` | Import wiping seed into TARGET (asks `YES`) |
| `npm run db:appending_import` | Append seed into TARGET |
| `npm run db:check_schema_sync` | Compare exported-table columns SOURCE vs TARGET |

Flags and modes:

```bash
npm run db:wiping_export -- --help
npm run db:appending_import -- --help
npm run db:check_schema_sync -- --help
```

Export/import wrappers call `export_db.py` / `import_db.py` with `--mode` already set. Defaults: `SOURCE_PROFILE=development`, `TARGET_PROFILE=staging` (override in `.env.local` or the environment).

Logic lives in `db/scripts/db_scripts/` (Python). Thin `.sh` files only check for `python3` and exec the client.

Unit tests (no Docker):

```bash
PYTHONPATH=db/scripts python3 -m unittest discover -s db/scripts/db_scripts/tests -v
```

## Export / import between environments

Typical flow (local Docker → staging):

1. `npm run db:wiping_export` or `db:appending_export` (reads SOURCE)
2. Ensure TARGET schema matches: `npm run db:check_schema_sync`
3. `npm run db:wiping_import` or `db:appending_import` (writes TARGET; wiping requires typing `YES`)

Scripts log host/user/database/container only — **not** passwords or full connection URLs.

Exported tables are listed in `db/scripts/db_scripts/exported_tables.py`. When adding a user-data table, follow `.cursor/skills/db-export-scope/SKILL.md`.

## Migrations

SQL files in `db/migrations/` run in sorted filename order via `npm run db:migrate:dev` / `db:migrate:test`.

To add a migration: create `db/migrations/00N_….sql`, then run both migrate commands so test DB stays in sync.

## Troubleshooting

**Connection refused** — container not up: `npm run db:stop && npm run db:start`.

**python3 not found** — install Python 3.10+ so `python3 --version` works.

**Database already exists** — normal on repeated `db:start`; create is idempotent.

**Schema mismatch on import** — apply pending migrations on the TARGET, then retry `db:check_schema_sync`.

Interactive SQL:

```bash
npm run db:psql
```

## Security

- ⚠️ Never commit `.env.local` or `.env.development` / `.env.staging` / `.env.production`.
- ⚠️ Prefer shell exports for cloud `DB_USER` / `DB_PASSWORD` / `DB_HOST` (see root `README.md` Security section).
- Default Docker credentials (`devuser` / `devpassword`) are local-only.
