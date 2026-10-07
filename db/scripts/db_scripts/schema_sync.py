"""Compare exported-table column schemas (pure diff + Docker-backed check)."""

from __future__ import annotations

from dataclasses import dataclass

from db_scripts.docker_pg import run_psql_on_database_url, run_psql_on_local_database
from db_scripts.env_profiles import DbProfile, compose_database_url
from db_scripts.exported_tables import EXPORTED_TABLES, schema_columns_query


class SchemaMismatch(Exception):
    """Raised when SOURCE and TARGET column sets differ for exported tables."""

    def __init__(self, report: str) -> None:
        super().__init__(report)
        self.report = report


@dataclass(frozen=True)
class SchemaDiff:
    """Lines present only on SOURCE or only on TARGET."""

    only_on_source: tuple[str, ...]
    only_on_target: tuple[str, ...]

    @property
    def schemas_match(self) -> bool:
        return not self.only_on_source and not self.only_on_target


def normalize_schema_lines(dump: str) -> tuple[str, ...]:
    """Split a psql -tAc dump into non-empty stripped lines, sorted uniquely."""
    lines = [line.strip() for line in dump.splitlines() if line.strip()]
    return tuple(sorted(set(lines)))


def diff_schemas(source_dump: str, target_dump: str) -> SchemaDiff:
    """
    Compare two information_schema dumps (one line per column identity).

    Column order in the dump does not matter — only the set of lines.
    """
    source_lines = set(normalize_schema_lines(source_dump))
    target_lines = set(normalize_schema_lines(target_dump))
    return SchemaDiff(
        only_on_source=tuple(sorted(source_lines - target_lines)),
        only_on_target=tuple(sorted(target_lines - source_lines)),
    )


def format_schema_mismatch_report(diff: SchemaDiff) -> str:
    """Human-readable mismatch report (no secrets)."""
    lines = [
        "❌ Schema mismatch! Aborting to prevent corrupt data.",
        "   (Column order is ignored — only names and types are compared.)",
        "",
        "Column differences (SOURCE vs TARGET):",
    ]
    for line in diff.only_on_source:
        lines.append(f"  SOURCE: {line}")
    for line in diff.only_on_target:
        lines.append(f"  TARGET: {line}")
    lines.extend(
        [
            "",
            "Likely cause: a migration has been applied on one side but not the other.",
            "Run pending migrations on the TARGET, then retry.",
        ]
    )
    return "\n".join(lines)


def assert_schemas_match(source_dump: str, target_dump: str) -> None:
    """Raise SchemaMismatch with a report when the dumps disagree."""
    diff = diff_schemas(source_dump, target_dump)
    if diff.schemas_match:
        return
    raise SchemaMismatch(format_schema_mismatch_report(diff))


def check_schema_match(source: DbProfile, target: DbProfile) -> None:
    """
    Query information_schema on SOURCE and TARGET, then assert they match.

    SOURCE must have DB_CONTAINER (psql runner). TARGET URL is never printed.
    """
    print(
        "🔍 Comparing schemas of exported tables between SOURCE and TARGET databases..."
    )
    sql = schema_columns_query()
    try:
        source_dump = run_psql_on_local_database(source, sql, tuples_only=True)
    except Exception as error:
        raise RuntimeError(f"Could not query SOURCE DB schema:\n   {error}") from error

    target_url = compose_database_url(target)
    try:
        target_dump = run_psql_on_database_url(
            source,
            target_url,
            sql=sql,
            tuples_only=True,
        )
    except Exception as error:
        raise RuntimeError(f"Could not query TARGET DB schema:\n   {error}") from error

    assert_schemas_match(source_dump, target_dump)
    print("✅ Schemas match — safe to proceed.")


def describe_exported_tables() -> str:
    """Space-separated table names for operator logs."""
    return " ".join(EXPORTED_TABLES)
