#!/usr/bin/env bash
set -o errexit

pip install --upgrade pip
pip install -r requirements.txt

# Run database migrations (retry up to 3 times — Supabase free tier may
# need a few seconds to wake up before accepting connections).
MAX_ATTEMPTS=3
for i in $(seq 1 $MAX_ATTEMPTS); do
  echo "Running alembic upgrade head (attempt $i/$MAX_ATTEMPTS)..."
  if alembic upgrade head; then
    echo "Migrations applied successfully."
    break
  fi
  if [ "$i" -lt "$MAX_ATTEMPTS" ]; then
    echo "Migration failed, retrying in 10s..."
    sleep 10
  else
    echo "WARNING: Migrations failed after $MAX_ATTEMPTS attempts. Proceeding anyway."
    echo "The app will start but may encounter errors if the schema is outdated."
  fi
done
