"""Canonical list of tables managed by export/import scripts.

When adding a new Pg*Repository, check .cursor/skills/db-export-scope/SKILL.md
to decide whether the new table belongs here.

FK order matters for TRUNCATE in wiping-seed.sql: child tables before parents.
companionship_relations and couples reference members, so they come before members.
"""

from __future__ import annotations

EXPORTED_TABLES: tuple[str, ...] = (
    "companionship_relations",
    "couples",
    "members",
)


def pg_dump_table_flags(tables: tuple[str, ...] = EXPORTED_TABLES) -> list[str]:
    """Return argv fragments: -t t1 -t t2 … for pg_dump."""
    flags: list[str] = []
    for table in tables:
        flags.extend(["-t", table])
    return flags


def tables_sql_in(tables: tuple[str, ...] = EXPORTED_TABLES) -> str:
    """Return 't1','t2' for use in SQL IN (...)."""
    return ",".join(f"'{table}'" for table in tables)


def tables_truncate_list(tables: tuple[str, ...] = EXPORTED_TABLES) -> str:
    """Return comma-separated table names for a TRUNCATE statement."""
    return ", ".join(tables)


def schema_columns_query(tables: tuple[str, ...] = EXPORTED_TABLES) -> str:
    """SQL that dumps comparable column identity lines for EXPORTED_TABLES."""
    return (
        "SELECT table_name||'|'||column_name||'|'||data_type||'|'||udt_name "
        "FROM information_schema.columns "
        "WHERE table_schema = 'public' "
        f"AND table_name IN ({tables_sql_in(tables)}) "
        "ORDER BY table_name, column_name;"
    )
