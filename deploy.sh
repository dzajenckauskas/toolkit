#!/bin/bash
set -euo pipefail

# Production deploy for toolkit.zajenckauskas.lt.
#
# The repo is a Turborepo monorepo (ADR-009): dependencies install from the
# ROOT (a single hoisted lockfile) and the build runs through Turbo. This script
# is intentionally layout-detecting so the *transition* deploy — where the
# server still holds the pre-monorepo copy of this file for one run — degrades
# gracefully: with no root lockfile yet it falls back to the old app-local flow.
# Once the monorepo commit is live, every deploy uses the root flow.

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

if [ -f "$REPO_DIR/package-lock.json" ]; then
  echo "→ Monorepo layout detected — installing from root..."
  npm ci
echo "→ Building (turbo)..."
  npm run build
else
  echo "→ Legacy layout — installing in apps/web..."
  cd "$APP_DIR"
  npm ci
  echo "→ Building..."
  npm run build
fi

echo "→ Preparing accessibility runner..."
# The token stays on the VPS and is shared only by the two local processes.
TOKEN_FILE="$REPO_DIR/.accessibility-runner-token"
if [ ! -f "$TOKEN_FILE" ]; then
  umask 077
  openssl rand -hex 32 > "$TOKEN_FILE"
fi
export ACCESSIBILITY_RUNNER_TOKEN
ACCESSIBILITY_RUNNER_TOKEN="$(tr -d '\r\n' < "$TOKEN_FILE")"
export ACCESSIBILITY_RUNNER_URL="http://127.0.0.1:4317"

# Browser files are cached by Playwright, so this is a no-op when the pinned
# Chromium revision is already present. OS packages must be installed once on
# the VPS; see ADR-010.
npx playwright install chromium

echo "→ Restarting service..."
if "$PM2_BIN" describe toolkit >/dev/null 2>&1; then
  "$PM2_BIN" restart toolkit --update-env
else
  "$PM2_BIN" start npm --name "toolkit" --cwd "$APP_DIR" -- run start
fi
if "$PM2_BIN" describe toolkit-accessibility-runner >/dev/null 2>&1; then
  "$PM2_BIN" restart toolkit-accessibility-runner --update-env
else
  "$PM2_BIN" start npm --name "toolkit-accessibility-runner" --cwd "$REPO_DIR/apps/accessibility-runner" -- run start
fi
"$PM2_BIN" save

echo "✓ Deploy complete"
