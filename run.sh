#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$ROOT_DIR/backend"
npm install
npx prisma generate
npx prisma migrate deploy

cd "$ROOT_DIR/frontend"
npm install

cd "$ROOT_DIR"

trap 'kill 0' EXIT

(cd backend && npm run start:dev) &
(cd frontend && npm run dev -- --host 0.0.0.0) &

wait
