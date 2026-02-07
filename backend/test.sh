#!/usr/bin/env bash
# ──────────────────────────────────────────
# PWellTrack Backend - Run Tests
# ──────────────────────────────────────────
set -e

cd "$(dirname "$0")"

if [ -d "venv" ]; then
    source venv/bin/activate
fi

echo "Running tests..."
echo ""
python -m pytest tests/ -v --tb=short "$@"
