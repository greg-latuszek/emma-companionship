#!/usr/bin/env python3
"""Export EXPORTED_TABLES from the SOURCE profile into a seed SQL file."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from db_scripts.docker_pg import DockerPgError, ExportMode, run_pg_dump
from db_scripts.env_profiles import (
    IncompleteDbProfile,
    MissingDbProfile,
    describe_db_profile,
    find_repo_root,
    load_db_profile,
    load_shared_env,
    require_source_container,
)
from db_scripts.exported_tables import tables_truncate_list


def parse_arguments(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Export members and companionship_relations from the SOURCE database "
            "profile into db/exports/*.sql"
        ),
    )
    parser.add_argument(
        "--mode",
        required=True,
        choices=("wiping", "appending"),
        help="wiping: TRUNCATE header + INSERTs; appending: ON CONFLICT DO NOTHING",
    )
    parser.add_argument(
        "--source-profile",
        default=None,
        help="Profile name for .env.<name> (default: SOURCE_PROFILE or development)",
    )
    return parser.parse_args(argv)


def filter_pg_dump_noise(sql: str) -> str:
    """Drop pg_dump meta lines that start with a backslash."""
    return "\n".join(
        line for line in sql.splitlines() if not line.startswith("\\")
    )


def build_wiping_seed(sql_body: str) -> str:
    header = "\n".join(
        [
            "-- wiping-seed.sql: TRUNCATE then INSERT",
            "-- Destroys all existing rows. Safe only on a fresh or dev DB.",
            f"TRUNCATE TABLE {tables_truncate_list()} RESTART IDENTITY CASCADE;",
            "",
            "",
        ]
    )
    body = filter_pg_dump_noise(sql_body)
    return header + body + ("\n" if body and not body.endswith("\n") else "")


def build_appending_seed(sql_body: str) -> str:
    body = filter_pg_dump_noise(sql_body)
    return body + ("\n" if body and not body.endswith("\n") else "")


def export_database(mode: ExportMode, source_profile_name: str | None) -> Path:
    root = find_repo_root()
    shared = load_shared_env(repo_root=root)
    profile_name = source_profile_name or shared.source_profile
    source = load_db_profile(profile_name, repo_root=root)
    require_source_container(source)

    exports_dir = root / "db" / "exports"
    exports_dir.mkdir(parents=True, exist_ok=True)
    if mode == "wiping":
        out_path = exports_dir / "wiping-seed.sql"
    else:
        out_path = exports_dir / "appending-seed.sql"

    print(f"📤 Export SOURCE: {describe_db_profile(source)}")
    dump = run_pg_dump(source, mode)
    if mode == "wiping":
        content = build_wiping_seed(dump)
    else:
        content = build_appending_seed(dump)

    out_path.write_text(content, encoding="utf-8")
    print(f"✅ Written: {out_path.relative_to(root)}")
    return out_path


def main(argv: list[str] | None = None) -> int:
    args = parse_arguments(argv)
    try:
        export_database(args.mode, args.source_profile)
    except (MissingDbProfile, IncompleteDbProfile, DockerPgError) as error:
        print(f"❌ {error}", file=sys.stderr)
        if isinstance(error, DockerPgError) and error.stderr:
            print(f"   {error.stderr}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
