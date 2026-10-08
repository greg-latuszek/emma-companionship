"""Subprocess helpers for postgres tools run via docker exec."""

from __future__ import annotations

import subprocess
from typing import Literal, Sequence

from db_scripts.env_profiles import DbProfile
from db_scripts.exported_tables import EXPORTED_TABLES, pg_dump_table_flags

ExportMode = Literal["wiping", "appending"]


class DockerPgError(RuntimeError):
    """Raised when a docker exec / postgres tool invocation fails."""

    def __init__(self, message: str, *, stderr: str = "", returncode: int | None = None) -> None:
        super().__init__(message)
        self.stderr = stderr
        self.returncode = returncode


def run_docker_exec(
    container: str,
    command: Sequence[str],
    *,
    stdin_text: str | None = None,
    check: bool = True,
) -> subprocess.CompletedProcess[str]:
    """
    Run `docker exec [-i] <container> <command…>`.

    Does not log argv (callers must not print connection URLs themselves).
    """
    argv = ["docker", "exec"]
    if stdin_text is not None:
        argv.append("-i")
    argv.append(container)
    argv.extend(command)

    completed = subprocess.run(
        argv,
        input=stdin_text,
        capture_output=True,
        text=True,
        check=False,
    )
    if check and completed.returncode != 0:
        stderr = (completed.stderr or completed.stdout or "").strip()
        raise DockerPgError(
            f"docker exec in {container} failed (exit {completed.returncode})",
            stderr=stderr,
            returncode=completed.returncode,
        )
    return completed


def wait_until_postgres_is_ready(
    profile: DbProfile,
    *,
    attempts: int = 30,
    sleep_seconds: float = 1.0,
    sleeper=None,
) -> None:
    """Poll pg_isready inside the profile's Docker container."""
    if not profile.container:
        raise DockerPgError("DB_CONTAINER is required to wait for Postgres")

    import time

    sleep = sleeper or time.sleep
    last_error = ""
    for _ in range(attempts):
        try:
            run_docker_exec(
                profile.container,
                ["pg_isready", "-U", profile.user],
            )
            return
        except DockerPgError as error:
            last_error = error.stderr or str(error)
            sleep(sleep_seconds)
    raise DockerPgError(
        f"PostgreSQL in {profile.container} was not ready after {attempts} attempts",
        stderr=last_error,
    )


def build_pg_dump_command(
    profile: DbProfile,
    mode: ExportMode,
    *,
    tables: tuple[str, ...] = EXPORTED_TABLES,
) -> list[str]:
    """
    Build the argv for pg_dump inside the container (no `docker exec` prefix).

    wiping  — data-only column-inserts
    appending — same plus --on-conflict-do-nothing
    """
    command = [
        "pg_dump",
        "-U",
        profile.user,
        "-d",
        profile.database,
        "--data-only",
        "--column-inserts",
        "--no-privileges",
        "--no-owner",
    ]
    if mode == "appending":
        command.append("--on-conflict-do-nothing")
    command.extend(pg_dump_table_flags(tables))
    return command


def run_pg_dump(profile: DbProfile, mode: ExportMode) -> str:
    """Run pg_dump in the source container; return stdout (SQL body)."""
    if not profile.container:
        raise DockerPgError("DB_CONTAINER is required to run pg_dump")
    completed = run_docker_exec(
        profile.container,
        build_pg_dump_command(profile, mode),
    )
    return completed.stdout or ""


def run_psql_on_local_database(
    profile: DbProfile,
    sql: str,
    *,
    tuples_only: bool = False,
) -> str:
    """Run psql -U/-d against a database inside the container."""
    if not profile.container:
        raise DockerPgError("DB_CONTAINER is required to run local psql")
    command = ["psql", "-U", profile.user, "-d", profile.database]
    if tuples_only:
        command.append("-tAc")
    else:
        command.append("-c")
    command.append(sql)
    completed = run_docker_exec(profile.container, command)
    return completed.stdout or ""


def run_psql_on_database_url(
    runner: DbProfile,
    database_url: str,
    sql: str | None = None,
    *,
    stdin_sql: str | None = None,
    tuples_only: bool = False,
) -> str:
    """
    Run psql with a connection URL inside the runner container.

    Pass the URL only as argv — never print it from callers.
    """
    if not runner.container:
        raise DockerPgError("DB_CONTAINER is required to run remote psql")
    command = ["psql", database_url]
    if tuples_only:
        command.append("-tAc")
        if sql is None:
            raise DockerPgError("tuples_only psql requires an sql argument")
        command.append(sql)
    elif sql is not None:
        command.extend(["-c", sql])
    completed = run_docker_exec(
        runner.container,
        command,
        stdin_text=stdin_sql,
    )
    return completed.stdout or ""
