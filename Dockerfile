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

# Production runtime dependencies: locked install without devDeps.
# `prisma` is an exact production dependency, so `npm ci --omit=dev`
# installs the full CLI closure (integrity-checked via the lockfile).
FROM base AS production-deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

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

# Copy Prisma schema (migrations run from here at container start)
COPY --from=build --chown=nextjs:nodejs /app/prisma ./prisma/

# Runtime node_modules comes from the locked production-deps stage
# (standalone server needs its traced deps; prisma CLI needs its closure).
# Then overlay the generated client AFTER: `npm ci` recreates node_modules,
# so the overlay must come last, never before an install.
COPY --from=production-deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Entrypoint: migrations first (fail-fast), then exec the CMD
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x ./docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENV HOSTNAME="0.0.0.0"
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "server.js"]
