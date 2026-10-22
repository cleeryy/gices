# syntax = docker/dockerfile:1

# Base stage
FROM node:22-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Dependencies stage
FROM base AS dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Build stage
FROM base AS build
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
COPY prisma/ ./prisma/


# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM base AS production
ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create .next directory with proper permissions
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy built application
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public

# Copy Prisma files (schema + generated client)
COPY --from=build --chown=nextjs:nodejs /app/prisma ./prisma/
COPY --from=build --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Embed the pinned Prisma CLI at build time so `migrate deploy` runs offline
# without npx (npx would resolve the v8 unified CLI where `migrate` no longer
# exists). A partial COPY of node_modules/prisma is NOT sufficient: prisma@6.x
# depends on top-level packages (@prisma/config -> c12, effect, deepmerge-ts,
# read-package-up, plus their transitive deps), so hand-copying is fragile.
# A targeted build-time install driven by the committed lockfile (prisma is
# pinned exact in package.json/package-lock.json), so the full closure is
# integrity-checked and reproducible; --omit=dev keeps the runtime tree small.
COPY --chown=nextjs:nodejs package.json package-lock.json ./
RUN npm install --omit=dev --no-save --no-audit --no-fund \
  && chown -R nextjs:nodejs /app/node_modules /app/prisma

# Entrypoint: migrations first (fail-fast), then exec the CMD
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x ./docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENV HOSTNAME="0.0.0.0"
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "server.js"]
