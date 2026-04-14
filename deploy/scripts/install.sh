#!/usr/bin/env bash
# install.sh — First-time deployment of Project Dashboard (013)
# Run from local machine: bash deploy/scripts/install.sh
set -euo pipefail

SERVER="root@66.63.173.143"
BACKEND_DIR="/opt/project-dashboard"
FRONTEND_DIR="/var/www/dashboard.licheng.website"
REPO_URL="https://github.com/LeeDaud/013-project-dashboard.git"

echo "=== [1/6] Building frontend locally ==="
cd "$(dirname "$0")/../../frontend"
npm ci --prefer-offline
npm run build
echo "Frontend built at: $(pwd)/dist"

echo "=== [2/6] Uploading frontend to server ==="
ssh "$SERVER" "mkdir -p $FRONTEND_DIR"
rsync -av --delete dist/ "$SERVER:$FRONTEND_DIR/"

echo "=== [3/6] Setting up backend on server ==="
ssh "$SERVER" bash <<EOF
set -euo pipefail
mkdir -p $BACKEND_DIR
cd $BACKEND_DIR

# Clone or pull
if [ -d .git ]; then
  git pull --ff-only origin main
else
  git clone $REPO_URL .
fi

cd backend
npm ci --omit=dev
npm run build

# Create .env if not exists
if [ ! -f $BACKEND_DIR/.env ]; then
  cat > $BACKEND_DIR/.env <<ENVEOF
PORT=3013
MD_FILE_PATH=/root/AAA-Project/000-VPS/server-projects-overview.md
FRONTEND_ORIGIN=https://dashboard.licheng.website
HEALTH_CHECK_INTERVAL_MS=60000
ENVEOF
  echo "Created .env — review and adjust if needed"
fi
EOF

echo "=== [4/6] Installing systemd service ==="
scp deploy/systemd/project-dashboard.service "$SERVER:/etc/systemd/system/"
ssh "$SERVER" "systemctl daemon-reload && systemctl enable --now project-dashboard"

echo "=== [5/6] Installing Nginx config ==="
scp deploy/nginx/dashboard.licheng.website.conf "$SERVER:/etc/nginx/sites-enabled/"
ssh "$SERVER" "nginx -t && systemctl reload nginx"

echo "=== [6/6] Requesting SSL certificate ==="
ssh "$SERVER" "certbot --nginx -d dashboard.licheng.website --non-interactive --agree-tos -m admin@licheng.website || true"

echo ""
echo "Done. Visit: https://dashboard.licheng.website"
echo "Check backend: ssh $SERVER 'systemctl status project-dashboard'"
