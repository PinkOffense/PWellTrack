FROM python:3.12-slim

WORKDIR /app

# Install dependencies first (layer caching — only rebuilds when requirements change)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Render injects $PORT at runtime (default 8000 for local testing)
EXPOSE ${PORT:-8000}

# Run migrations then start uvicorn
CMD sh -c '\
  MAX_ATTEMPTS=3; \
  for i in $(seq 1 $MAX_ATTEMPTS); do \
    echo "Running alembic upgrade head (attempt $i/$MAX_ATTEMPTS)..."; \
    if alembic upgrade head; then echo "Migrations applied successfully."; break; fi; \
    if [ "$i" -lt "$MAX_ATTEMPTS" ]; then echo "Migration failed, retrying in 10s..."; sleep 10; \
    else echo "WARNING: Migrations failed after $MAX_ATTEMPTS attempts. Proceeding anyway."; fi; \
  done && \
  uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}'
