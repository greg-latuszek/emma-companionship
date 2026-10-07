#!/usr/bin/env python3
"""Compare EXPORTED_TABLES schemas on SOURCE vs TARGET profiles."""

from __future__ import annotations

import argparse
import sys

from db_scripts.docker_pg import DockerPgError
from db_scripts.env_profiles import (
    IncompleteDbProfile,
    MissingDbProfile,
    describe_db_profile,
    find_repo_root,
    load_db_profile,
    load_shared_env,
    require_source_container,
)
from db_scripts.schema_sync import (
    SchemaMismatch,
    check_schema_match,
    describe_exported_tables,
)


def parse_arguments(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Check that exported tables have the same columns on SOURCE and TARGET."
        ),
    )
    parser.add_argument(
        "--source-profile",
        default=None,
        help="SOURCE profile (default: SOURCE_PROFILE or development)",
    )
    parser.add_argument(
        "--target-profile",
        default=None,
        help="TARGET profile (default: TARGET_PROFILE or staging)",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_arguments(argv)
    root = find_repo_root()
    shared = load_shared_env(repo_root=root)
    source_name = args.source_profile or shared.source_profile
    target_name = args.target_profile or shared.target_profile

    try:
        source = load_db_profile(source_name, repo_root=root)
        target = load_db_profile(target_name, repo_root=root)
        require_source_container(source)

        print(f"Tables checked: {describe_exported_tables()}")
        print(f"SOURCE ({source_name}): {describe_db_profile(source)}")
        print(f"TARGET ({target_name}): {describe_db_profile(target)}")
        print()

        check_schema_match(source, target)
    except SchemaMismatch as error:
        print(error.report, file=sys.stderr)
        return 1
    except (
        MissingDbProfile,
        IncompleteDbProfile,
        DockerPgError,
        RuntimeError,
    ) as error:
        print(f"❌ {error}", file=sys.stderr)
        if isinstance(error, DockerPgError) and error.stderr:
            print(f"   {error.stderr}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
