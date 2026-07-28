#!/bin/bash
set -euo pipefail

export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm use 22 >/dev/null

REPO_DIR="/var/www/toolkit"
APP_DIR="$REPO_DIR/apps/web"
PM2_BIN="$(command -v pm2)"

if [ -z "${PM2_BIN:-}" ] || [ ! -x "$PM2_BIN" ]; then
  echo "PM2 binary not found" >&2
  exit 1
fi

cd "$REPO_DIR"

echo "→ Pulling latest code..."
git fetch origin main
git reset --hard origin/main

cd "$APP_DIR"

echo "→ Installing dependencies..."
npm ci

echo "→ Building..."
npm run build

echo "→ Restarting service..."
if "$PM2_BIN" describe toolkit >/dev/null 2>&1; then
  "$PM2_BIN" restart toolkit
else
  "$PM2_BIN" start npm --name "toolkit" --cwd "$APP_DIR" -- run start
fi
"$PM2_BIN" save

echo "✓ Deploy complete"
