#!/usr/bin/env python3
"""Create development and test databases in the local Docker Postgres."""

from __future__ import annotations

import argparse
import sys

from db_scripts.docker_pg import (
    DockerPgError,
    run_docker_exec,
    wait_until_postgres_is_ready,
)
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
            "Create the development and test databases inside the local Docker "
            "Postgres (loads .env.development)."
        ),
    )
    return parser.parse_args(argv)


def database_exists(profile_user: str, container: str, database_name: str) -> bool:
    completed = run_docker_exec(
        container,
        [
            "psql",
            "-U",
            profile_user,
            "-tAc",
            f"SELECT 1 FROM pg_database WHERE datname = '{database_name}'",
        ],
    )
    return "1" in (completed.stdout or "")


def create_database_if_missing(
    profile_user: str,
    container: str,
    database_name: str,
) -> None:
    print(f"📍 Creating database: {database_name}")
    if database_exists(profile_user, container, database_name):
        print("  ✅ Already exists")
        return
    run_docker_exec(
        container,
        [
            "psql",
            "-U",
            profile_user,
            "-c",
            (
                f"CREATE DATABASE {database_name} ENCODING 'UTF8' "
                "LC_COLLATE 'en_US.UTF-8' LC_CTYPE 'en_US.UTF-8';"
            ),
        ],
    )
    print("  ✅ Created")


def create_databases() -> None:
    root = find_repo_root()
    development = load_db_profile("development", repo_root=root)
    require_source_container(development)

    test_name = development.database_test or "emma_companionship_test"
    container = development.container

    print("🗄️  Creating databases...")
    print("⏳ Waiting for PostgreSQL container to be ready...")
    wait_until_postgres_is_ready(development)
    print("✅ PostgreSQL is ready")

    create_database_if_missing(development.user, container, development.database)
    create_database_if_missing(development.user, container, test_name)
    print("✅ Database creation completed")


def main(argv: list[str] | None = None) -> int:
    parse_arguments(argv)
    try:
        create_databases()
    except (MissingDbProfile, IncompleteDbProfile, DockerPgError) as error:
        print(f"❌ {error}", file=sys.stderr)
        if isinstance(error, DockerPgError) and error.stderr:
            print(f"   {error.stderr}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
