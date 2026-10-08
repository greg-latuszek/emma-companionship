"""Unit tests for docker_pg helpers (subprocess mocked — no real Docker)."""

from __future__ import annotations

import unittest
from unittest.mock import MagicMock, patch

from db_scripts.docker_pg import (
    DockerPgError,
    build_pg_dump_command,
    run_docker_exec,
    run_psql_on_database_url,
)
from db_scripts.env_profiles import DbProfile


def a_local_docker_profile() -> DbProfile:
    return DbProfile(
        name="development",
        user="devuser",
        password="devpassword",
        host="localhost",
        database="emma_companionship_dev",
        port="5433",
        container="emma_companionship_db",
    )


class BuildPgDumpCommandTests(unittest.TestCase):
    def test_pg_dump_command_builds_data_only_column_inserts_flags_for_wiping_export(
        self,
    ) -> None:
        # Given a local Docker profile and wiping mode
        profile = a_local_docker_profile()

        # When
        command = build_pg_dump_command(profile, "wiping")

        # Then
        self.assertEqual(command[0], "pg_dump")
        self.assertIn("--data-only", command)
        self.assertIn("--column-inserts", command)
        self.assertIn("--no-privileges", command)
        self.assertIn("--no-owner", command)
        self.assertNotIn("--on-conflict-do-nothing", command)
        self.assertEqual(command[command.index("-U") + 1], "devuser")
        self.assertEqual(command[command.index("-d") + 1], "emma_companionship_dev")
        self.assertIn("-t", command)
        self.assertIn("companionship_relations", command)
        self.assertIn("members", command)

    def test_pg_dump_command_adds_on_conflict_do_nothing_for_appending_export(
        self,
    ) -> None:
        # Given appending mode
        profile = a_local_docker_profile()

        # When
        command = build_pg_dump_command(profile, "appending")

        # Then
        self.assertIn("--on-conflict-do-nothing", command)
        self.assertIn("--column-inserts", command)


class RunDockerExecTests(unittest.TestCase):
    def test_run_docker_exec_raises_with_stderr_when_the_command_fails(self) -> None:
        # Given docker exec returning non-zero with stderr
        failed = MagicMock()
        failed.returncode = 2
        failed.stderr = "role \"missing\" does not exist\n"
        failed.stdout = ""

        with patch("db_scripts.docker_pg.subprocess.run", return_value=failed) as run:
            # When / Then
            with self.assertRaises(DockerPgError) as ctx:
                run_docker_exec("emma_companionship_db", ["psql", "-U", "missing"])

            self.assertIn("exit 2", str(ctx.exception))
            self.assertIn('role "missing" does not exist', ctx.exception.stderr)
            run.assert_called_once()
            argv = run.call_args.args[0]
            self.assertEqual(argv[:3], ["docker", "exec", "emma_companionship_db"])

    def test_run_psql_on_database_url_passes_the_url_only_as_argv(self) -> None:
        # Given a successful remote psql call
        ok = MagicMock()
        ok.returncode = 0
        ok.stderr = ""
        ok.stdout = "ok\n"
        secret_url = "postgresql://owner:s3cret@db.example:5432/app?sslmode=require"
        runner = a_local_docker_profile()

        with patch("db_scripts.docker_pg.subprocess.run", return_value=ok) as run:
            # When
            output = run_psql_on_database_url(
                runner,
                secret_url,
                sql="SELECT 1",
                tuples_only=True,
            )

            # Then — URL is passed only as docker/psql argv (not returned in output)
            self.assertEqual(output, "ok\n")
            argv = run.call_args.args[0]
            self.assertEqual(
                argv[:4],
                ["docker", "exec", "emma_companionship_db", "psql"],
            )
            self.assertEqual(argv[4], secret_url)
            self.assertIn("-tAc", argv)
            self.assertIn("SELECT 1", argv)


if __name__ == "__main__":
    unittest.main()
