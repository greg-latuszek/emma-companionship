"""Unit tests for env profile loading and URL composition."""

from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from db_scripts.env_profiles import (
    DbProfile,
    IncompleteDbProfile,
    MissingDbProfile,
    compose_database_url,
    describe_db_profile,
    load_db_profile,
    load_shared_env,
    parse_env_file,
)


def write_profile(repo_root: Path, profile: str, body: str) -> Path:
    path = repo_root / f".env.{profile}"
    path.write_text(body, encoding="utf-8")
    return path


class LoadDbProfileTests(unittest.TestCase):
    def test_load_db_profile_raises_when_the_profile_file_is_missing(self) -> None:
        # Given a repo root with no .env.staging
        with tempfile.TemporaryDirectory() as tmp:
            repo_root = Path(tmp)

            # When / Then
            with self.assertRaises(MissingDbProfile) as ctx:
                load_db_profile("staging", repo_root=repo_root)

            self.assertIn(".env.staging", str(ctx.exception))

    def test_load_db_profile_raises_when_DB_PASSWORD_is_empty(self) -> None:
        # Given a profile file with an empty password
        with tempfile.TemporaryDirectory() as tmp:
            repo_root = Path(tmp)
            write_profile(
                repo_root,
                "staging",
                "\n".join(
                    [
                        "DB_USER=alice",
                        "DB_PASSWORD=",
                        "DB_HOST=db.example",
                        "DB_NAME=app",
                    ]
                ),
            )

            # When / Then
            with self.assertRaises(IncompleteDbProfile) as ctx:
                load_db_profile("staging", repo_root=repo_root)

            self.assertIn("DB_PASSWORD", str(ctx.exception))

    def test_load_db_profile_returns_discrete_parts_and_default_port(self) -> None:
        # Given a minimal valid profile without DB_PORT
        with tempfile.TemporaryDirectory() as tmp:
            repo_root = Path(tmp)
            write_profile(
                repo_root,
                "development",
                "\n".join(
                    [
                        "# local docker",
                        'DB_USER="devuser"',
                        "DB_PASSWORD=devpassword",
                        "DB_HOST=localhost",
                        "DB_NAME=emma_companionship_dev",
                        "DB_CONTAINER=emma_companionship_db",
                    ]
                ),
            )

            # When
            profile = load_db_profile("development", repo_root=repo_root)

            # Then
            self.assertEqual(profile.user, "devuser")
            self.assertEqual(profile.password, "devpassword")
            self.assertEqual(profile.port, "5432")
            self.assertEqual(profile.container, "emma_companionship_db")


class ComposeDatabaseUrlTests(unittest.TestCase):
    def test_compose_database_url_percent_encodes_special_characters_in_the_password(
        self,
    ) -> None:
        # Given a profile whose password needs URL encoding
        profile = DbProfile(
            name="staging",
            user="owner",
            password="p@ss/word with spaces",
            host="db.example",
            database="app",
            port="5432",
            options="sslmode=require",
        )

        # When
        url = compose_database_url(profile)

        # Then
        self.assertIn("p%40ss%2Fword%20with%20spaces", url)
        self.assertTrue(url.startswith("postgresql://owner:"))
        self.assertIn("@db.example:5432/app?sslmode=require", url)
        self.assertNotIn("p@ss/word with spaces", url)


class DescribeDbProfileTests(unittest.TestCase):
    def test_describe_db_profile_omits_the_password(self) -> None:
        # Given a profile with a secret password
        profile = DbProfile(
            name="staging",
            user="owner",
            password="super-secret",
            host="db.example",
            database="app",
            port="5432",
            container="",
        )

        # When
        description = describe_db_profile(profile)

        # Then
        self.assertEqual(description, "owner@db.example:5432/app")
        self.assertNotIn("super-secret", description)
        self.assertNotIn("password", description.lower())


class LoadSharedEnvTests(unittest.TestCase):
    def test_load_shared_env_reads_only_profile_selectors_from_env_local(self) -> None:
        # Given .env.local with selectors and unrelated secrets
        with tempfile.TemporaryDirectory() as tmp:
            repo_root = Path(tmp)
            (repo_root / ".env.local").write_text(
                "\n".join(
                    [
                        "SOURCE_PROFILE=development",
                        "TARGET_PROFILE=production",
                        "AUTH_SECRET=do-not-load-as-db",
                        "DB_PASSWORD=should-be-ignored",
                    ]
                ),
                encoding="utf-8",
            )

            # When
            shared = load_shared_env(repo_root=repo_root)

            # Then
            self.assertEqual(shared.source_profile, "development")
            self.assertEqual(shared.target_profile, "production")


class ParseEnvFileTests(unittest.TestCase):
    def test_parse_env_file_skips_comments_and_strips_quotes(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / ".env.development"
            path.write_text(
                "# comment\n\nDB_USER='devuser'\nDB_HOST=localhost\n",
                encoding="utf-8",
            )

            values = parse_env_file(path)

            self.assertEqual(values["DB_USER"], "devuser")
            self.assertEqual(values["DB_HOST"], "localhost")
            self.assertNotIn("# comment", values)


if __name__ == "__main__":
    unittest.main()
