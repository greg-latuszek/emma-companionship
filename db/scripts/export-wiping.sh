#!/usr/bin/env bash
# Export with TRUNCATE header — npm run db:wiping_export
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
if ! command -v python3 >/dev/null 2>&1; then
  echo "❌ python3 not found. Install Python 3.10+ and retry."
  exit 1
fi
if ! python3 -c 'import sys; raise SystemExit(0 if sys.version_info >= (3, 10) else 1)'; then
  echo "❌ Python 3.10+ required (found $(python3 -c 'import sys; print("%d.%d" % sys.version_info[:2])'))."
  exit 1
fi
export PYTHONPATH="${ROOT}/db/scripts${PYTHONPATH:+:$PYTHONPATH}"
exec python3 "${SCRIPT_DIR}/export_db.py" --mode wiping "$@"
