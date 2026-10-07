#!/usr/bin/env python3
"""Run SQL migrations from db/migrations/ against a named local database."""

from __future__ import annotations

import argparse
import sys

from db_scripts.docker_pg import DockerPgError, run_docker_exec
from db_scripts.env_profiles import (
    IncompleteDbProfile,
    MissingDbProfile,
    find_repo_root,
    load_db_profile,
    require_source_container,
)


def parse_arguments(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Apply db/migrations/*.sql in order to a local Docker database "
            "(connection settings from .env.development)."
        ),
    )
    parser.add_argument(
        "database",
        nargs="?",
        default=None,
        help="Target database name (default: DB_NAME from .env.development)",
    )
    return parser.parse_args(argv)


def run_migrations(database_name: str | None) -> None:
    root = find_repo_root()
    development = load_db_profile("development", repo_root=root)
    require_source_container(development)

    target_db = database_name or development.database
    if not target_db:
        raise IncompleteDbProfile(
            "Target database name not specified. "
            "Pass it as an argument or set DB_NAME in .env.development."
        )

    migrations_dir = root / "db" / "migrations"
    if not migrations_dir.is_dir():
        raise FileNotFoundError(f"Migrations directory not found: {migrations_dir}")

    print(f"🔄 Running migrations on database: {target_db}")
    print(f"📁 Migrations directory: {migrations_dir.relative_to(root)}/")

    migration_files = sorted(migrations_dir.glob("*.sql"))
    if not migration_files:
        print("⚠️  No migration files found.")
        return

    for migration_file in migration_files:
        print(f"▶️  Executing: {migration_file.name}")
        sql = migration_file.read_text(encoding="utf-8")
        try:
            run_docker_exec(
                development.container,
                ["psql", "-U", development.user, "-d", target_db],
                stdin_text=sql,
            )
        except DockerPgError as error:
            print(f"❌ Error executing {migration_file.name}", file=sys.stderr)
            raise error
        print(f"✅ {migration_file.name} completed")

    print(f"✅ All migrations completed successfully on {target_db}")


def main(argv: list[str] | None = None) -> int:
    args = parse_arguments(argv)
    try:
        run_migrations(args.database)
    except (
        MissingDbProfile,
        IncompleteDbProfile,
        DockerPgError,
        FileNotFoundError,
    ) as error:
        print(f"❌ {error}", file=sys.stderr)
        if isinstance(error, DockerPgError) and error.stderr:
            print(f"   {error.stderr}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
