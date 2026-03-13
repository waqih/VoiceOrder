#!/bin/bash
# VoiceOrder AI - EC2 Server Deployment Script
# Run on a fresh Ubuntu 24.04 (t2.micro free tier)
# Usage: sudo bash ec2-setup.sh

set -euo pipefail

APP_USER="voiceorder"
APP_DIR="/opt/voiceorder/server"
REPO_URL="${REPO_URL:-}"  # Set before running, or clone manually

echo "=== VoiceOrder AI - EC2 Setup ==="

# 1. System updates
echo "[1/7] Updating system packages..."
apt-get update -y && apt-get upgrade -y
apt-get install -y curl git build-essential libssl-dev libffi-dev python3.12 python3.12-venv python3.12-dev

# 2. Install uv (Python package manager)
echo "[2/7] Installing uv..."
curl -LsSf https://astral.sh/uv/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"

# 3. Create app user and directory
echo "[3/7] Creating app user and directory..."
id -u "$APP_USER" &>/dev/null || useradd --system --create-home --shell /bin/bash "$APP_USER"
mkdir -p "$APP_DIR"

# 4. Clone or copy the server code
echo "[4/7] Setting up server code..."
if [ -n "$REPO_URL" ]; then
    git clone "$REPO_URL" /tmp/voiceorder-repo
    cp -r /tmp/voiceorder-repo/server/* "$APP_DIR/"
    rm -rf /tmp/voiceorder-repo
else
    echo "  REPO_URL not set. Please copy server/ contents to $APP_DIR manually."
    echo "  Example: scp -r server/* ec2-user@<ec2-ip>:$APP_DIR/"
fi

chown -R "$APP_USER:$APP_USER" "$APP_DIR"

# 5. Install Python dependencies
echo "[5/7] Installing Python dependencies..."
cd "$APP_DIR"
sudo -u "$APP_USER" bash -c 'export PATH="$HOME/.local/bin:/root/.local/bin:$PATH" && cd /opt/voiceorder/server && uv sync --no-dev'

# 6. Create .env file template (if not exists)
echo "[6/7] Creating .env template..."
if [ ! -f "$APP_DIR/.env" ]; then
    cat > "$APP_DIR/.env" << 'ENVEOF'
# === DATABASE (Neon) ===
DATABASE_URL=postgresql+asyncpg://YOUR_NEON_USER:YOUR_NEON_PASSWORD@YOUR_NEON_HOST/voiceorder
DB_SSL_REQUIRED=true
DB_POOL_SIZE=5
DB_MAX_OVERFLOW=5

# === SERVER ===
SERVER_DEBUG=false
SERVER_HOST=0.0.0.0
SERVER_PORT=8000
SERVER_CORS_ORIGINS=http://localhost:3000

# === JWT (generate with: openssl rand -hex 32) ===
JWT_SECRET_KEY=CHANGE_ME_RUN_openssl_rand_hex_32
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7
ENVEOF
    chown "$APP_USER:$APP_USER" "$APP_DIR/.env"
    echo "  Created $APP_DIR/.env — EDIT THIS with your Neon credentials!"
fi

# 7. Create systemd service
echo "[7/7] Creating systemd service..."
cat > /etc/systemd/system/voiceorder.service << 'SERVICEEOF'
[Unit]
Description=VoiceOrder AI FastAPI Server
After=network.target

[Service]
Type=simple
User=voiceorder
Group=voiceorder
WorkingDirectory=/opt/voiceorder/server
Environment="PATH=/home/voiceorder/.local/bin:/usr/local/bin:/usr/bin:/bin"
ExecStart=/home/voiceorder/.local/bin/uv run uvicorn voiceorder_server.main:app --host 0.0.0.0 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SERVICEEOF

systemctl daemon-reload
systemctl enable voiceorder

echo ""
echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "  1. Edit /opt/voiceorder/server/.env with your Neon DATABASE_URL"
echo "  2. Generate JWT secret: openssl rand -hex 32"
echo "  3. Run migrations: cd $APP_DIR && sudo -u $APP_USER uv run alembic upgrade head"
echo "  4. Start the server: sudo systemctl start voiceorder"
echo "  5. Check status: sudo systemctl status voiceorder"
echo "  6. View logs: sudo journalctl -u voiceorder -f"
echo "  7. Test: curl http://localhost:8000/health"
echo ""
