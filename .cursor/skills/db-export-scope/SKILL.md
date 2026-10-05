---
name: db-export-scope
description: >
  Guard the DB export/import scripts when the app gains new DB-backed tables.
  Use when adding a new Pg*Repository, a new migration that CREATE TABLEs a
  user-data table, or a new entry in PgRepositoryContainer / RepositoryProvider.
  Answers: does this table belong in the export scripts?
---

# DB export scope guard

## When to load this skill

Load and follow this skill whenever you:

- Create or modify a file matching `src/adapters/db/pg/Pg*Repository.ts`
- Create or modify a file in `db/migrations/`
- Create or modify `src/di/PgRepositoryContainer.ts` or `src/di/RepositoryProvider.ts`
- Touch any file that introduces a new SQL table to the running application

## The two-bucket rule

Every table in this app falls into exactly one bucket:

| Bucket | Owned by | Examples | In export scripts? |
|--------|----------|----------|--------------------|
| **Migration-seeded** | `db/migrations/*.sql` | `_schema_migrations`, `roles` | ❌ Never — migrations recreate them; wiping them destroys schema tracking |
| **User-entered data** | Application at runtime | `members`, `companionship_relations` | ✅ Yes — export scripts must list them |

A table is **user-entered data** when:
- Rows are created/updated/deleted by application code (not only by a migration seed `INSERT`)
- It contains domain entities that need to be ported between environments (dev → staging → prod)
- Losing its rows = losing real work

A table is **migration-seeded** when:
- The migration itself inserts the canonical rows (roles, config, lookup values)
- Rows are static or rebuilt by re-running migrations
- Importing them from another environment would overwrite version tracking or config

## Checklist — run this every time you touch DB-related code

```
[ ] 1. What tables does this change CREATE, or which table does the new
        repository write to?

[ ] 2. Bucket classification: is each table user-entered data or migration-seeded?
        — If migration-seeded: no export change needed. Done.

[ ] 3. For each user-entered data table NOT yet in the export scripts:
        Open db/scripts/export-wiping.sh and db/scripts/export-appending.sh.
        Add  -t <table_name>  to the pg_dump call in both files.
        Add  <table_name>  to the TRUNCATE list in export-wiping.sh
        (order matters: child tables before parent tables to respect FK constraints).

[ ] 4. Re-export both seeds so the files stay current:
        npm run db:wiping_export
        npm run db:appending_export

[ ] 5. Update db/README.md (if it lists the exported tables) and
        docs/current-architecture.md to reflect the new table.
```

## Truncate order reminder

The `TRUNCATE` in `wiping-seed.sql` must list child tables before parent tables,
because PostgreSQL checks FK constraints even within a single TRUNCATE statement
unless `CASCADE` is used. Example:

```sql
-- companionship_relations references members → companion first
TRUNCATE TABLE companionship_relations, members RESTART IDENTITY CASCADE;
```

When adding a table that references `members` (or any other exported table),
prepend it to the list. When adding a standalone table, append it.

## Why positional INSERTs break on schema mismatch

`pg_dump --inserts` generates `INSERT INTO t VALUES (v1, v2, ...)` with no
column names. If local and remote have diverged (a migration applied on one
side but not the other), values shift into the wrong columns — a timestamp can
land in a JSON column, producing a cryptic "invalid input syntax for type json"
error. This is another reason to never include migration-seeded tables in the
export: their schema is guaranteed consistent only after migrations run.

## Export scripts reference

```
db/scripts/export-wiping.sh    — pg_dump source config (EXPORT_* vars)
db/scripts/export-appending.sh — same, with ON CONFLICT DO NOTHING
db/scripts/import-wiping.sh    — TRUNCATE + INSERT into IMPORT_DATABASE_URL
db/scripts/import-appending.sh — INSERT … ON CONFLICT DO NOTHING into IMPORT_DATABASE_URL
```

Required env vars (set in `.env.local`, documented in `.env.example`):

```
EXPORT_CONTAINER   docker container that runs pg_dump / psql
EXPORT_DB_USER     pg role inside that container
EXPORT_DB_NAME     pg database inside that container
IMPORT_DATABASE_URL  full connection URL of the write target
```
