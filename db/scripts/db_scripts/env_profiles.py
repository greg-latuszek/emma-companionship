"""Load discrete DB_* profile files and compose connection URLs."""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from typing import Mapping
from urllib.parse import quote


class MissingDbProfile(FileNotFoundError):
    """Raised when .env.<profile> does not exist."""


class IncompleteDbProfile(ValueError):
    """Raised when required DB_* keys are missing or empty."""


@dataclass(frozen=True)
class DbProfile:
    """Discrete connection parts for one environment profile."""

    name: str
    user: str
    password: str
    host: str
    database: str
    port: str = "5432"
    options: str = ""
    ssl: str = ""
    database_test: str = ""
    container: str = ""


@dataclass(frozen=True)
class SharedScriptEnv:
    """Optional defaults from .env.local for export/import scripts."""

    source_profile: str = "development"
    target_profile: str = "staging"


_REQUIRED_DB_KEYS = ("DB_USER", "DB_PASSWORD", "DB_HOST", "DB_NAME")

# May be omitted from .env.* and supplied via the process environment instead
# (keeps staging/production secrets out of files that tools may read into LLM context).
_SHELL_FILLABLE_DB_KEYS = frozenset({"DB_USER", "DB_PASSWORD", "DB_HOST"})


def find_repo_root(start: Path | None = None) -> Path:
    """Return the repository root that contains .env.example or .git."""
    here = (start or Path(__file__)).resolve()
    for candidate in [here, *here.parents]:
        if (candidate / ".env.example").is_file() or (candidate / ".git").exists():
            return candidate
    # db/scripts/db_scripts/env_profiles.py → parents[3] is repo root
    return Path(__file__).resolve().parents[3]


def parse_env_file(path: Path) -> dict[str, str]:
    """Parse KEY=VALUE lines; skip blanks and comments; strip optional quotes."""
    values: dict[str, str] = {}
    text = path.read_text(encoding="utf-8")
    for raw_line in text.splitlines():
        line = raw_line.rstrip("\r")
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        if "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        if not key or not key.replace("_", "").isalnum() or key[0].isdigit():
            continue
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
            value = value[1:-1]
        values[key] = value
    return values


def load_shared_env(repo_root: Path | None = None) -> SharedScriptEnv:
    """
    Read SOURCE_PROFILE / TARGET_PROFILE from .env.local when present.

    Unknown keys are ignored. Missing file → defaults.
    """
    root = repo_root or find_repo_root()
    local_env = root / ".env.local"
    if not local_env.is_file():
        return SharedScriptEnv()

    values = parse_env_file(local_env)
    return SharedScriptEnv(
        source_profile=values.get("SOURCE_PROFILE") or "development",
        target_profile=values.get("TARGET_PROFILE") or "staging",
    )


def resolve_db_setting(
    key: str,
    file_values: Mapping[str, str],
    environ: Mapping[str, str] | None = None,
) -> str:
    """
    Resolve one DB_* setting from the profile file and/or the process environment.

    For DB_USER / DB_PASSWORD / DB_HOST: non-empty file value wins; otherwise a
    non-empty process env value is used (shell can fill blanks for staging/prod).
    Other keys: profile file only.
    """
    env = os.environ if environ is None else environ
    from_file = (file_values.get(key) or "").strip()
    if from_file:
        return from_file
    if key in _SHELL_FILLABLE_DB_KEYS:
        from_shell = (env.get(key) or "").strip()
        if from_shell:
            return from_shell
    return ""


def load_db_profile(
    profile: str,
    repo_root: Path | None = None,
    environ: Mapping[str, str] | None = None,
) -> DbProfile:
    """Load .env.<profile>, optionally filling blank sensitive keys from the environment."""
    if not profile:
        raise IncompleteDbProfile("profile name is required")

    root = repo_root or find_repo_root()
    path = root / f".env.{profile}"
    if not path.is_file():
        raise MissingDbProfile(
            f"Missing profile file: .env.{profile}\n"
            "   Create it from the schema in .env.example."
        )

    file_values = parse_env_file(path)
    resolved = {
        key: resolve_db_setting(key, file_values, environ=environ)
        for key in _REQUIRED_DB_KEYS
    }
    # Non-required keys stay file-only
    for key in ("DB_PORT", "DB_OPTIONS", "DB_SSL", "DB_NAME_TEST", "DB_CONTAINER"):
        resolved[key] = (file_values.get(key) or "").strip()

    missing: list[str] = []
    for key in _REQUIRED_DB_KEYS:
        if resolved[key]:
            continue
        if key in _SHELL_FILLABLE_DB_KEYS:
            missing.append(
                f"{key} (set in .env.{profile} or export {key} in the shell)"
            )
        else:
            missing.append(f"{key} (from .env.{profile})")

    if missing:
        joined = "\n".join(f"   - {item}" for item in missing)
        raise IncompleteDbProfile(
            f"Profile .env.{profile} is missing required values:\n{joined}\n"
            "   See .env.example for the DB profile schema."
        )

    return DbProfile(
        name=profile,
        user=resolved["DB_USER"],
        password=resolved["DB_PASSWORD"],
        host=resolved["DB_HOST"],
        database=resolved["DB_NAME"],
        port=resolved.get("DB_PORT") or "5432",
        options=resolved.get("DB_OPTIONS") or "",
        ssl=resolved.get("DB_SSL") or "",
        database_test=resolved.get("DB_NAME_TEST") or "",
        container=resolved.get("DB_CONTAINER") or "",
    )

def compose_database_url(profile: DbProfile) -> str:
    """Build postgresql://… from discrete parts (password URL-encoded)."""
    user = quote(profile.user, safe="")
    password = quote(profile.password, safe="")
    port = profile.port or "5432"
    url = (
        f"postgresql://{user}:{password}"
        f"@{profile.host}:{port}/{profile.database}"
    )
    if profile.options:
        url = f"{url}?{profile.options}"
    return url


def describe_db_profile(profile: DbProfile) -> str:
    """Human-readable identity without the password."""
    port = profile.port or "5432"
    base = f"{profile.user}@{profile.host}:{port}/{profile.database}"
    if profile.container:
        return f"{base} (container {profile.container})"
    return base


def require_source_container(profile: DbProfile) -> None:
    """Fail when the source profile has no Docker container for pg_dump/psql."""
    if not profile.container:
        raise IncompleteDbProfile(
            "SOURCE profile must set DB_CONTAINER (docker container for pg_dump/psql).\n"
            "   Usually .env.development with DB_CONTAINER=emma_companionship_db"
        )
