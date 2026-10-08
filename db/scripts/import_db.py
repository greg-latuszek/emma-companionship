#!/usr/bin/env python3
"""Import a seed SQL file into the TARGET profile (runner = SOURCE container)."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from db_scripts.docker_pg import DockerPgError, run_psql_on_database_url
from db_scripts.env_profiles import (
    IncompleteDbProfile,
    MissingDbProfile,
    compose_database_url,
    describe_db_profile,
    find_repo_root,
    load_db_profile,
    load_shared_env,
    require_source_container,
)
from db_scripts.exported_tables import tables_truncate_list
from db_scripts.schema_sync import SchemaMismatch, check_schema_match


def parse_arguments(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Import db/exports/*.sql into the TARGET database profile. "
            "psql runs inside the SOURCE profile's Docker container."
        ),
    )
    parser.add_argument(
        "--mode",
        required=True,
        choices=("wiping", "appending"),
        help="wiping: apply wiping-seed.sql (asks YES); appending: appending-seed.sql",
    )
    parser.add_argument(
        "--source-profile",
        default=None,
        help="Docker runner profile (default: SOURCE_PROFILE or development)",
    )
    parser.add_argument(
        "--target-profile",
        default=None,
        help="Write target profile (default: TARGET_PROFILE or staging)",
    )
    parser.add_argument(
        "--yes",
        action="store_true",
        help="Skip the wiping confirmation prompt (dangerous)",
    )
    return parser.parse_args(argv)


def seed_path_for_mode(root: Path, mode: str) -> Path:
    if mode == "wiping":
        return root / "db" / "exports" / "wiping-seed.sql"
    return root / "db" / "exports" / "appending-seed.sql"


def confirm_wiping_import(target_description: str, seed: Path) -> bool:
    print(
        f"⚠️  This will TRUNCATE {tables_truncate_list()} on: {target_description}"
    )
    print(f"   Seed file : {seed}")
    answer = input("   Type YES to continue: ")
    return answer == "YES"


def import_database(
    mode: str,
    source_profile_name: str | None,
    target_profile_name: str | None,
    *,
    skip_confirm: bool = False,
) -> None:
    root = find_repo_root()
    shared = load_shared_env(repo_root=root)
    source_name = source_profile_name or shared.source_profile
    target_name = target_profile_name or shared.target_profile

    source = load_db_profile(source_name, repo_root=root)
    target = load_db_profile(target_name, repo_root=root)
    require_source_container(source)

    seed = seed_path_for_mode(root, mode)
    if not seed.is_file():
        export_hint = (
            "npm run db:wiping_export"
            if mode == "wiping"
            else "npm run db:appending_export"
        )
        raise FileNotFoundError(
            f"{seed.relative_to(root)} not found — run {export_hint} first"
        )

    check_schema_match(source, target)

    if mode == "wiping" and not skip_confirm:
        if not confirm_wiping_import(describe_db_profile(target), seed.relative_to(root)):
            print("Aborted.")
            return

    target_url = compose_database_url(target)
    seed_sql = seed.read_text(encoding="utf-8")
    if mode == "wiping":
        print(f"🌱 Importing {seed.relative_to(root)} → target DB...")
    else:
        print(
            f"🌱 Appending {seed.relative_to(root)} → "
            f"{describe_db_profile(target)} (skipping existing UUIDs)..."
        )
    run_psql_on_database_url(source, target_url, stdin_sql=seed_sql)
    print("✅ Done.")


def main(argv: list[str] | None = None) -> int:
    args = parse_arguments(argv)
    try:
        import_database(
            args.mode,
            args.source_profile,
            args.target_profile,
            skip_confirm=args.yes,
        )
    except SchemaMismatch as error:
        print(error.report, file=sys.stderr)
        return 1
    except (
        MissingDbProfile,
        IncompleteDbProfile,
        DockerPgError,
        FileNotFoundError,
        RuntimeError,
    ) as error:
        print(f"❌ {error}", file=sys.stderr)
        if isinstance(error, DockerPgError) and error.stderr:
            print(f"   {error.stderr}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
