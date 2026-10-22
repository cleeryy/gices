#!/bin/sh
# Production entrypoint: apply Prisma migrations first, then start the app.
# Uses the Prisma CLI embedded in the image (pinned at build time, same version
# as the lockfile). No npx, no network needed at runtime.
# Any migration failure aborts before the server starts (fail-fast via set -e).
set -e

echo "[entrypoint] Running Prisma migrations..."
node /app/node_modules/prisma/build/index.js migrate deploy
echo "[entrypoint] Migrations applied, starting app..."

exec "$@"
