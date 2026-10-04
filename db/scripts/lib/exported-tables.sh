#!/bin/bash
# Canonical list of tables managed by export/import scripts.
#
# ⚠️  When adding a new Pg*Repository, check .cursor/skills/db-export-scope/SKILL.md
#     to decide whether the new table belongs here.
#
# FK ORDER MATTERS for the TRUNCATE in wiping-seed.sql:
#   child tables must appear BEFORE their parent tables.
#   companionship_relations → members, so companionship_relations comes first.

EXPORTED_TABLES=(
  companionship_relations
  members
)

# ── Helpers ──────────────────────────────────────────────────────────────────

# Produce: -t t1 -t t2 …  (for pg_dump)
pg_dump_table_flags() {
  local flags=()
  for t in "${EXPORTED_TABLES[@]}"; do
    flags+=(-t "$t")
  done
  printf '%s ' "${flags[@]}"
}

# Produce: 'companionship_relations','members'  (for SQL IN clause)
tables_sql_in() {
  printf "'%s'," "${EXPORTED_TABLES[@]}" | sed 's/,$//'
}

# Produce: companionship_relations, members  (for TRUNCATE statement)
tables_truncate_list() {
  local IFS=', '
  echo "${EXPORTED_TABLES[*]}"
}

# ── Schema comparison ─────────────────────────────────────────────────────────
#
# Queries information_schema.columns for EXPORTED_TABLES on both DBs and diffs
# them.  Exits 1 (aborting the caller) if the schemas diverge.
#
# Requires env vars already validated by the caller:
#   EXPORT_CONTAINER, EXPORT_DB_USER, EXPORT_DB_NAME, IMPORT_DATABASE_URL

check_schema_match() {
  echo "🔍 Comparing schemas of exported tables between EXPORT and IMPORT databases..."

  local sql
  sql="SELECT table_name||'|'||ordinal_position||'|'||column_name||'|'||data_type||'|'||udt_name
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name IN ($(tables_sql_in))
       ORDER BY table_name, ordinal_position;"

  local export_schema
  if ! export_schema=$(docker exec "$EXPORT_CONTAINER" \
      psql -U "$EXPORT_DB_USER" -d "$EXPORT_DB_NAME" -tAc "$sql" 2>&1); then
    echo "❌ Could not query EXPORT DB schema:"
    echo "   $export_schema"
    exit 1
  fi

  local import_schema
  if ! import_schema=$(docker exec "$EXPORT_CONTAINER" \
      psql "$IMPORT_DATABASE_URL" -tAc "$sql" 2>&1); then
    echo "❌ Could not query IMPORT DB schema:"
    echo "   $import_schema"
    exit 1
  fi

  if [ "$export_schema" = "$import_schema" ]; then
    echo "✅ Schemas match — safe to proceed."
    return 0
  fi

  echo "❌ Schema mismatch! Aborting to prevent corrupt data."
  echo ""
  echo "Column differences (EXPORT vs IMPORT):"
  diff \
    <(echo "$export_schema") \
    <(echo "$import_schema") \
    | grep '^[<>]' \
    | sed 's|^< |  EXPORT: |' \
    | sed 's|^> |  IMPORT: |'
  echo ""
  echo "Likely cause: a migration has been applied on one side but not the other."
  echo "Run pending migrations on the IMPORT target, then retry."
  exit 1
}
