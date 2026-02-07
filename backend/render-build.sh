#!/usr/bin/env bash
set -o errexit

pip install --upgrade pip
pip install -r requirements.txt

# Run Alembic migrations (if configured) or let auto-create handle it
# alembic upgrade head
