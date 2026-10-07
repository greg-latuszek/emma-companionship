# Python-based DB scripts

Working plan (throwaway). Delete after live docs match. Do not treat as backlog after the slice ships.

## Operator path (done looks like)

1. Operator has Python 3.10+ on PATH as `python3` (no venv, no pip install for this).
2. Profile files stay as today: `.env.development` / `.env.staging` / `.env.production` with discrete `DB_*`; `.env.local` holds `SOURCE_PROFILE` / `TARGET_PROFILE` + auth secrets.
3. Existing npm scripts still work unchanged in name:
   - `npm run db:create`
   - `npm run db:migrate:dev` / `db:migrate:test`
   - `npm run db:wiping_export` / `db:appending_export`
   - `npm run db:wiping_import` / `db:appending_import`
   - `npm run db:check_schema_sync`
4. Each command supports `--help` via the Python entrypoint (bash wrapper passes `"$@"`).
5. Missing `python3` → short install hint, exit 1. No silent fallback to fat bash.
6. Logs never print passwords or full composed URLs (host/user/db/container only).
7. Unit tests cover profile load, URL compose, and schema-diff helpers without Docker.
8. A cloner reading `README.md` / `db/README.md` knows: Python 3.10+, profile files, and which `npm run db:*` commands to use for local DB and export/import.

## Scope by exclusion

**In**

- Shared Python package under `db/scripts/` (stdlib only).
- Thin client scripts: `export_db.py`, `import_db.py` (each with `--mode wiping|appending`), `check_schema_sync.py`, `create_databases.py`, plus migrate entry used by `db/migrate.sh`.
- Thin bash wrappers (`export-wiping.sh`, …) that only check `python3` and `exec` the matching `.py` **with the mode baked in** so npm script names stay stable.
- `unittest` for pure logic (no Docker in CI requirement for this slice).
- Doc touch: `db-export-scope` skill, `docs/current-architecture.md`, root `README.md` + `db/README.md` for cloners (chunk 7–8). (`.env.example` profile schema already committed — only amend if Python requirements need a line.)

**Out**

- pip / poetry / pyproject / venv for these scripts.
- Replacing `psql` / `pg_dump` with a Python DB driver (`psycopg`).
- Changing profile file layout or renaming `DB_*` keys.
- Next.js / `pg.ts` / Vitest app tests.
- Secret managers, staging “switch app profile” helper.
- One mega CLI (`python -m db_scripts …` with many subcommands). Mode flags on the two near-duplicate clients are fine.
**Must not grow “while we are here”**

- `EXPORTED_TABLES` membership rules (still owned by db-export-scope skill).
- Docker Compose / cloud DB topology.

## Locked decisions

| Topic | Decision |
|-------|----------|
| Language | Python 3.10+, invoked as `python3` only |
| Dependencies | Standard library only |
| Layout | Common package + small client scripts (not one mega CLI) |
| Export / import clients | One `export_db.py` and one `import_db.py`, each with required `--mode {wiping,appending}`; bash wrappers pass the mode |
| Package import name | `db_scripts` living at `db/scripts/db_scripts/` (run with `PYTHONPATH` set by wrappers, or package-relative runs from repo root) |
| Wrappers | Keep `.sh` files npm already calls; body = python check + `exec python3 … --mode … "$@"` |
| Profiles | Same as today: `SOURCE_PROFILE` / `TARGET_PROFILE`; load `.env.<name>`; compose URL only at `psql` boundary |
| Sensitive DB keys | `DB_USER`, `DB_PASSWORD`, `DB_HOST` may live in the shell instead of `.env.*` (fewer secrets in files AI can read). Resolution: non-empty value in the profile file wins; else non-empty `os.environ`; else incomplete. That way local Docker can keep secrets in `.env.development` while staging/production leave those three blank and the operator exports them in the terminal before running scripts. |
| Tables list | Python constant mirroring current `exported-tables.sh` (single source in package) |
| Confirm wipe | Still interactive `YES` on wiping import (`--mode wiping` only) |
| Tests | `unittest` under `db/scripts/db_scripts/tests/`; run via `python3 -m unittest` |
| npm | Script names unchanged; still call `bash db/scripts/export-wiping.sh` etc. |
| Provider wording | Docs/plan say “cloud DB”, not a vendor name |
| Delete fat bash | After Python parity, remove `lib/load-db-profile.sh` logic and bash business bodies |

### Package sketch (target)

```text
db/scripts/
  db_scripts/           # package
    __init__.py
    env_profiles.py     # load .env.*, compose URL, describe (no password)
    exported_tables.py  # EXPORTED_TABLES + helpers
    docker_pg.py        # docker exec helpers for psql / pg_dump / pg_isready
    schema_sync.py      # compare information_schema for exported tables
  export_db.py          # argparse: --mode wiping|appending
  import_db.py          # argparse: --mode wiping|appending
  check_schema_sync.py
  create_databases.py
  migrate.py
  export-wiping.sh      # → export_db.py --mode wiping
  export-appending.sh   # → export_db.py --mode appending
  import-wiping.sh      # → import_db.py --mode wiping
  import-appending.sh   # → import_db.py --mode appending
  check-schema-sync.sh
  create-databases.sh
  lib/                  # removed or emptied after migration
db/migrate.sh           # thin wrapper → migrate.py
```

### Wrapper contract

Shared python check, then mode-specific `exec`. Example for wiping export:

```bash
#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
if ! command -v python3 >/dev/null 2>&1; then
  echo "❌ python3 not found. Install Python 3.10+ and retry."
  exit 1
fi
if ! python3 -c 'import sys; raise SystemExit(0 if sys.version_info >= (3, 10) else 1)'; then
  echo "❌ Python 3.10+ required (found $(python3 -c 'import sys; print("%d.%d"%sys.version_info[:2])'))."
  exit 1
fi
export PYTHONPATH="${ROOT}/db/scripts${PYTHONPATH:+:$PYTHONPATH}"
exec python3 "${SCRIPT_DIR}/export_db.py" --mode wiping "$@"
```

Appending export uses `--mode appending`; import wrappers call `import_db.py` the same way. Non-mode scripts (`check_schema_sync.py`, …) omit `--mode`. (`db/migrate.sh` adjusts `ROOT` for living under `db/`.)
## Out of product

Domain registry / companionship UI — unrelated. This is operator tooling only.

## Chunk list

One chunk = one reviewable commit. Halt after each unless told to continue.

---

### Chunk 1 — Package core: profiles + URL (no Docker)

**Job:** Python can load a profile and compose/describe a URL the same way bash did.

**Allowed files**

- `db/scripts/db_scripts/__init__.py`
- `db/scripts/db_scripts/env_profiles.py`
- `db/scripts/db_scripts/tests/test_env_profiles.py`
- (optional) `db/scripts/db_scripts/tests/__init__.py`

**Behavior**

- Parse `.env.<profile>` (comments, blanks, optional quotes).
- Required: `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_NAME`; default `DB_PORT=5432`.
- `compose_database_url` with urllib password encoding.
- `describe_db_profile` never includes password.
- `load_shared_env` reads `.env.local` for `SOURCE_PROFILE` / `TARGET_PROFILE` only (ignore unknown keys safely).

**Tests (sentence titles)**

- `load_db_profile raises when the profile file is missing`
- `load_db_profile raises when DB_PASSWORD is empty`
- `compose_database_url percent-encodes special characters in the password`
- `describe_db_profile omits the password`

**Verify**

```bash
PYTHONPATH=db/scripts python3 -m unittest discover -s db/scripts/db_scripts/tests -v
```

**Commit message:** `add db_scripts env profile loader with unittest coverage`

---

### Chunk 1b — Shell overlay for sensitive DB keys

**Job:** Scripts treat `DB_USER` / `DB_PASSWORD` / `DB_HOST` from the process environment the same as from the profile file when the file leaves them blank — so staging/production secrets need not sit in `.env.*` (AI-readable disk).

**Allowed files**

- `db/scripts/db_scripts/env_profiles.py`
- `db/scripts/db_scripts/tests/test_env_profiles.py`
- `docs/implementation_plans/python_based_db_scripts.md` (this chunk)
- Optional one-line hint in `.env.example` under staging/production example

**Behavior**

- Sensitive keys only: `DB_USER`, `DB_PASSWORD`, `DB_HOST`.
- Resolve each: non-empty profile-file value → else non-empty `os.environ[key]` → else missing.
- Non-empty file values are **not** overridden by the shell (so `.env.development` can keep local secrets while a blank `.env.staging` picks up exports for the target).
- `DB_NAME` and other keys remain file-only for this slice.
- Error text when still missing: hint to set the key in `.env.<profile>` **or** export it in the shell.

**Tests (sentence titles)**

- `load_db_profile raises when DB_PASSWORD is missing from both the profile file and the environment`
- `load_db_profile uses DB_PASSWORD from the environment when the profile file leaves it blank`
- `load_db_profile prefers a non-empty profile file DB_PASSWORD over the environment`

**Verify**

```bash
PYTHONPATH=db/scripts python3 -m unittest discover -s db/scripts/db_scripts/tests -v
```

**Commit message:** `allow shell DB_USER DB_PASSWORD DB_HOST to fill blank profile values`

---

### Chunk 2 — Tables list + schema sync helpers (pure)

**Job:** Port `EXPORTED_TABLES` and schema-diff logic that can run without Docker when given two schema dumps.

**Allowed files**

- `db/scripts/db_scripts/exported_tables.py`
- `db/scripts/db_scripts/schema_sync.py`
- `db/scripts/db_scripts/tests/test_exported_tables.py`
- `db/scripts/db_scripts/tests/test_schema_sync.py`

**Behavior**

- Same table order as today (`companionship_relations`, `members`).
- Helpers: truncate list, SQL `IN` list, pg_dump `-t` args.
- `diff_schemas(source_lines, target_lines) -> None | mismatch report`; used by Docker caller later.

**Tests**

- `tables_truncate_list lists child tables before parents`
- `diff_schemas reports when a column exists only on the target`

**Verify:** same unittest command as chunk 1.

**Commit message:** `add exported tables and schema diff helpers for db_scripts`

---

### Chunk 3 — Docker pg helpers

**Job:** Subprocess wrappers for `docker exec` (`pg_isready`, `psql`, `pg_dump`) with clear errors.

**Allowed files**

- `db/scripts/db_scripts/docker_pg.py`
- `db/scripts/db_scripts/tests/test_docker_pg.py` (mock `subprocess`, no real Docker)

**Behavior**

- Run inside `SRC` container for local `-U/-d` and for remote URL `psql`.
- Capture stderr on failure; never log full URL (callers pass URL only into subprocess argv, not print it).
- `pg_dump` flag builder accepts mode: wiping vs appending (`--on-conflict-do-nothing` only for appending).

**Tests**

- `pg_dump_command builds data-only column-inserts flags for wiping export`
- `pg_dump_command adds on-conflict-do-nothing for appending export`
- `run_docker_exec raises with stderr when the command fails` (mocked)

**Verify:** unittest.

**Commit message:** `add docker_pg helpers for db_scripts subprocess calls`

---

### Chunk 4 — `export_db.py` + thin bash wrappers

**Job:** Both npm export scripts call one Python client with `--mode`.

**Allowed files**

- `db/scripts/export_db.py`
- `db/scripts/export-wiping.sh` (replace body → `--mode wiping`)
- `db/scripts/export-appending.sh` (replace body → `--mode appending`)

**Behavior**

- `argparse`: required `--mode {wiping,appending}`; optional profile override if useful later.
- Defaults: `SOURCE_PROFILE=development`.
- Wiping → `db/exports/wiping-seed.sql` (+ TRUNCATE header); appending → `db/exports/appending-seed.sql`.
- `--help` documents modes, profiles, outputs.
- Require `DB_CONTAINER` on source.
- Extra `"$@"` after the wrapper’s baked-in `--mode` still reaches argparse (do not pass a second `--mode` from npm).

**Verify**

```bash
npm run db:wiping_export -- --help
npm run db:wiping_export    # if Docker up
npm run db:appending_export -- --help
```

**Commit message:** `run db export through export_db.py with wiping and appending modes`

---

### Chunk 5 — `import_db.py` + schema check client

**Job:** Both npm import scripts share one client; schema sync stays its own small script.

**Allowed files**

- `db/scripts/import_db.py`
- `db/scripts/check_schema_sync.py`
- `db/scripts/import-wiping.sh` → `--mode wiping`
- `db/scripts/import-appending.sh` → `--mode appending`
- `db/scripts/check-schema-sync.sh`
- May touch `schema_sync.py` / `docker_pg.py` if glue needs it

**Behavior**

- `import_db.py --mode {wiping,appending}`; seed path and confirm prompt depend on mode.
- Defaults: `SOURCE_PROFILE=development`, `TARGET_PROFILE=staging`.
- Schema check before either import; wiping still requires typed `YES`.
- User-facing lines use `describe_db_profile` only.

**Verify**

```bash
npm run db:check_schema_sync -- --help
npm run db:wiping_import -- --help
npm run db:appending_import -- --help
# optional live: check_schema_sync / appending_import against staging
```

**Commit message:** `run db import through import_db.py and Python schema sync`

---

### Chunk 6 — create-databases + migrate

**Job:** Remaining bash DB tooling uses the same package.

**Allowed files**

- `db/scripts/create_databases.py`
- `db/scripts/create-databases.sh`
- `db/scripts/migrate.py`
- `db/migrate.sh`

**Behavior**

- Always load `.env.development` for local Docker create/migrate.
- `migrate.py` accepts database name argv (npm already passes it).

**Verify**

```bash
npm run db:create -- --help
npm run db:migrate:dev   # if Docker up
```

**Commit message:** `run db create and migrate through Python clients`

---

### Chunk 7 — Remove fat bash + architecture/skill docs

**Job:** Single implementation story in code; agent/architecture docs match.

**Allowed files**

- Delete or gut `db/scripts/lib/load-db-profile.sh`, `db/scripts/lib/exported-tables.sh` (if unused)
- `.cursor/skills/db-export-scope/SKILL.md`
- `.env.example` (python3 note if useful)
- `docs/current-architecture.md` (short “DB scripts are Python stdlib under db/scripts”)
- `docs/README.md` only if it points at scripts

**Not in this chunk:** root / `db/README.md` cloner guide (chunk 8). Do not delete this plan yet.

**Verify**

```bash
PYTHONPATH=db/scripts python3 -m unittest discover -s db/scripts/db_scripts/tests -v
# wrappers still resolve:
npm run db:wiping_export -- --help
command -v python3 >/dev/null && ! grep -r 'load-db-profile' db/scripts/*.sh || true
```

**Commit message:** `drop bash db script logic and document Python db_scripts`

---

### Chunk 8 — README for repository cloners

**Job:** Someone who clones the repo can set up profiles and run local DB + export/import without reading this plan.

**Allowed files**

- `README.md` (short pointer / prerequisites: Node, Docker, Python 3.10+)
- `db/README.md` (how-to: profile files, `SOURCE_PROFILE` / `TARGET_PROFILE`, npm `db:*` table including export/import/schema sync, `--help`, no full URL/password in logs)

**Behavior / content to cover**

1. Prerequisites: Docker, Node, **Python 3.10+** (`python3` on PATH); no pip install for DB scripts.
2. Env layout: copy `.env.example` ideas into `.env.local` (auth) + `.env.development` / `.env.staging` / `.env.production` (discrete `DB_*`); link or summarize keys from `.env.example`.
3. Local loop: `db:start` → migrate → app uses `.env.development` via Next.
4. Export/import: defaults `development` → `staging`; `npm run db:wiping_export` / `db:appending_export` / imports / `db:check_schema_sync`; wrappers hide `--mode`.
5. Discover flags: `npm run db:wiping_export -- --help` (and siblings).
6. Security: never commit `.env.*`; scripts must not echo passwords or full connection URLs.
7. Drop outdated `db/README.md` claims that all DB config lives only in `.env.local` / hand-written `DATABASE_URL`.

**Verify**

- Read-through: a new cloner could follow README → `db/README.md` without opening `docs/implementation_plans/`.
- Commands named in the README still match `package.json`.

**Commit message:** `document Python db scripts and env profiles for cloners`

Then **delete** `docs/implementation_plans/python_based_db_scripts.md`.

## Process

- Halt after each chunk for review unless told to continue.
- Do not commit secrets (`.env.*` stay gitignored).
- Prefer code-as-prose names in Python (`load_db_profile`, `compose_database_url`, `check_schema_match`).

## Review bar (per chunk)

1. One job in the chunk title?
2. Stdlib only?
3. Tests are sentence names; Given/When/Then bodies?
4. npm script names still work?
5. No password/URL leakage in new log lines?
