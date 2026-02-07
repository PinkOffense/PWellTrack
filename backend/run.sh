#!/usr/bin/env bash
# ──────────────────────────────────────────
# PWellTrack Backend - Local Run Script
# ──────────────────────────────────────────
set -e

cd "$(dirname "$0")"

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}╔══════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     PWellTrack API - Local Setup     ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════╝${NC}"
echo ""

# 1. Create virtual environment if needed
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}[1/3] Creating virtual environment...${NC}"
    python3 -m venv venv
else
    echo -e "${GREEN}[1/3] Virtual environment exists ✓${NC}"
fi

# 2. Activate and install dependencies
echo -e "${YELLOW}[2/3] Installing dependencies...${NC}"
source venv/bin/activate
pip install -q -r requirements.txt

# 3. Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}[3/3] Creating .env file...${NC}"
    SECRET=$(python3 -c "import secrets; print(secrets.token_hex(32))")
    cat > .env <<EOF
DATABASE_URL=sqlite+aiosqlite:///./pwelltrack.db
SECRET_KEY=${SECRET}
EOF
    echo -e "${GREEN}       .env created with random SECRET_KEY ✓${NC}"
else
    echo -e "${GREEN}[3/3] .env exists ✓${NC}"
fi

echo ""
echo -e "${GREEN}Starting server...${NC}"
echo -e "${CYAN}  API:     http://localhost:8000${NC}"
echo -e "${CYAN}  Swagger: http://localhost:8000/docs${NC}"
echo -e "${CYAN}  ReDoc:   http://localhost:8000/redoc${NC}"
echo -e "${CYAN}  Health:  http://localhost:8000/health${NC}"
echo ""

# Run with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
