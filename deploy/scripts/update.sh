#!/usr/bin/env bash
# update.sh — Update Project Dashboard on server
# Run from local machine: bash deploy/scripts/update.sh
set -euo pipefail

SERVER="root@66.63.173.143"
BACKEND_DIR="/opt/project-dashboard"
FRONTEND_DIR="/var/www/dashboard.licheng.website"

echo "=== [1/4] Building frontend locally ==="
cd "$(dirname "$0")/../../frontend"
npm ci --prefer-offline
npm run build

echo "=== [2/4] Uploading frontend ==="
rsync -av --delete dist/ "$SERVER:$FRONTEND_DIR/"

echo "=== [3/4] Updating backend ==="
ssh "$SERVER" bash <<EOF
set -euo pipefail
cd $BACKEND_DIR
git pull --ff-only origin main
cd backend
npm ci --omit=dev
npm run build
systemctl restart project-dashboard
EOF

echo "=== [4/4] Verifying ==="
sleep 2
ssh "$SERVER" "systemctl is-active project-dashboard && curl -sf http://127.0.0.1:3013/api/health | grep ok"

echo ""
echo "Update complete. https://dashboard.licheng.website"
